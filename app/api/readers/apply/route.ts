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

    // Pre-normalize common legacy shapes so validation sees the expected types
    try {
      if (body && typeof body.availability === 'string') {
        try {
          body.availability = JSON.parse(body.availability);
        } catch (e) {
          // keep as string so schema union can still accept it, but prefer object
          console.warn('[READER_APPLICATION] failed to parse availability string, leaving as-is');
        }
      }
      // If profileImage is present but empty or not a valid URL-like string, allow empty string
      if (body && typeof body.profileImage === 'string') {
        const v = body.profileImage.trim();
        if (!v) {
          body.profileImage = '';
        }
      }
    } catch (normErr) {
      console.warn('[READER_APPLICATION_NORMALIZE_ERROR]', normErr);
    }

    // Validate request body
    try {
      readerApplicationSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('[READER_APPLICATION_VALIDATION_ERROR]', error.issues);
        return new NextResponse(JSON.stringify({ errors: error.issues }), { status: 400 });
      }
      // If it's not a ZodError, rethrow to be handled by outer catch
      throw error;
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
      aboutMe,
      attributes, 
      availability, 
      additionalInfo,
      languages
    } = body;

    // Validate required fields
    if (!username || !profileImage || !tagline || !location) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

  // Normalize attributes (accept legacy array format or normalized object)
  const readerAttributes = { tools: [], abilities: [], style: "" } as any;
    if (Array.isArray(attributes)) {
      readerAttributes.tools = attributes.slice(0, 3);
    } else if (attributes && typeof attributes === 'object') {
      readerAttributes.tools = Array.isArray(attributes.tools) ? attributes.tools.slice(0, 3) : [];
      readerAttributes.abilities = Array.isArray(attributes.abilities) ? attributes.abilities.slice(0, 3) : [];
      readerAttributes.style = typeof attributes.style === 'string' ? attributes.style : "";
    }

    // Normalize availability: accept either an object or a JSON string
    let normalizedAvailability: any = {
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
    };

    if (availability) {
      try {
        if (typeof availability === 'string') {
          normalizedAvailability = JSON.parse(availability);
        } else if (typeof availability === 'object') {
          normalizedAvailability = availability;
        }
      } catch (parseErr) {
        console.warn("Failed to parse availability, falling back to defaults", parseErr);
      }
    }

    // Create new reader application with proper structure (match PATCH/new-reader behavior)
    const readerApplication = new Reader({
      userId,
      username,
      profileImage,
      tagline,
      location,
  aboutMe: aboutMe || '',
  languages: Array.isArray(languages) ? languages.slice(0, 10) : [],
      additionalInfo: additionalInfo || '',
      attributes: readerAttributes,
      availability: normalizedAvailability,
      isOnline: false,
      isApproved: false,
      status: 'pending',
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

    // Return the created reader document (without mongoose internal __v)
    const readerObj = readerApplication.toObject();
    delete readerObj.__v;

    return NextResponse.json(readerObj);
  } catch (error: unknown) {
    // Mongoose validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      return new NextResponse(error.message, { status: 400 });
    }
    console.error("[READER_APPLICATION_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
