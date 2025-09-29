import { getAuth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database';
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
    const mongoose = await dbConnect();
    const { id } = await params;
    const user = await mongoose.connection.collection('users').findOne({
      _id: new ObjectId(id)
    });

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
    const mongoose = await dbConnect();
    const body = await req.json();
    const { id } = await params;

    const result = await mongoose.connection.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...body,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(result);
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
    const mongoose = await dbConnect();
    const { id } = await params;
    await mongoose.connection.collection('users').deleteOne({
      _id: new ObjectId(id)
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
