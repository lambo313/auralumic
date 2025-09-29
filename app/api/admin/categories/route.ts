import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import { User, UserRole } from "@/models/User";

// Mock categories data - in a real app, you'd have a Category model
const mockCategories = [
  { id: "1", name: "Love & Relationships", description: "Matters of the heart", isActive: true },
  { id: "2", name: "Career & Work", description: "Professional guidance", isActive: true },
  { id: "3", name: "Spiritual Growth", description: "Personal development", isActive: true },
  { id: "4", name: "Life Path", description: "Life direction and purpose", isActive: true },
  { id: "5", name: "Past Life", description: "Past life insights", isActive: false }
];

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

    return NextResponse.json({ categories: mockCategories });
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

    const { name, description, isActive } = await request.json();

    if (!name || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // In a real app, you would save to database
    const newCategory = {
      id: String(Date.now()),
      name,
      description,
      isActive: isActive ?? true
    };

    return NextResponse.json({ category: newCategory }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_CATEGORIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}