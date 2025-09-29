import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database";
import { User, UserRole } from "@/models/User";

// Mock attributes data based on the data/attributes.json structure
const mockAttributes = {
  tools: [
    { id: "tarot", name: "Tarot Cards", description: "Traditional tarot card readings" },
    { id: "astrology", name: "Astrology", description: "Birth chart and astrological guidance" },
    { id: "numerology", name: "Numerology", description: "Numbers and their meanings" },
    { id: "crystals", name: "Crystal Reading", description: "Energy work with crystals" }
  ],
  abilities: [
    { id: "clairvoyant", name: "Clairvoyant", description: "Clear seeing abilities" },
    { id: "empath", name: "Empath", description: "Feeling others' emotions" },
    { id: "medium", name: "Medium", description: "Connecting with spirits" },
    { id: "healer", name: "Energy Healer", description: "Healing energy work" }
  ],
  styles: [
    { id: "compassionate", name: "Compassionate", description: "Gentle and caring approach" },
    { id: "direct", name: "Direct", description: "Straightforward communication" },
    { id: "intuitive", name: "Intuitive", description: "Following inner guidance" }
  ]
};

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

    return NextResponse.json({ attributes: mockAttributes });
  } catch (error) {
    console.error("[ADMIN_ATTRIBUTES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}