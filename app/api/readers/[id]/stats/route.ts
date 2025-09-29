import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import dbConnect from "@/lib/database"
import Reader from "@/models/Reader"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await context.params

    await dbConnect()

    const reader = await Reader.findById(id)
    if (!reader) {
      return new NextResponse("Reader not found", { status: 404 })
    }

    // Only allow access to own stats or for admin users
    if (reader.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const stats = {
      totalReadings: reader.stats.totalReadings || 0,
      averageRating: reader.stats.averageRating || 0,
      completionRate: reader.stats.completionRate || 0,
      totalEarnings: reader.stats.totalEarnings || 0
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("[READER_STATS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
