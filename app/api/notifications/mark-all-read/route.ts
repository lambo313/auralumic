import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import Notification from "@/models/Notification";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[NOTIFICATIONS_MARK_ALL_READ]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
