import { NextRequest, NextResponse } from 'next/server';
import { getUserRole } from '@/lib/auth';
import dbConnect from '@/lib/database';
import Reading from '@/models/Reading';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ disputeId: string }> }
) {
  try {
    const userRole = await getUserRole();

    if (!userRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (userRole.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { disputeId } = await params;
    const body = await request.json();
    const { resolution } = body;

    if (!resolution || typeof resolution !== 'string' || resolution.trim().length === 0) {
      return NextResponse.json(
        { error: 'Resolution is required' },
        { status: 400 }
      );
    }

    // Connect to DB and persist the admin response on the Reading.dispute subdocument
    await dbConnect();

    const updated = await Reading.findByIdAndUpdate(
      disputeId,
      {
        $set: {
          'dispute.adminResponse': resolution,
          'dispute.status': 'RESOLVED',
          'dispute.resolvedAt': new Date(),
        }
      },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
    }

    // Optionally: send notifications or take other actions here

    return NextResponse.json({
      success: true,
      disputeId,
      resolution,
      resolvedAt: new Date().toISOString(),
      resolvedBy: userRole.id,
      reading: updated,
    });

  } catch (error) {
    console.error('Error resolving dispute:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}