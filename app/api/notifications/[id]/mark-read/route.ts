import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import Notification from "@/models/Notification";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return new NextResponse("Notification not found", { status: 404 });
    }

    return NextResponse.json({ notification });
  } catch (error) {
    console.error("[NOTIFICATION_MARK_READ]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
