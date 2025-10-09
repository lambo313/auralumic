import { NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Category from "@/models/Category";

export async function GET() {
  try {
    await dbConnect();

    // Fetch only active categories for public use
    const categories = await Category.find({ isActive: true })
      .select('id name description icon')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}