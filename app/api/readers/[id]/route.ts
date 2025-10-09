import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import dbConnect from "@/lib/database"
import Reader from "@/models/Reader"
import Review from "@/models/Review"
import { getMockReaderById } from "@/components/readers/mock-reader-data"
import mongoose from "mongoose"

interface LeanReaderDocument {
  _id: mongoose.Types.ObjectId;
  userId: string;
  isApproved: boolean;
  [key: string]: unknown;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await context.params

    console.log("GET /api/readers/[id] - userId from auth:", userId, "requested id:", id);

    await dbConnect()

    // Try to find reader by MongoDB _id first (only if it's a valid ObjectId)
    let reader: LeanReaderDocument | null = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      reader = await Reader.findById(id)
        .select('-__v')
        .lean() as LeanReaderDocument | null;
      console.log("Reader found by _id:", reader ? "yes" : "no");
    }

    // If not found by _id, try by userId (for backward compatibility)
    if (!reader) {
      reader = await Reader.findOne({ userId: id })
        .select('-__v')
        .lean() as LeanReaderDocument | null;
      console.log("Reader found by userId:", reader ? "yes" : "no");
    }

    if (reader) {
      console.log("Reader isApproved:", reader.isApproved, "reader.userId:", reader.userId);
    }

    // If no reader found in database, try mock data
    if (!reader) {
      const mockReader = getMockReaderById(id)
      if (mockReader) {
        // Check if mock reader is approved
        if (!mockReader.isApproved) {
          return new NextResponse("Reader not found", { status: 404 })
        }
        // Convert mock reader to API format
        return NextResponse.json({
          ...mockReader,
          createdAt: mockReader.createdAt.toISOString(),
          lastActive: mockReader.lastActive.toISOString(),
          updatedAt: mockReader.updatedAt?.toISOString() || mockReader.createdAt.toISOString()
        })
      }
      return new NextResponse("Reader not found", { status: 404 })
    }

    // Allow access if the reader is approved OR if the authenticated user is the owner
    const isOwner = userId && reader.userId === userId
    console.log("Access check - isOwner:", isOwner, "reader.isApproved:", reader.isApproved);
    
    if (!reader.isApproved && !isOwner) {
      console.log("Access denied - reader not approved and user is not owner");
      return new NextResponse("Reader not found", { status: 404 })
    }

    // Convert _id to id for consistency with frontend expectations
    const formattedReader = {
      ...reader,
      id: reader._id.toString()
    };

    return NextResponse.json(formattedReader)

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

    // Ensure the user is trying to update their own profile
    if (id !== userId) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Check if the reader exists
    let reader = await Reader.findOne({ userId: id })

    // Check if username is being changed and if it's already taken
    if (body.username) {
      const existingUsername = await Reader.findOne({ username: body.username });
      if (existingUsername && existingUsername.userId !== userId) {
        return new NextResponse("Username is already taken", { status: 409 });
      }
    }

    if (!reader) {
      // Create new reader profile if it doesn't exist
      const newReaderData = {
        userId: id,
        username: body.username,
        profileImage: body.profileImage,
        tagline: body.tagline,
        location: body.location,
        experience: body.experience || '',
        additionalInfo: body.additionalInfo || '',
        attributes: body.attributes || { tools: [], abilities: [], style: '' },
        availability: body.availability || {
          schedule: {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
          },
          timezone: 'UTC',
          instantBooking: false
        },
        isApproved: false, // New profiles need approval
        status: 'pending'
      }

      reader = await Reader.create(newReaderData)
    } else {
      // Update existing reader
      reader = await Reader.findByIdAndUpdate(
        reader._id,
        { $set: body },
        { new: true, runValidators: true }
      )
    }

    // Remove __v field from response
    const readerObj = reader.toObject()
    delete readerObj.__v

    return NextResponse.json(readerObj)

  } catch (error) {
    console.error("[READER_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
