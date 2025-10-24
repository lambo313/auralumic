import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import dbConnect from "@/lib/database"
import { z } from "zod"
import { deductCredits, refundCredits } from "@/lib/credit-validation"
import Reading from "@/models/Reading"
import User from "@/models/User"

const updateReadingSchema = z.object({
  question: z.string().optional(),
  readingOption: z.object({
    type: z.enum(['phone_call', 'video_message', 'live_video']),
    basePrice: z.number().min(1),
    timeSpan: z.object({
      duration: z.number().min(15).max(120),
      label: z.string(),
      multiplier: z.number().min(0).max(2)
    }),
    finalPrice: z.number().min(1)
  }).optional(),
  scheduledDate: z.string().transform(str => new Date(str)).optional(),
  title: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const reading = await Reading.findById(id);
    if (!reading) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 });
    }

    // Ensure user is either the client or reader
    if (reading.clientId !== userId && reading.readerId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Transform _id to id for frontend consistency
    const readingObj = reading.toObject() as Record<string, unknown>;
    readingObj.id = readingObj._id?.toString();
    delete readingObj._id;

    // Include title in the response
    readingObj.title = reading.title;

    return NextResponse.json(readingObj);
  } catch (error) {
    console.error("Error fetching reading:", error);
    return NextResponse.json(
      { error: "Failed to fetch reading" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const reading = await Reading.findById(id);
    if (!reading) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 });
    }

    const body = await request.json();

    // Allow client to edit pending readings, and reader to update status/readingLink
    const isClient = reading.clientId === userId;
    const isReader = reading.readerId === userId;

  // Diagnostic logging removed in production - use request tracing or
  // explicit debug mode to inspect request payloads when needed.

    // If the authenticated user is the reader, prefer reader-handling first.
    // This prevents situations where both IDs match (edge cases) but the
    // request should be handled as a reader action.
    if (isReader) {
      const allowedStatusUpdates = ["in_progress", "archived"];

      // Build updateData defensively. Readers should be allowed to:
      // - update their readingLink while the reading is in_progress
      // - change status to in_progress or archived
      const updateData: Record<string, unknown> = { updatedAt: new Date() };

      // Allow updating readingLink if either the reading is already in_progress
      // or the incoming request is setting status to in_progress.
      if (body.readingLink) {
        if (reading.status === "in_progress" || body.status === "in_progress") {
          updateData.readingLink = body.readingLink;
        } else {
          return NextResponse.json(
            { error: "Cannot update readingLink unless reading is (or will be) in_progress", details: { field: "readingLink" } },
            { status: 400 }
          );
        }
      }

      if (body.status) {
        if (!allowedStatusUpdates.includes(body.status)) {
          return NextResponse.json(
            { error: "Invalid status update", details: { provided: body.status } },
            { status: 400 }
          );
        }
        updateData.status = body.status;
      }

      // If nothing valid to update, return an error
      const keysToUpdate = Object.keys(updateData).filter(k => k !== 'updatedAt');
      if (keysToUpdate.length === 0) {
        return NextResponse.json(
          { error: "No valid fields to update" },
          { status: 400 }
        );
      }

      const updatedReading = await Reading.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      return NextResponse.json({ reading: updatedReading });
    }

    if (isClient) {
      const editableStatuses = ["instant_queue", "scheduled", "message_queue"];

      // Allow limited "soft" updates (title, notes, question) even when the
      // reading has progressed (e.g. in_progress). Full edits that change
      // pricing, duration, schedule or credits must still be blocked.
      const softEditableFields = ["title", "notes", "question"];
      const bodyKeys = Object.keys(body || {});
      const onlySoftUpdates = bodyKeys.length > 0 && bodyKeys.every((k) => softEditableFields.includes(k));

      if (!editableStatuses.includes(reading.status) && !onlySoftUpdates) {
        // Determine which fields are not allowed in the current status so the
        // client can present a clearer error message.
        const disallowedFields = bodyKeys.filter((k) => !softEditableFields.includes(k));
        return NextResponse.json(
          { error: "Cannot edit reading in current status", details: { disallowedFields } },
          { status: 400 }
        );
      }

      const validatedData = updateReadingSchema.parse(body);

      let creditDifference = 0;
      if (validatedData.readingOption) {
        const oldCredits = reading.credits;
        const newCredits = validatedData.readingOption.finalPrice;
        creditDifference = newCredits - oldCredits;
      }

      let newCreditBalance;
      if (creditDifference > 0) {
        const creditCheck = await deductCredits(userId, creditDifference);
        if (!creditCheck.success) {
          return NextResponse.json(
            { error: "Insufficient credits for update" },
            { status: 400 }
          );
        }
        newCreditBalance = creditCheck.newBalance;
      } else if (creditDifference < 0) {
        const creditCheck = await refundCredits(userId, Math.abs(creditDifference));
        if (!creditCheck.success) {
          return NextResponse.json(
            { error: "Failed to process credit refund" },
            { status: 500 }
          );
        }
        newCreditBalance = creditCheck.newBalance;
      } else {
        const user = await User.findOne({ clerkUserId: userId });
        newCreditBalance = user?.credits || 0;
      }

      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (validatedData.question !== undefined) {
        updateData.question = validatedData.question;
      }

      if (validatedData.readingOption) {
        updateData.readingOption = validatedData.readingOption;
        updateData.credits = validatedData.readingOption.finalPrice;
      }

      if (validatedData.scheduledDate) {
        updateData.scheduledDate = validatedData.scheduledDate;
      }

      if (validatedData.title !== undefined) {
        updateData.title = validatedData.title;
      }

      if (validatedData.notes !== undefined) {
        updateData.notes = validatedData.notes;
      }

      const updatedReading = await Reading.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      return NextResponse.json({
        reading: updatedReading,
        creditBalance: newCreditBalance,
        creditDifference,
      });
    }

    if (isReader) {
      const allowedStatusUpdates = ["in_progress", "archived"];
      if (!body.status || !allowedStatusUpdates.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status update", details: { provided: body.status } },
          { status: 400 }
        );
      }

      const updateData: Record<string, unknown> = {
        status: body.status,
        updatedAt: new Date(),
      };
      if (body.readingLink) {
        updateData.readingLink = body.readingLink;
      }

      const updatedReading = await Reading.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      return NextResponse.json({
        reading: updatedReading,
      });
    }

    return new NextResponse("Forbidden", { status: 403 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update reading" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await params
    await dbConnect()

    const reading = await Reading.findById(id)
    if (!reading) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 })
    }

    // Only client can cancel their own reading
    if (reading.clientId !== userId) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Can only cancel pending readings
    const cancellableStatuses = ['instant_queue', 'scheduled', 'message_queue']
    if (!cancellableStatuses.includes(reading.status)) {
      return NextResponse.json(
        { error: "Cannot cancel reading in current status" },
        { status: 400 }
      )
    }

    // Refund credits
    const creditCheck = await refundCredits(userId, reading.credits)
    if (!creditCheck.success) {
      return NextResponse.json(
        { error: "Failed to process credit refund" },
        { status: 500 }
      )
    }

    // Update reading status to refunded instead of deleting
    await Reading.findByIdAndUpdate(id, {
      $set: {
        status: 'refunded',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: "Reading cancelled and credits refunded",
      creditBalance: creditCheck.newBalance,
      refundedCredits: reading.credits
    })
  } catch (error) {
    console.error("Error cancelling reading:", error)
    return NextResponse.json(
      { error: "Failed to cancel reading" },
      { status: 500 }
    )
  }
}
