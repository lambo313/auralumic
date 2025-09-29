import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import dbConnect from "@/lib/database"
import Reader from "@/models/Reader"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await dbConnect()
    const pendingReaders = await Reader.find({ isApproved: false })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })

    const formattedReaders = pendingReaders.map(reader => ({
      id: reader._id,
      name: reader.userId.name,
      email: reader.userId.email,
      avatarUrl: reader.profileImage,
      bio: reader.bio,
      applicationDate: reader.createdAt,
      attributes: {
        tools: reader.attributes.tools,
        abilities: reader.attributes.abilities,
        style: reader.attributes.style
      },
      profileCompleteness: calculateProfileCompleteness(reader),
      location: reader.location,
      languages: reader.languages || [],
      documents: reader.documents || []
    }))

    return NextResponse.json(formattedReaders)
  } catch (error) {
    console.error("[PENDING_READERS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

interface ReaderAttributes {
  tools: string[];
  abilities: string[];
  style: string;
}

interface ReaderAvailability {
  schedule: {
    [key: string]: { start: string; end: string }[];
  };
  timezone: string;
}

interface ReaderDocument {
  profileImage: string;
  bio: string;
  location: string;
  attributes: Partial<ReaderAttributes>;
  availability: Partial<ReaderAvailability>;
}

function calculateProfileCompleteness(reader: ReaderDocument): number {
  const requiredFields = [
    'profileImage',
    'bio',
    'location',
    'attributes.tools',
    'attributes.abilities',
    'attributes.style',
    'availability.schedule',
    'availability.timezone'
  ]

  const completedFields = requiredFields.filter(field => {
    const keys = field.split('.')
    let value: unknown = reader
    
    for (const key of keys) {
      if (!value || typeof value !== 'object') return false
      value = (value as Record<string, unknown>)[key]
    }

    if (Array.isArray(value)) {
      return value.length > 0
    }
    return !!value
  })

  return Math.round((completedFields.length / requiredFields.length) * 100)
}
