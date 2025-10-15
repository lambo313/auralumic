import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import Reader from "@/models/Reader";

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status } = await request.json();
    
    if (!['available', 'busy', 'offline'].includes(status)) {
      return new NextResponse("Invalid status. Must be 'available', 'busy', or 'offline'", { status: 400 });
    }

    await dbConnect();

    // Find the reader by userId and update their status
    const reader = await Reader.findOneAndUpdate(
      { userId },
      { 
        status: status,
        lastActive: new Date()
      },
      { new: true }
    );

    if (!reader) {
      return new NextResponse("Reader not found", { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      status: reader.status,
      isOnline: reader.isOnline 
    });
  } catch (error) {
    console.error("[READER_STATUS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    const reader = await Reader.findOne({ userId });
    if (!reader) {
      return new NextResponse("Reader not found", { status: 404 });
    }

    return NextResponse.json({ 
      status: reader.status,
      isOnline: reader.isOnline 
    });
  } catch (error) {
    console.error("[READER_STATUS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}