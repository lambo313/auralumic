import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database';
import { User, UserRole } from '@/models/User';
import Client from '@/models/Client';

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

    // Get all client users
    const userQuery: Record<string, unknown> = { role: UserRole.CLIENT };

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      userQuery.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { username: searchRegex }
      ];
    }

    const users = await User.find(userQuery).select('-__v').lean();
    const userIds = users.map(u => u.clerkId);

    // Get client data
    const clients = await Client.find({ userId: { $in: userIds } })
      .populate('readings')
      .populate('reviews')
      .lean();

    const clientMap = new Map(clients.map(c => [c.userId, c]));

    // Merge user and client data
    let clientUsers = users.map(user => {
      const clientData = clientMap.get(user.clerkId);
      return {
        id: user.clerkId,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role,
        isActive: clientData?.isActive ?? true,
        isOnline: clientData?.isOnline ?? false,
        credits: user.credits || 0,
        totalReadings: clientData?.stats?.totalReadings || 0,
        creditsUsed: clientData?.stats?.creditsUsed || 0,
        languages: clientData?.languages || ['English'],
        timezone: clientData?.timezone || user.timezone || 'America/New_York',
        joinDate: user.createdAt,
        lastActive: clientData?.lastActive || user.lastLogin,
        hasCompletedOnboarding: user.hasCompletedOnboarding
      };
    });

    // Status filter
    if (status && status !== 'all') {
      if (status === 'active') {
        clientUsers = clientUsers.filter(client => client.isActive);
      } else if (status === 'inactive') {
        clientUsers = clientUsers.filter(client => !client.isActive);
      }
    }

    return NextResponse.json({
      clients: clientUsers,
      total: clientUsers.length,
      page: 1,
      limit: 50,
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
