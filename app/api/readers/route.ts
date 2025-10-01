import { NextResponse } from "next/server"
import dbConnect from "@/lib/database"
import Reader from "@/models/Reader"
type SearchQuery = {
  isApproved: boolean;
  $or?: Array<Record<string, unknown>>;
};

type LeanReader = {
  _id: string;
  tagline?: string;
  bio?: string;
  location?: string;
  attributes?: {
    tools?: string[];
    abilities?: string[];
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

    const total = await Reader.countDocuments(searchQuery)

    return NextResponse.json({
      readers,
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
