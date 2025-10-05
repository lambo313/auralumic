import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import { User, UserRole } from "@/models/User";
import fs from 'fs';
import path from 'path';

const ATTRIBUTES_FILE_PATH = path.join(process.cwd(), 'data', 'attributes.json');

interface Attribute {
  id: string;
  name: string;
  description: string;
}

interface AttributesData {
  Abilities: Attribute[];
  Tools: Attribute[];
  Styles: Attribute[];
}

function readAttributesFile(): AttributesData {
  try {
    const fileContent = fs.readFileSync(ATTRIBUTES_FILE_PATH, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading attributes file:', error);
    return { Abilities: [], Tools: [], Styles: [] };
  }
}

function writeAttributesFile(data: AttributesData): void {
  try {
    fs.writeFileSync(ATTRIBUTES_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing attributes file:', error);
    throw new Error('Failed to save attributes');
  }
}

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
    const { name, description, type } = await request.json();

    if (!name || !description || !type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (!['Abilities', 'Tools', 'Styles'].includes(type)) {
      return new NextResponse("Invalid attribute type", { status: 400 });
    }

    const attributesData = readAttributesFile();
    const attributeIndex = attributesData[type as keyof AttributesData].findIndex(attr => attr.id === id);

    if (attributeIndex === -1) {
      return new NextResponse("Attribute not found", { status: 404 });
    }

    const updatedAttribute: Attribute = {
      id,
      name,
      description
    };

    attributesData[type as keyof AttributesData][attributeIndex] = updatedAttribute;
    writeAttributesFile(attributesData);

    return NextResponse.json({ attribute: updatedAttribute });
  } catch (error) {
    console.error("[ADMIN_ATTRIBUTES_PUT]", error);
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type || !['Abilities', 'Tools', 'Styles'].includes(type)) {
      return new NextResponse("Invalid or missing attribute type", { status: 400 });
    }

    const attributesData = readAttributesFile();
    const attributeIndex = attributesData[type as keyof AttributesData].findIndex(attr => attr.id === id);

    if (attributeIndex === -1) {
      return new NextResponse("Attribute not found", { status: 404 });
    }

    attributesData[type as keyof AttributesData].splice(attributeIndex, 1);
    writeAttributesFile(attributesData);

    return NextResponse.json({ message: "Attribute deleted successfully" });
  } catch (error) {
    console.error("[ADMIN_ATTRIBUTES_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
