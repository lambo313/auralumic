import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import dbConnect from "@/lib/database"
import { z } from "zod"
import { validateCredits, calculateCreditCost } from "@/lib/credit-validation"
import { AvailabilityService } from "@/services/availability-service"
import { sendNotification } from "@/services/notification-service"
import Reading, { ReadingStatus, Topic } from "@/models/Reading"
import { ScheduledReading } from "@/models/ScheduledReading"
import { NotificationType } from "@/models/Notification"

// Enhanced validation schema
const createReadingSchema = z.object({
  readerId: z.string(),
  topic: z.enum(['Career & Work', 'Lost & Seeking', 'Love & Relationships', 'Past Life', 'Life Path', 'Future Life']),
  question: z.string().optional(),
  readingOption: z.object({
    type: z.enum(['phone_call', 'video_message', 'live_video']),
    basePrice: z.number().min(1),
    timeSpan: z.object({
      duration: z.number().min(15).max(120),
      label: z.string(),
      multiplier: z.number().min(1)
    }),
    finalPrice: z.number().min(1)
  }),
  scheduledDate: z.string().transform(str => new Date(str)).optional(),
  timeZone: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    await dbConnect()

    const query = {
      $or: [{ clientId: userId }, { readerId: userId }],
      ...(status && { status }),
    };

    const total = await Reading.countDocuments(query);
    const readings = await Reading.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "scheduledReading",
        model: ScheduledReading,
      });

    return NextResponse.json({
      readings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[READINGS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await request.json();
    const body = createReadingSchema.parse(json);

    await dbConnect();

    // Validate user has enough credits
    await validateCredits(userId, body.readingOption.finalPrice);

    // Check reader availability (if scheduled)
    let isAvailable = true;
    if (body.scheduledDate) {
      isAvailable = await AvailabilityService.checkReaderAvailability(
        body.readerId,
        body.scheduledDate,
        body.readingOption.timeSpan.duration
      );
    }

    if (!isAvailable) {
      return new NextResponse("Reader is not available at the selected time", {
        status: 400,
      });
    }

    // Create the reading request
    const reading = await Reading.create({
      clientId: userId,
      readerId: body.readerId,
      topic: body.topic,
      question: body.question,
      readingOption: body.readingOption,
      scheduledDate: body.scheduledDate,
      status: ReadingStatus.REQUESTED,
      credits: body.readingOption.finalPrice,
    });

    // Create the scheduled reading only if we have a scheduled date
    let scheduledReading = null;
    if (body.scheduledDate && body.timeZone) {
      scheduledReading = await ScheduledReading.create({
        readingId: reading._id,
        scheduledDate: body.scheduledDate,
        timeZone: body.timeZone,
      });
    }

    // Send notification to reader using NEW_COMMENT as closest available type
    // TODO: Add READING_REQUEST to NotificationType enum in the model
    await sendNotification({
      userId: body.readerId,
      type: NotificationType.NEW_COMMENT,
      message: "You have a new reading request",
      data: {
        readingId: reading._id.toString(),
        readerId: body.readerId
      },
    });

    return NextResponse.json({
      reading: {
        ...reading.toObject(),
        ...(scheduledReading && { scheduledReading: scheduledReading.toObject() }),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("[READINGS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
