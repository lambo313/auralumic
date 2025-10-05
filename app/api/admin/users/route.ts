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
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query
    const query: Record<string, unknown> = {};

    // Role filter
    if (role && role !== 'all') {
      query.role = role;
    }

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { username: searchRegex }
      ];
    }

    // Fetch users
    const dbUsers = await User.find(query).select('-__v').lean();

    // For clients, join with Client collection to get additional data
    const userIds = dbUsers.map(u => u.clerkId);
    const clients = await Client.find({ userId: { $in: userIds } }).lean();
    const clientMap = new Map(clients.map(c => [c.userId, c]));

    // Merge user and client data
    let users = dbUsers.map(user => {
      const clientData = clientMap.get(user.clerkId);
      return {
        id: user.clerkId,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role,
        isActive: clientData?.isActive ?? true,
        credits: user.credits || 0,
        totalReadings: clientData?.stats?.totalReadings || 0,
        joinDate: user.createdAt,
        lastActive: clientData?.lastActive || user.lastLogin,
        timezone: user.timezone || clientData?.timezone
      };
    });

    // Status filter (applied after merge since isActive comes from Client)
    if (status && status !== 'all') {
      if (status === 'active') {
        users = users.filter(user => user.isActive);
      } else if (status === 'inactive') {
        users = users.filter(user => !user.isActive);
      }
    }

    return NextResponse.json({
      users,
      total: users.length,
      page: 1,
      limit: 50,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
