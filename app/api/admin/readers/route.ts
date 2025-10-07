import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/database';
import { User, UserRole } from '@/models/User';
import Reader from '@/models/Reader';
import Review from '@/models/Review';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Verify admin role
    const adminUser = await User.findOne({ clerkId: userId });
    if (!adminUser || adminUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query for readers
    const readerQuery: Record<string, unknown> = {};

    // Status filter
    if (status && status !== 'all') {
      if (status === 'approved') {
        readerQuery.isApproved = true;
      } else if (status === 'pending') {
        readerQuery.isApproved = false;
        readerQuery.status = 'pending';
      } else if (status === 'rejected') {
        readerQuery.status = 'rejected';
      }
    }

    // Fetch readers from database
    const readers = await Reader.find(readerQuery)
      .select('-__v')
      .lean();

    // Get user data for each reader
    const userIds = readers.map(r => r.userId);
    const users = await User.find({ clerkId: { $in: userIds } }).lean();
    const userMap = new Map(users.map(u => [u.clerkId, u]));

    // Get review counts for readers
    const readerIds = readers.map(r => r.userId);
    const reviewCounts = await Review.aggregate([
      { $match: { readerId: { $in: readerIds } } },
      { $group: { _id: '$readerId', count: { $sum: 1 } } }
    ]);
    const reviewCountMap = new Map(reviewCounts.map(rc => [rc._id, rc.count]));

    // Merge reader and user data
    let readerData = readers.map(reader => {
      const user = userMap.get(reader.userId);
      const verificationStatus = reader.isApproved ? 'verified' : 
        (reader.status === 'rejected' ? 'rejected' : 'pending');
      
      // Get specialties from attributes
      const specialties = [
        ...(reader.attributes?.abilities || []),
        ...(reader.attributes?.tools || []),
        reader.attributes?.style
      ].filter(Boolean);

      return {
        id: reader.userId,
        email: user?.email || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        role: 'reader' as const,
        isActive: user?.role === UserRole.READER,
        isApproved: reader.isApproved,
        isOnline: reader.isOnline,
        credits: user?.credits || 0,
        totalReadings: reader.stats?.totalReadings || 0,
        rating: reader.stats?.averageRating || 0,
        reviewCount: reviewCountMap.get(reader.userId) || 0,
        totalEarnings: reader.stats?.totalEarnings || 0,
        specialties,
        verificationStatus,
        joinDate: reader.createdAt,
        lastActive: reader.lastActive
      };
    });

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      readerData = readerData.filter(reader => 
        reader.firstName.toLowerCase().includes(searchLower) ||
        reader.lastName.toLowerCase().includes(searchLower) ||
        reader.email.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      readers: readerData,
      total: readerData.length,
      page: 1,
      limit: 50,
    });
  } catch (error) {
    console.error('Error fetching readers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
