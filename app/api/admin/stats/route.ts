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
      pendingReaderApprovals,
      totalReadings,
      archivedReadingsCount,
      inProgressCount,
      pendingReadingsCount,
      refundedReadingsCount,
      disputesOpenCount
    ] = await Promise.all([
      User.countDocuments(),
      Reader.countDocuments({ isApproved: true }),
      Reader.countDocuments({ isApproved: false }),
      Reading.countDocuments(),
      // Treat "completedReadings" as readings that have been archived
      Reading.countDocuments({ status: ReadingStatus.ARCHIVED }),
      Reading.countDocuments({ status: ReadingStatus.IN_PROGRESS }),
      // Pending reads include instant_queue, message_queue, scheduled
      Reading.countDocuments({ status: { $in: [ReadingStatus.INSTANT_QUEUE, ReadingStatus.MESSAGE_QUEUE, ReadingStatus.SCHEDULED] } }),
      // Cancelled/refunded
      Reading.countDocuments({ status: ReadingStatus.REFUNDED }),
      // Open disputes: either the reading status is DISPUTED or there's a dispute subdocument with status 'OPEN' (case-insensitive)
      Reading.countDocuments({
        $or: [
          { status: ReadingStatus.DISPUTED },
          { 'dispute.status': { $regex: '^open$', $options: 'i' } }
        ]
      })
    ]);

  // Compute aggregated metrics from readings
  // Average duration and average revenue per reading should be based only on archived (completed) readings
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    // Use aggregation to compute averages and monthly revenue in a couple of efficient queries
    // Use an effective completed date (fallback to updatedAt) because some records may not have completedDate set
    const aggResults = await Reading.aggregate([
      { $match: { status: ReadingStatus.ARCHIVED } },
      { $addFields: { effectiveCompletedDate: { $ifNull: ["$completedDate", "$updatedAt"] } } },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                avgDuration: { $avg: "$readingOption.timeSpan.duration" },
                avgRating: { $avg: "$review.rating" },
                avgFinalPrice: { $avg: "$readingOption.finalPrice" },
                totalFinalPriceAllCompleted: { $sum: "$readingOption.finalPrice" }
              }
            }
          ],
          last30: [
            { $match: { effectiveCompletedDate: { $gte: thirtyDaysAgo } } },
            { $group: { _id: null, monthlyRevenue: { $sum: "$readingOption.finalPrice" } } }
          ],
          prev30: [
            { $match: { effectiveCompletedDate: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
            { $group: { _id: null, prevMonthlyRevenue: { $sum: "$readingOption.finalPrice" } } }
          ],
          popular: [
            // count top topics among archived readings
            { $group: { _id: "$topic", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { _id: 0, category: "$_id", count: 1 } }
          ]
        }
      }
  ]).exec();

    const overall = aggResults?.[0]?.overall?.[0] ?? null;
    const last30 = aggResults?.[0]?.last30?.[0] ?? null;
    const prev30 = aggResults?.[0]?.prev30?.[0] ?? null;
    const popular = aggResults?.[0]?.popular ?? [];

  const averageDuration = overall?.avgDuration ? Math.round(overall.avgDuration) : 0; // minutes
  const averageRating = overall?.avgRating ? Number((overall.avgRating).toFixed(2)) : 0;
  const revenuePerReading = overall?.avgFinalPrice ? Number((overall.avgFinalPrice).toFixed(2)) : 0; // currency/credits as stored
    const monthlyRevenue = last30?.monthlyRevenue ? Number((last30.monthlyRevenue).toFixed(2)) : 0;
    const prevMonthlyRevenue = prev30?.prevMonthlyRevenue ? Number((prev30.prevMonthlyRevenue).toFixed(2)) : 0;
    const totalRevenue = overall?.totalFinalPriceAllCompleted ? Number((overall.totalFinalPriceAllCompleted).toFixed(2)) : 0;

    const stats = {
      totalReaders,
      totalClients: Math.max(0, totalUsers - totalReaders),
      activeReadings: inProgressCount,
      totalReadings,
      completedReadings: archivedReadingsCount,
      pendingReadings: pendingReadingsCount,
      cancelledReadings: refundedReadingsCount,
      pendingApprovals: pendingReaderApprovals,
  disputesOpen: disputesOpenCount,
  monthlyRevenue,
  prevMonthlyRevenue,
  totalRevenue,
  revenuePerReading,
  averageRating,
  averageDuration,
      popularCategories: popular,
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
