import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import { User, UserRole } from "@/models/User";
import Badge from "@/models/Badge";

export async function GET() {
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

    const badges = await Badge.find({}).sort({ attribute: 1, tier: 1 }).lean();
    return NextResponse.json({ badges });
  } catch (error) {
    console.error("[ADMIN_BADGES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const { name, attribute, tier, requirements, icon, description } = await request.json();

    if (!name || !attribute || !tier || !requirements || !icon || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Generate ID from attribute and tier
    const id = `${attribute.toLowerCase().replace(/\s+/g, '-')}-${tier.toLowerCase()}`;

    const newBadge = {
      id,
      name,
      attribute,
      tier,
      requirements,
      icon,
      description
    };

    try {
      const result = await Badge.create(newBadge);
      return NextResponse.json({ badge: result }, { status: 201 });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        return new NextResponse("Badge with this attribute and tier already exists", { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    console.error("[ADMIN_BADGES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}