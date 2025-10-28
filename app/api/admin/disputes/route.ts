import { NextResponse } from 'next/server';
import { getUserRole } from '@/lib/auth';
import dbConnect from '@/lib/database';
import Reading, { ReadingStatus } from '@/models/Reading';

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

    // Connect to DB
    await dbConnect();

    // Find readings that represent open disputes. We treat a reading as a dispute if either:
    // - reading.status === ReadingStatus.DISPUTED
    // - or dispute.status === 'OPEN' (case-insensitive)
    const readings = await Reading.find({
      $or: [
        { status: ReadingStatus.DISPUTED },
        { 'dispute.status': { $regex: '^open$', $options: 'i' } }
      ]
    }).select('clientId readerId dispute status updatedAt createdAt').lean();

    // Map into the shape expected by the admin UI
    const disputes = readings.map((r: any) => {
      const dispute = r.dispute || {};
      const createdAt = dispute.createdAt ? new Date(dispute.createdAt) : (r.updatedAt || r.createdAt);

      return {
        id: String(r._id),
        readingId: String(r._id),
        clientId: r.clientId,
        readerId: r.readerId,
        reason: dispute.reason || '',
        status: dispute.status || r.status,
        createdAt: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
      };
    });

    return NextResponse.json(disputes);
  } catch (error) {
    console.error('Error fetching disputes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}