import { auth, clerkClient } from '@clerk/nextjs/server';
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
      // If user doesn't exist yet (new signup flow), return a safe default
      // so client-side onboarding can continue and assume the 'client' role.
      return NextResponse.json({ role: 'client' });
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

    let user = await User.findOne({ clerkId: userId });
    
    // If no user exists with this clerkId, try to find by the Clerk user's primary email
    // This handles the case where an existing user was created earlier with the same email
    // but without a clerkId (duplicate-email scenario). In that case link the record.
    if (!user) {
      try {
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(userId);
        const primaryEmail = clerkUser.emailAddresses?.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress
          || clerkUser.emailAddresses?.[0]?.emailAddress;

        if (primaryEmail) {
          const existing = await User.findOne({ email: primaryEmail });
          if (existing) {
            // link existing record to this clerkId and continue
            existing.clerkId = userId;
            existing.updatedAt = new Date();
            await existing.save();
            user = existing;
          }
        }
      } catch (err) {
        console.error('[API][/api/users/me][PATCH] Failed to fetch Clerk user to resolve existing record:', err);
      }
    }

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
