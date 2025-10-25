import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database';
import Reading from '@/models/Reading';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Check admin role
    const adminUser = await User.findOne({ clerkId: userId });
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const search = url.searchParams.get('q');

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { topic: { $regex: search, $options: 'i' } },
        { 'readingOption.type': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Reading.countDocuments(query as Record<string, unknown>);
    const readings = await Reading.find(query as Record<string, unknown>)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const result = readings.map((r) => {
      // toObject() returns a plain object with _id and other fields; cast to a safe record
      const obj = r.toObject() as Record<string, unknown>;
      const { _id, ...rest } = obj;
      return { id: _id?.toString?.() ?? String(_id), ...rest } as Record<string, unknown>;
    });

    return NextResponse.json({ readings: result, pagination: { total, page, limit } });
  } catch (error) {
    console.error('Error fetching admin readings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
