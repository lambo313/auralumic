import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import Reading from "@/models/Reading";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().max(2000).optional(),
});

export async function POST(
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

    // Only the client who owns the reading may submit a review
    if (reading.clientId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Reviews can only be submitted for archived readings
    const currentStatus = String(reading.status);
    if (currentStatus !== "archived") {
      return NextResponse.json(
        { error: "Cannot submit review for reading in current status", details: { status: reading.status } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = reviewSchema.parse(body);

    // Persist the review
    reading.review = {
      rating: parsed.rating,
      review: parsed.review,
    };
    reading.updatedAt = new Date();
    await reading.save();

    return NextResponse.json({ review: reading.review });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.issues }, { status: 400 });
    }

    console.error("Error saving reading review:", error);
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }
}
