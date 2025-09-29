import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import { User, UserRole } from "@/models/User";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
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

    const { type } = await params;
    const { name, description } = await request.json();

    if (!name || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (!['tools', 'abilities', 'styles'].includes(type)) {
      return new NextResponse("Invalid attribute type", { status: 400 });
    }

    // In a real app, you would save to database
    const newAttribute = {
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      description
    };

    return NextResponse.json({ attribute: newAttribute }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_ATTRIBUTES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}