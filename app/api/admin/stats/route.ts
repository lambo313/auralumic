import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database';
import { User, UserRole } from '@/models/User';
import Reader from '@/models/Reader';
import Reading, { ReadingStatus } from '@/models/Reading';

export async function GET() {
  try {
    // Verify admin authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Verify admin access
    const adminUser = await User.findOne({ clerkId: userId });
    if (!adminUser || adminUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get real statistics
    const [
      totalUsers,
      totalReaders,
      pendingReaders,
      totalReadings,
      completedReadings,
      activeReadings
    ] = await Promise.all([
      User.countDocuments(),
      Reader.countDocuments({ isApproved: true }),
      Reader.countDocuments({ isApproved: false }),
      Reading.countDocuments(),
      Reading.countDocuments({ status: ReadingStatus.COMPLETED }),
      Reading.countDocuments({ status: ReadingStatus.IN_PROGRESS })
    ]);

    const stats = {
      totalReaders,
      totalClients: totalUsers - totalReaders,
      activeReadings,
      totalReadings,
      pendingApprovals: pendingReaders,
      disputesOpen: 0, // Would need dispute model
      monthlyRevenue: 0, // Would need transaction data
      readerGrowth: 0, // Would need time-series data
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
