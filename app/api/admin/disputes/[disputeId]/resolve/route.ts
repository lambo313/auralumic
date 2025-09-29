import { NextRequest, NextResponse } from 'next/server';
import { getUserRole } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { disputeId: string } }
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

    const { disputeId } = params;
    const body = await request.json();
    const { resolution } = body;

    if (!resolution || typeof resolution !== 'string' || resolution.trim().length === 0) {
      return NextResponse.json(
        { error: 'Resolution is required' },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Update the dispute in the database
    // 2. Send notifications to relevant parties
    // 3. Process any refunds if applicable
    // 4. Log the resolution for audit purposes

    // For now, we'll just return a success response
    console.log(`Resolving dispute ${disputeId} with resolution: ${resolution}`);

    return NextResponse.json({
      success: true,
      disputeId,
      resolution,
      resolvedAt: new Date().toISOString(),
      resolvedBy: userRole.id
    });

  } catch (error) {
    console.error('Error resolving dispute:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}