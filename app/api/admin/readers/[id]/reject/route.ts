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
    const adminUserId = session.userId

    await dbConnect()
    
    // Find reader by userId (Clerk user ID), not by _id
    const reader = await Reader.findOne({ userId: id })

    if (!reader) {
      return new NextResponse("Reader not found", { status: 404 })
    }

    // Update reader status to rejected instead of deleting
    reader.isApproved = false
    reader.status = 'rejected'
    reader.rejectedAt = new Date()
    reader.rejectedBy = adminUserId
    await reader.save()

    // Send notification to reader
    await sendNotification({
      userId: reader.userId, // This is the Clerk user ID
      type: NotificationType.READER_APPLICATION_REJECTED,
      message: "Your reader application has not been approved at this time. You may submit a new application after addressing the feedback provided.",
      data: {
        readerId: reader._id,
      }
    })

    return NextResponse.json({ success: true, reader })
  } catch (error) {
    console.error("[READER_REJECT]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
