import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import { User, UserRole } from "@/models/User";
import fs from 'fs';
import path from 'path';

const BADGES_FILE_PATH = path.join(process.cwd(), 'data', 'badges.json');

interface BadgeData {
  id: string;
  name: string;
  attribute: string;
  tier: "Bronze" | "Silver" | "Gold";
  requirements: {
    readingsCompleted: number;
    averageRating?: number;
    timeframe?: number;
  };
  icon: string;
  description: string;
}

interface BadgesFile {
  badges: BadgeData[];
}

function readBadgesFile(): BadgesFile {
  try {
    const fileContent = fs.readFileSync(BADGES_FILE_PATH, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading badges file:', error);
    return { badges: [] };
  }
}

function writeBadgesFile(data: BadgesFile): void {
  try {
    fs.writeFileSync(BADGES_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing badges file:', error);
    throw new Error('Failed to save badges');
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
    const { name, attribute, tier, requirements, icon, description } = await request.json();

    if (!name || !attribute || !tier || !requirements || !icon || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const badgesData = readBadgesFile();
    const badgeIndex = badgesData.badges.findIndex(badge => badge.id === id);

    if (badgeIndex === -1) {
      return new NextResponse("Badge not found", { status: 404 });
    }

    const updatedBadge: BadgeData = {
      id,
      name,
      attribute,
      tier,
      requirements,
      icon,
      description
    };

    badgesData.badges[badgeIndex] = updatedBadge;
    writeBadgesFile(badgesData);

    return NextResponse.json({ badge: updatedBadge });
  } catch (error) {
    console.error("[ADMIN_BADGES_PUT]", error);
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
    const badgesData = readBadgesFile();
    const badgeIndex = badgesData.badges.findIndex(badge => badge.id === id);

    if (badgeIndex === -1) {
      return new NextResponse("Badge not found", { status: 404 });
    }

    badgesData.badges.splice(badgeIndex, 1);
    writeBadgesFile(badgesData);

    return NextResponse.json({ message: "Badge deleted successfully" });
  } catch (error) {
    console.error("[ADMIN_BADGES_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
