import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import dbConnect from "@/lib/database"
import Reader from "@/models/Reader"

import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status } = await request.json();

    if (!status) {
      return new NextResponse("Status is required", { status: 400 });
    }

    await dbConnect();

    // Check if the reader belongs to the authenticated user
    const reader = await Reader.findById(id);
    if (!reader) {
      return new NextResponse("Reader not found", { status: 404 });
    }

    if (reader.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Update the reader status
    await Reader.findByIdAndUpdate(
      id,
      { $set: { isOnline: status === "online" } },
      { runValidators: true }
    );

    return NextResponse.json({ message: "Status updated successfully" });

  } catch (error) {
    console.error("[READER_STATUS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
