import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import { User, UserRole } from "@/models/User";
import Category from "@/models/Category";

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

    const categories = await Category.find({}).sort({ name: 1 }).lean();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[ADMIN_CATEGORIES_GET]", error);
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

    const { name, description, icon, isActive } = await request.json();

    if (!name || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const newCategory = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      description,
      icon: icon || 'default',
      isActive: isActive ?? true
    };

    try {
      const result = await Category.create(newCategory);
      return NextResponse.json({ category: result }, { status: 201 });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        return new NextResponse("Category with this name already exists", { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    console.error("[ADMIN_CATEGORIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}