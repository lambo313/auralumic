import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import { User, UserRole } from "@/models/User";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
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

    const { categoryId } = await params;
    const { name, description, isActive } = await request.json();

    if (!name || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // In a real app, you would update in database
    const updatedCategory = {
      id: categoryId,
      name,
      description,
      isActive
    };

    return NextResponse.json({ category: updatedCategory });
  } catch (error) {
    console.error("[ADMIN_CATEGORY_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
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

    await params;

    // In a real app, you would delete from database
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("[ADMIN_CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}