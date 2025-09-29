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
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Mock reader data - in production this would come from your database
    let readers = [
      {
        id: "4",
        email: "psychic.maria@example.com",
        firstName: "Maria",
        lastName: "Santos",
        role: "reader",
        isActive: true,
        isApproved: true,
        isOnline: true,
        credits: 0,
        totalReadings: 147,
        rating: 4.8,
        reviewCount: 89,
        totalEarnings: 2940,
        specialties: ["Tarot", "Clairvoyant", "Compassionate"],
        verificationStatus: "verified",
        joinDate: new Date("2024-01-10"),
        lastActive: new Date("2024-08-25"),
      },
      {
        id: "5",
        email: "reader.alex@example.com",
        firstName: "Alex",
        lastName: "Johnson",
        role: "reader",
        isActive: true,
        isApproved: false,
        isOnline: false,
        credits: 0,
        totalReadings: 0,
        rating: 0,
        reviewCount: 0,
        totalEarnings: 0,
        specialties: ["Astrology", "Runes"],
        verificationStatus: "pending",
        joinDate: new Date("2024-08-20"),
        lastActive: new Date("2024-08-22"),
      },
    ];

    // Apply filters
    if (status && status !== 'all') {
      if (status === 'approved') {
        readers = readers.filter(reader => reader.isApproved);
      } else if (status === 'pending') {
        readers = readers.filter(reader => !reader.isApproved && reader.verificationStatus === 'pending');
      } else if (status === 'rejected') {
        readers = readers.filter(reader => reader.verificationStatus === 'rejected');
      }
    }

    if (search) {
      const searchLower = search.toLowerCase();
      readers = readers.filter(reader => 
        reader.firstName.toLowerCase().includes(searchLower) ||
        reader.lastName.toLowerCase().includes(searchLower) ||
        reader.email.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      readers,
      total: readers.length,
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
