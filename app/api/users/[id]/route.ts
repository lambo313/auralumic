import { getAuth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database';
import { User } from '@/models/User';
import { NextResponse, NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    
    let user;
    
    // Try to find by clerkId first (for Clerk user IDs)
    user = await User.findOne({ clerkId: id });
    
    // If not found and id looks like a MongoDB ObjectId, try finding by _id
    if (!user && ObjectId.isValid(id)) {
      user = await User.findById(id);
    }

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { id } = await params;

    let user;
    
    // Try to find by clerkId first
    user = await User.findOne({ clerkId: id });
    
    // If not found and id looks like a MongoDB ObjectId, try finding by _id
    if (!user && ObjectId.isValid(id)) {
      user = await User.findById(id);
    }

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Update user
    Object.assign(user, body, { updatedAt: new Date() });
    await user.save();

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    
    let result;
    
    // Try to delete by clerkId first
    result = await User.deleteOne({ clerkId: id });
    
    // If not found and id looks like a MongoDB ObjectId, try deleting by _id
    if (result.deletedCount === 0 && ObjectId.isValid(id)) {
      result = await User.deleteOne({ _id: id });
    }

    if (result.deletedCount === 0) {
      return new NextResponse("User not found", { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
