import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import dbConnect from "@/lib/database"
import Reader from "@/models/Reader"
import { sendNotification } from "@/services/notification-service"

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
    const userId = session.userId

    await dbConnect()
    const reader = await Reader.findById(id)
      .populate("userId", "name email")

    if (!reader) {
      return new NextResponse("Reader not found", { status: 404 })
    }

    // Update reader status
    reader.isApproved = true
    reader.approvedAt = new Date()
    reader.approvedBy = userId
    await reader.save()

    // Send notification to reader
    await sendNotification({
      userId: reader.userId._id,
      type: "reading_accepted", // Using reading_accepted as it's the closest match
      message: "Your reader application has been approved! You can now start accepting reading requests.",
      data: {
        readerId: reader._id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[READER_APPROVE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
