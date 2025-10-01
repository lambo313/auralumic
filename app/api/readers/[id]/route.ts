import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import dbConnect from "@/lib/database"
import Reader from "@/models/Reader"
import Review from "@/models/Review"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await context.params

    await dbConnect()

    const reader = await Reader.findOne({ userId: id })
      .select('-__v')
      .lean() as Record<string, unknown>

    if (!reader) {
      return new NextResponse("Reader not found", { status: 404 })
    }

    // Allow access if the reader is approved OR if the authenticated user is the owner
    const isOwner = userId && reader.userId === userId
    if (!reader.isApproved && !isOwner) {
      return new NextResponse("Reader not found", { status: 404 })
    }

    return NextResponse.json(reader)

  } catch (error) {
    console.error("[READER_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    await dbConnect()

    // Check if the reader belongs to the authenticated user
    const reader = await Reader.findOne({ userId: id })
    if (!reader) {
      return new NextResponse("Reader not found", { status: 404 })
    }

    if (reader.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Check if username is being changed and if it's already taken
    if (body.username && body.username !== reader.username) {
      const existingUsername = await Reader.findOne({ username: body.username });
      if (existingUsername) {
        return new NextResponse("Username is already taken", { status: 409 });
      }
    }

    // Update the reader
    const updatedReader = await Reader.findByIdAndUpdate(
      reader._id,
      { $set: body },
      { new: true, runValidators: true }
    ).select('-__v')

    return NextResponse.json(updatedReader)

  } catch (error) {
    console.error("[READER_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
