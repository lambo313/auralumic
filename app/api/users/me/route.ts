import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database';
import { User } from '@/models/User';
import { NextResponse } from 'next/server';
import { updateUserSchema } from '@/lib/validation-schemas';
import { z } from 'zod';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = session.userId;

    await dbConnect();
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = session.userId;

    const body = await req.json();
    
    // Validate request body
    let validatedData;
    try {
      validatedData = updateUserSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new NextResponse(JSON.stringify({ errors: error.issues }), { status: 400 });
      }
      throw error;
    }
    
    const { role, bio, location, website, username: name, hasCompletedOnboarding } = validatedData;

    await dbConnect();

  const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Handle role update
    if (role) {
      if (!['client', 'reader', 'admin'].includes(role)) {
        return new NextResponse("Invalid role", { status: 400 });
      }
      user.role = role;
    }

    // Handle profile update
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (name !== undefined) user.username = name;
    if (hasCompletedOnboarding !== undefined) user.hasCompletedOnboarding = hasCompletedOnboarding;
    
    user.updatedAt = new Date();
    await user.save();

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
