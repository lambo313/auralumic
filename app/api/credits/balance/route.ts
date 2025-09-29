import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import { User } from "@/models/User";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json({ 
      credits: user.credits || 0,
      userId: user.clerkId 
    });
  } catch (error) {
    console.error("[CREDITS_BALANCE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}