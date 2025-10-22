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

    // Update reader status
    reader.isApproved = true
    reader.status = 'approved'
    reader.approvedAt = new Date()
    reader.approvedBy = adminUserId
    await reader.save()

    // Send notification to reader
    await sendNotification({
      userId: reader.userId, // This is the Clerk user ID
      type: NotificationType.READING_IN_PROGRESS,
      message: "Your reader application has been approved! You can now start accepting reading requests.",
      data: {
        readerId: reader._id
      }
    })

    return NextResponse.json({ success: true, reader })
  } catch (error) {
    console.error("[READER_APPROVE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
