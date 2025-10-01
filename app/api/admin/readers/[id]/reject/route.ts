import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import dbConnect from "@/lib/database"
import Reader from "@/models/Reader"
import { sendNotification } from "@/services/notification-service"
import { NotificationType } from "@/models/Notification"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth()
    if (!session || !session.userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await dbConnect()
    const reader = await Reader.findById(id)
      .populate("userId", "name email")

    if (!reader) {
      return new NextResponse("Reader not found", { status: 404 })
    }

    // Delete reader application
    await Reader.findByIdAndDelete(id)

    // Send notification to reader
    await sendNotification({
      userId: reader.userId._id,
      type: NotificationType.READING_DECLINED,
      message: "Your reader application has not been approved at this time. You may submit a new application after addressing the feedback provided.",
      data: {
        readerId: reader._id,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[READER_REJECT]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
