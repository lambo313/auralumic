import { NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import dbConnect from "@/lib/database"
import Reader from "@/models/Reader"
import User from "@/models/User"
import { readerApplicationSchema } from "@/lib/validation-schemas"
import { z } from "zod"

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    try {
      readerApplicationSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new NextResponse(JSON.stringify({ errors: error.issues }), { status: 400 });
      }
    }

    await dbConnect();

    // Check if user already has a reader application
    const existingReader = await Reader.findOne({ userId });
    if (existingReader) {
      return new NextResponse("Reader application already exists", { status: 409 });
    }

    // Check if username is already taken
    if (body.username) {
      const existingUsername = await Reader.findOne({ username: body.username });
      if (existingUsername) {
        return new NextResponse("Username is already taken", { status: 409 });
      }
    }

    // Transform and validate the request body
    const { 
      username, 
      profileImage, 
      tagline, 
      location, 
      bio, 
      attributes, 
      availability, 
      additionalInfo,
      experience 
    } = body;

    // Validate required fields
    if (!username || !profileImage || !tagline || !location) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Transform attributes if it's an array (legacy format)
    let readerAttributes;
    if (Array.isArray(attributes)) {
      readerAttributes = {
        tools: attributes.slice(0, 3), // Take first 3 as tools
        abilities: [],
        style: ""
      };
    } else {
      readerAttributes = attributes;
    }

    // Create new reader application with proper structure
    const readerApplication = new Reader({
      userId,
      username,
      profileImage,
      tagline,
      location,
      experience: experience || bio,
      additionalInfo,
      attributes: readerAttributes,
      availability: availability ? JSON.parse(availability) : {
        schedule: {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: []
        },
        timezone: 'UTC',
        instantBooking: false
      },
      isOnline: false,
      isApproved: false,
      stats: {
        totalReadings: 0,
        averageRating: 0,
        totalEarnings: 0,
        completionRate: 0
      },
      readingOptions: [],
      badges: [],
      reviews: [],
    });

    await readerApplication.save();

    // Update user's onboarding status and role
    try {
      await User.findOneAndUpdate(
        { clerkId: userId },
        {
          hasCompletedOnboarding: true,
          role: "reader",
        },
        { upsert: true }
      );

      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          hasCompletedOnboarding: true,
          role: "reader",
        },
      });
    } catch (metadataError) {
      console.error("Error updating user metadata:", metadataError);
    }

    return NextResponse.json({
      message: "Reader application submitted successfully",
      applicationId: readerApplication._id,
    });
  } catch (error: any) {
    // Mongoose validation errors
    if (error.name === "ValidationError") {
      return new NextResponse(error.message, { status: 400 });
    }
    console.error("[READER_APPLICATION_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
