import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Mock user data - in production this would come from your database
    let users = [
      {
        id: "1",
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "client",
        isActive: true,
        credits: 150,
        totalReadings: 5,
        joinDate: new Date("2024-01-15"),
        lastActive: new Date("2024-08-20"),
      },
      {
        id: "2",
        email: "jane.smith@example.com",
        firstName: "Jane",
        lastName: "Smith",
        role: "client",
        isActive: true,
        credits: 75,
        totalReadings: 2,
        joinDate: new Date("2024-02-20"),
        lastActive: new Date("2024-08-18"),
      },
      {
        id: "3",
        email: "admin@auralumic.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        isActive: true,
        credits: 0,
        totalReadings: 0,
        joinDate: new Date("2024-01-01"),
        lastActive: new Date("2024-08-25"),
      },
    ];

    // Apply filters
    if (role && role !== 'all') {
      users = users.filter(user => user.role === role);
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        users = users.filter(user => user.isActive);
      } else if (status === 'inactive') {
        users = users.filter(user => !user.isActive);
      }
    }

    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
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
