import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import { User, UserRole } from "@/models/User";
import Ability from "@/models/Ability";
import Tool from "@/models/Tool";
import Style from "@/models/Style";

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

    // Fetch all attributes from MongoDB
    const [abilitiesRaw, toolsRaw, stylesRaw] = await Promise.all([
      Ability.find({}).sort({ name: 1 }).select('id name description').lean(),
      Tool.find({}).sort({ name: 1 }).select('id name description').lean(),
      Style.find({}).sort({ name: 1 }).select('id name description').lean()
    ]);

    // Transform to match our interface
    const abilities: Attribute[] = abilitiesRaw.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description
    }));

    const tools: Attribute[] = toolsRaw.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description
    }));

    const styles: Attribute[] = stylesRaw.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description
    }));

    const attributesData: AttributesData = {
      Abilities: abilities,
      Tools: tools,
      Styles: styles
    };

    return NextResponse.json({ attributes: attributesData });
  } catch (error) {
    console.error("[ADMIN_ATTRIBUTES_GET]", error);
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

    const { name, description, type } = await request.json();

    if (!name || !description || !type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (!['Abilities', 'Tools', 'Styles'].includes(type)) {
      return new NextResponse("Invalid attribute type", { status: 400 });
    }

    // Generate ID from name
    const id = name.toLowerCase().replace(/\s+/g, '-');

    const newAttribute = {
      id,
      name,
      description
    };

    let result;
    
    try {
      switch (type) {
        case 'Abilities':
          result = await Ability.create(newAttribute);
          break;
        case 'Tools':
          result = await Tool.create(newAttribute);
          break;
        case 'Styles':
          result = await Style.create(newAttribute);
          break;
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        return new NextResponse("Attribute with this name already exists", { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ attribute: result });
  } catch (error) {
    console.error("[ADMIN_ATTRIBUTES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}