import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import { User, UserRole } from "@/models/User";
import Category from "@/models/Category";

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
    const { name, description, icon, isActive } = await request.json();

    if (!name || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { id },
      { 
        name, 
        description, 
        icon: icon || 'default', 
        isActive: isActive ?? true 
      },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return new NextResponse("Category not found", { status: 404 });
    }

    return NextResponse.json({ category: updatedCategory });
  } catch (error: unknown) {
    console.error("[ADMIN_CATEGORIES_PUT]", error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return new NextResponse("Category with this name already exists", { status: 409 });
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
    
    const deletedCategory = await Category.findOneAndDelete({ id });

    if (!deletedCategory) {
      return new NextResponse("Category not found", { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("[ADMIN_CATEGORIES_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}