import { NextResponse } from "next/server"
import dbConnect from "@/lib/database"
import Reader from "@/models/Reader"
type LeanReader = {
  _id: string;
  tagline?: string;
  bio?: string;
  location?: string;
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
    const query = searchParams.get("q")

    if (!query) {
      return new NextResponse("Search query is required", { status: 400 })
    }

    await dbConnect()

    const readers = await Reader.find({
      isApproved: true,
      $or: [
        { tagline: { $regex: query, $options: "i" } },
        { bio: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { "attributes.tools": { $in: [new RegExp(query, "i")] } },
        { "attributes.abilities": { $in: [new RegExp(query, "i")] } },
        { "attributes.style": { $regex: query, $options: "i" } }
      ]
    })
      .select('-__v')
      .limit(20)
      .lean() as LeanReader[]

    return NextResponse.json(readers)

  } catch (error) {
    console.error("[READERS_SEARCH_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
