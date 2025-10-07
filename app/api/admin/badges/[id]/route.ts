import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import { User, UserRole } from "@/models/User";
import Badge from "@/models/Badge";

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
    const { name, attribute, tier, requirements, icon, description } = await request.json();

    if (!name || !attribute || !tier || !requirements || !icon || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const updatedBadge = await Badge.findOneAndUpdate(
      { id },
      { name, attribute, tier, requirements, icon, description },
      { new: true, runValidators: true }
    );

    if (!updatedBadge) {
      return new NextResponse("Badge not found", { status: 404 });
    }

    return NextResponse.json({ badge: updatedBadge });
  } catch (error: unknown) {
    console.error("[ADMIN_BADGES_PUT]", error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return new NextResponse("Badge with this attribute and tier already exists", { status: 409 });
    }
    
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
    
    const deletedBadge = await Badge.findOneAndDelete({ id });

    if (!deletedBadge) {
      return new NextResponse("Badge not found", { status: 404 });
    }

    return NextResponse.json({ message: "Badge deleted successfully" });
  } catch (error) {
    console.error("[ADMIN_BADGES_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
