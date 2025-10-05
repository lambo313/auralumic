import { NextResponse } from 'next/server';
import { getUserRole } from '@/lib/auth';

// Mock data for disputes - in a real app, this would come from a database
const mockDisputes = [
  {
    id: "dispute-1",
    readingId: "reading-123",
    clientId: "user-456",
    readerId: "reader-789",
    reason: "The reading was not accurate and did not address my questions properly.",
    status: "OPEN" as const,
    createdAt: new Date("2024-01-15T10:30:00Z"),
  },
  {
    id: "dispute-2",
    readingId: "reading-124",
    clientId: "user-457",
    readerId: "reader-790",
    reason: "Reader was late to the session and rushed through the reading.",
    status: "OPEN" as const,
    createdAt: new Date("2024-01-16T14:20:00Z"),
  }
];

export async function GET() {
  try {
    const userRole = await getUserRole();
    
    console.log('[Admin Disputes API] User role:', userRole);

    if (!userRole) {
      console.log('[Admin Disputes API] No user role found - unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (userRole.role !== 'admin') {
      console.log('[Admin Disputes API] User role is not admin:', userRole.role);
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    console.log('[Admin Disputes API] Admin access granted, returning disputes');
    // Return only open disputes for now
    const openDisputes = mockDisputes.filter(dispute => dispute.status === 'OPEN');

    return NextResponse.json(openDisputes);
  } catch (error) {
    console.error('Error fetching disputes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}