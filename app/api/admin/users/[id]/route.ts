import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import { User, UserRole } from "@/models/User";
import Client from "@/models/Client";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    // Verify admin access
    const adminUser = await User.findOne({ clerkId: userId });
    if (!adminUser || adminUser.role !== UserRole.ADMIN) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role, isActive, credits } = body;

    // Update User model
    const updateData: { role?: string; credits?: number } = {};
    if (role) updateData.role = role;
    if (credits !== undefined) updateData.credits = credits;

    const user = await User.findOneAndUpdate(
      { clerkId: id },
      updateData,
      { new: true }
    );

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Update Client model if user is a client
    if (user.role === UserRole.CLIENT && isActive !== undefined) {
      await Client.findOneAndUpdate(
        { userId: id },
        { isActive },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ 
      user: {
        id: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        credits: user.credits
      }
    });
  } catch (error) {
    console.error("[ADMIN_USER_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    // Verify admin access
    const adminUser = await User.findOne({ clerkId: userId });
    if (!adminUser || adminUser.role !== UserRole.ADMIN) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { id } = await params;

    // Delete user and associated client/reader data
    await User.findOneAndDelete({ clerkId: id });
    await Client.findOneAndDelete({ userId: id });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("[ADMIN_USER_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
