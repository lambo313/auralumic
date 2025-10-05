import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database';
import { User } from '@/models/User';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    
    // Get user from database
    const user = await User.findOne({ clerkId: userId });
    
    return NextResponse.json({
      clerkId: userId,
      user: user ? {
        email: user.email,
        username: user.username,
        role: user.role,
        id: user._id.toString()
      } : null,
      message: user ? 'User found in database' : 'User not found in database'
    });
    
  } catch (error) {
    console.error('Error checking user debug info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    
    // Make current user admin
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { 
        role: 'admin',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Successfully made user admin',
      user: {
        email: user.email,
        username: user.username,
        role: user.role,
        id: user._id.toString()
      }
    });
    
  } catch (error) {
    console.error('Error making user admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}