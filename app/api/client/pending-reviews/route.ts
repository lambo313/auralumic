import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import Reading, { ReadingStatus } from "@/models/Reading";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await dbConnect();

    // Use aggregation to also lookup the reader's user record so we can return a
    // readable reader username (username || firstName + lastName || email).
    const agg = [
      { $match: {
        clientId: userId,
        status: ReadingStatus.ARCHIVED,
        $and: [
          { $or: [{ "review.rating": { $exists: false } }, { "review.rating": null }] },
          { $or: [
            { "review.review": { $exists: false } },
            { "review.review": null },
            { "review.review": "" }
          ] }
        ]
      } },
      { $sort: { completedDate: -1, createdAt: -1 } },
      { $limit: 50 },
      { $project: { title: 1, topic: 1, readerId: 1, createdAt: 1 } },
      { $lookup: {
        from: "readers",
        localField: "readerId",
        foreignField: "userId",
        as: "reader"
      } },
      { $unwind: { path: "$reader", preserveNullAndEmptyArrays: true } },
      { $project: {
        title: 1,
        topic: 1,
        createdAt: 1,
        readerUsername: {
          $ifNull: [
            "$reader.username",
            { $cond: [
              { $or: ["$reader.firstName", "$reader.lastName"] },
              { $trim: { input: { $concat: [
                { $ifNull: ["$reader.firstName", ""] },
                " ",
                { $ifNull: ["$reader.lastName", ""] }
              ] } } },
              "$reader.email"
            ] }
          ]
        }
      } }
    ];

  // cast to any to avoid strict PipelineStage typing issues in TS
  const results = await Reading.aggregate(agg as any);

    const payload = (results || []).map((r: any) => ({
      id: String(r._id ?? r._id),
      title: r.title || r.topic || "Reading",
      topic: r.topic || null,
      readerUsername: r.readerUsername || null,
      createdAt: r.createdAt ?? null,
    }));

    return NextResponse.json(payload);
  } catch (err) {
    console.error("Error fetching pending reviews", err);
    return NextResponse.json({ error: "Failed to fetch pending reviews" }, { status: 500 });
  }
}
