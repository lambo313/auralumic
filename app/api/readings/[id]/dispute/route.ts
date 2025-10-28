import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import Reading, { ReadingStatus } from "@/models/Reading";
import { z } from "zod";

const disputeSchema = z.object({
  reason: z.string().min(5).max(2000),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const parsed = disputeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
    }

    await dbConnect();

    const reading = await Reading.findById(id);
    if (!reading) return NextResponse.json({ error: "Reading not found" }, { status: 404 });

    // Only the client who owns the reading may open a dispute
    if (reading.clientId !== userId) return new NextResponse("Forbidden", { status: 403 });

    // Disputes allowed only for archived readings
    if (String(reading.status) !== ReadingStatus.ARCHIVED) {
      return NextResponse.json({ error: "Disputes can only be filed for archived readings" }, { status: 400 });
    }

    // Attach dispute and mark reading as disputed
    reading.dispute = {
      reason: parsed.data.reason,
      status: "OPEN",
      clientId: userId,
      adminResponse: undefined,
      createdAt: new Date(),
      resolvedAt: undefined,
    } as any;

    reading.status = ReadingStatus.DISPUTED as any;

    await reading.save();

    // Return dispute info (use optional chaining in case of unexpected nulls)
    return NextResponse.json({
      success: true,
      dispute: {
        reason: reading.dispute?.reason ?? parsed.data.reason,
        status: reading.dispute?.status ?? "OPEN",
        createdAt: reading.dispute?.createdAt ?? new Date(),
      }
    });
  } catch (err) {
    console.error("Error filing dispute", err);
    return NextResponse.json({ error: "Failed to file dispute" }, { status: 500 });
  }
}
