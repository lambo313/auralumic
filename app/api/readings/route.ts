import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import dbConnect from "@/lib/database"
import { z } from "zod"
import { validateCredits, deductCredits } from "@/lib/credit-validation"
import { AvailabilityService } from "@/services/availability-service"
import { sendNotification } from "@/services/notification-service"
import Reading, { ReadingStatus } from "@/models/Reading"
import { ScheduledReading } from "@/models/ScheduledReading"
import { NotificationType } from "@/models/Notification"
import User from "@/models/User"

// Enhanced validation schema
const createReadingSchema = z.object({
  readerId: z.string(),
  topic: z.string(), // Allow any string topic from categories
  question: z.string().optional(),
  readingOption: z.object({
    type: z.enum(['phone_call', 'video_message', 'live_video']),
    basePrice: z.number().min(1),
    timeSpan: z.object({
      duration: z.number().min(15).max(120),
      label: z.string(),
      multiplier: z.number().min(0).max(2) // Allow discounts (0.8) and premiums (1.2)
    }),
    finalPrice: z.number().min(1)
  }),
  scheduledDate: z.string().min(1).transform(str => new Date(str)).optional(),
  timeZone: z.string().optional(),
  status: z.enum(['instant_queue', 'scheduled', 'message_queue']).optional(),
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
      .limit(limit);

    // Fetch scheduled readings separately for readings that have scheduledDate
    const readingsWithScheduleInfo = await Promise.all(
      readings.map(async (reading) => {
        const readingObj = reading.toObject() as Record<string, unknown>;
        
        // If this reading has a scheduledDate, fetch the corresponding ScheduledReading
        if (reading.scheduledDate) {
          const scheduledReading = await ScheduledReading.findOne({ readingId: reading._id });
          if (scheduledReading) {
            readingObj.scheduledReading = scheduledReading.toObject();
          }
        }
        
        return readingObj;
      })
    );

    return NextResponse.json({
      readings: readingsWithScheduleInfo,
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

    // Deduct credits from user account
    const creditResult = await deductCredits(userId, body.readingOption.finalPrice);

    try {
      // Create the reading request
      // Determine status based on the request
      let status = ReadingStatus.INSTANT_QUEUE; // default
      if (body.status && Object.values(ReadingStatus).includes(body.status as ReadingStatus)) {
        status = body.status as ReadingStatus;
      } else if (body.scheduledDate) {
        status = ReadingStatus.SCHEDULED;
      } else if (body.readingOption?.type === 'video_message') {
        status = ReadingStatus.MESSAGE_QUEUE;
      }

      const reading = await Reading.create({
        clientId: userId,
        readerId: body.readerId,
        topic: body.topic,
        question: body.question,
        readingOption: body.readingOption,
        scheduledDate: body.scheduledDate,
        status: status,
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

      // Send notification to reader
      await sendNotification({
        userId: body.readerId,
        type: NotificationType.READING_REQUEST,
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
        creditBalance: creditResult.newBalance,
      });
    } catch (error) {
      // If reading creation fails after credits were deducted, we should refund the credits
      console.error("[READINGS_POST] Error after credit deduction:", error);
      
      // Attempt to refund credits
      try {
        const user = await User.findOne({ clerkId: userId });
        if (user) {
          user.credits += body.readingOption.finalPrice;
          await user.save();
        }
      } catch (refundError) {
        console.error("[READINGS_POST] Failed to refund credits:", refundError);
      }
      
      throw error; // Re-throw the original error
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[READINGS_POST] Zod validation error:", error.issues);
      return NextResponse.json(
        { 
          error: "Invalid request data", 
          details: error.issues 
        }, 
        { status: 422 }
      );
    }

    console.error("[READINGS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
