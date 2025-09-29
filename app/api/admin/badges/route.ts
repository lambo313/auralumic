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

    const badges = await Badge.find({}).sort({ createdAt: -1 });

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

    const badgeData = await request.json();
    const { name, attribute, tier, requirements, icon, description } = badgeData;

    if (!name || !attribute || !tier || !requirements || !icon || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const badge = await Badge.create({
      name,
      attribute,
      tier,
      requirements,
      icon,
      description
    });

    return NextResponse.json({ badge }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_BADGES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}