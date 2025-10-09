import { NextResponse } from "next/server"
import dbConnect from "@/lib/database"
import Reader from "@/models/Reader"
import { mockReaders } from "@/components/readers/mock-reader-data"

type SearchQuery = {
  isApproved: boolean;
  $or?: Array<Record<string, unknown>>;
};

type LeanReader = {
  _id: string;
  tagline?: string;
  location?: string;
  aboutMe?: string;
  attributes?: {
    tools?: string[];
    abilities?: string[];
    style?: string;
  };
  // Add other fields as needed
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const query = searchParams.get("query")
    const skip = (page - 1) * limit

    await dbConnect()

    const searchQuery: SearchQuery = { isApproved: true }

    // If there's a search query, add text search
    if (query) {
      searchQuery.$or = [
        { tagline: { $regex: query, $options: "i" } },
        { bio: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { aboutMe: { $regex: query, $options: "i" } },
        { "attributes.tools": { $in: [new RegExp(query, "i")] } },
        { "attributes.abilities": { $in: [new RegExp(query, "i")] } }
      ]
    }

    const readers = await Reader.find(searchQuery)
      .select('-__v')
      .sort({ lastActive: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as LeanReader[]

    // Convert MongoDB _id to id for consistency
    const formattedReaders = readers.map(reader => ({
      ...reader,
      id: reader._id.toString(),
    }));

    const total = await Reader.countDocuments(searchQuery)

    // If no readers found in database, use mock data
    if (readers.length === 0 && page === 1) {
      // Filter mock readers (only approved ones)
      let filteredMockReaders = mockReaders.filter(r => r.isApproved)
      
      // Apply search filter if query exists
      if (query) {
        const lowerQuery = query.toLowerCase()
        filteredMockReaders = filteredMockReaders.filter(r => {
          return (
            r.tagline?.toLowerCase().includes(lowerQuery) ||
            r.location?.toLowerCase().includes(lowerQuery) ||
            r.aboutMe?.toLowerCase().includes(lowerQuery) ||
            r.attributes?.tools?.some(t => t.toLowerCase().includes(lowerQuery)) ||
            r.attributes?.abilities?.some(a => a.toLowerCase().includes(lowerQuery))
          )
        })
      }

      // Convert mock readers to API format
      const mockReadersFormatted = filteredMockReaders.slice(skip, skip + limit).map(r => ({
        ...r,
        // Keep the existing id from mock data, don't change to _id
        createdAt: r.createdAt.toISOString(),
        lastActive: r.lastActive.toISOString(),
        updatedAt: r.updatedAt?.toISOString() || r.createdAt.toISOString()
      }))

      return NextResponse.json({
        readers: mockReadersFormatted,
        pagination: {
          page,
          limit,
          total: filteredMockReaders.length,
          pages: Math.ceil(filteredMockReaders.length / limit)
        }
      })
    }

    return NextResponse.json({
      readers: formattedReaders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("[READERS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
