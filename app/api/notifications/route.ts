import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import Notification from "@/models/Notification";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
