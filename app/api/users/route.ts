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
      user = await User.create({
        clerkId: userId,
        email,
        username,
        role: role || UserRole.CLIENT,
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
