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

    const badgesData = readBadgesFile();
    return NextResponse.json({ badges: badgesData.badges });
  } catch (error) {
    console.error("[ADMIN_BADGES_GET]", error);
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

    const { name, attribute, tier, requirements, icon, description } = await request.json();

    if (!name || !attribute || !tier || !requirements || !icon || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const badgesData = readBadgesFile();
    
    // Generate ID from name and attribute
    const id = `${attribute.toLowerCase().replace(/\s+/g, '-')}-${tier.toLowerCase()}`;
    
    // Check if ID already exists
    if (badgesData.badges.some(badge => badge.id === id)) {
      return new NextResponse("Badge with this attribute and tier already exists", { status: 409 });
    }

    const newBadge: BadgeData = {
      id,
      name,
      attribute,
      tier,
      requirements,
      icon,
      description
    };

    badgesData.badges.push(newBadge);
    writeBadgesFile(badgesData);

    return NextResponse.json({ badge: newBadge }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_BADGES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}