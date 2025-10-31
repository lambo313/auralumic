import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database';
import { User, UserRole } from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = session.userId;

    await dbConnect();
    const users = await User.find({});
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = session.userId;

    const body = await req.json();
    const { email, username, role } = body;

    if (!email || !username) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await dbConnect();

    // Try to find user by Clerk ID first
    let user = await User.findOne({ clerkId: userId });

    if (user) {
      // Update existing user
      user.email = email;
      user.username = username;
      user.role = role || UserRole.CLIENT;
      user.updatedAt = new Date();
      await user.save();
    } else {
      // Create new user if doesn't exist
      try {
        user = await User.create({
          clerkId: userId,
          email,
          username,
          role: role || UserRole.CLIENT,
        });
      } catch (err: unknown) {
        // Handle duplicate-key (email) error: fetch existing record and continue onboarding
        // Mongo duplicate key code is 11000
        const mongoErr = err as any;
        if (mongoErr && mongoErr.code === 11000 && mongoErr.keyValue?.email) {
          console.warn("[USERS_POST] Duplicate email detected, returning existing user:", mongoErr.keyValue.email);
          const existing = await User.findOne({ email: mongoErr.keyValue.email }).lean();
          if (existing) {
            // Return existing user so onboarding can continue
            return NextResponse.json(existing);
          }
        }
        // Re-throw for other errors
        throw err;
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
