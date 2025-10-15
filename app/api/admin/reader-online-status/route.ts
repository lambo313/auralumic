import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import User from "@/models/User";
import Reader from "@/models/Reader";

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    // Verify the user is an admin
    const user = await User.findOne({ clerkId: userId });
    if (!user || user.role !== 'admin') {
      return new NextResponse("Forbidden - Admin access required", { status: 403 });
    }

    const { isOnline } = await request.json();
    
    if (typeof isOnline !== 'boolean') {
      return new NextResponse("Invalid isOnline value. Must be boolean", { status: 400 });
    }

    // Find the reader profile for this admin user (clerkId === userId)
    const reader = await Reader.findOneAndUpdate(
      { userId }, // Reader's userId is the same as User's clerkId
      { 
        isOnline: isOnline,
        lastActive: new Date()
      },
      { new: true }
    );

    // It's okay if no reader profile exists - admin might not have a reader profile
    if (!reader) {
      return NextResponse.json({ 
        success: true, 
        message: "No reader profile found for admin user",
        isOnline: isOnline 
      });
    }

    return NextResponse.json({ 
      success: true, 
      isOnline: reader.isOnline,
      status: reader.status 
    });
  } catch (error) {
    console.error("[ADMIN_READER_ONLINE_STATUS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}