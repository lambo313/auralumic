import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import { User, UserRole } from "@/models/User";
import Ability from "@/models/Ability";
import Tool from "@/models/Tool";
import Style from "@/models/Style";
import Badge from "@/models/Badge";

function getModel(type: string) {
  switch (type) {
    case 'Abilities':
      return Ability;
    case 'Tools':
      return Tool;
    case 'Styles':
      return Style;
    default:
      throw new Error('Invalid attribute type');
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

    const Model = getModel(type);
    
    const updatedAttribute = await Model.findOneAndUpdate(
      { id },
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updatedAttribute) {
      return new NextResponse("Attribute not found", { status: 404 });
    }

    return NextResponse.json({ attribute: updatedAttribute });
  } catch (error: unknown) {
    console.error("[ADMIN_ATTRIBUTES_PUT]", error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return new NextResponse("Attribute with this name already exists", { status: 409 });
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type || !['Abilities', 'Tools', 'Styles'].includes(type)) {
      return new NextResponse("Invalid or missing attribute type", { status: 400 });
    }

    const Model = getModel(type);
    
    // First, find the attribute to get its name for badge matching
    const attributeToDelete = await Model.findOne({ id });
    if (!attributeToDelete) {
      return new NextResponse("Attribute not found", { status: 404 });
    }

    // Delete associated badges that reference this attribute
    // Badges reference attributes by name, so we match on the attribute name
    const deletedBadges = await Badge.deleteMany({ 
      attribute: attributeToDelete.name 
    });

    // Now delete the attribute itself
    const deletedAttribute = await Model.findOneAndDelete({ id });

    console.log(`Deleted attribute "${attributeToDelete.name}" and ${deletedBadges.deletedCount} associated badges`);

    return NextResponse.json({ 
      message: "Attribute deleted successfully",
      deletedBadges: deletedBadges.deletedCount
    });
  } catch (error) {
    console.error("[ADMIN_ATTRIBUTES_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
