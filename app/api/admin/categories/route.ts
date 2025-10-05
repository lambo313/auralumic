import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import { User, UserRole } from "@/models/User";
import fs from 'fs';
import path from 'path';

const CATEGORIES_FILE_PATH = path.join(process.cwd(), 'data', 'categories.json');

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
}

interface CategoriesData {
  categories: Category[];
}

function readCategoriesFile(): CategoriesData {
  try {
    const fileContent = fs.readFileSync(CATEGORIES_FILE_PATH, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading categories file:', error);
    return { categories: [] };
  }
}

function writeCategoriesFile(data: CategoriesData): void {
  try {
    fs.writeFileSync(CATEGORIES_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing categories file:', error);
    throw new Error('Failed to save categories');
  }
}

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

    const categoriesData = readCategoriesFile();
    return NextResponse.json({ categories: categoriesData.categories });
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

    const categoriesData = readCategoriesFile();
    const newCategory: Category = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      description,
      icon: icon || 'default',
      isActive: isActive ?? true
    };

    categoriesData.categories.push(newCategory);
    writeCategoriesFile(categoriesData);

    return NextResponse.json({ category: newCategory }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_CATEGORIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}