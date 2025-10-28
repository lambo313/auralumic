import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import dbConnect from "@/lib/database"
import Reader from "@/models/Reader"
import Reading, { ReadingStatus } from '@/models/Reading'
import { User, UserRole } from '@/models/User'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    let userId: string | undefined
    try {
      const authRes = await auth()
      userId = (authRes as any).userId as string | undefined
    } catch (err) {
      userId = undefined
    }

    const { id } = await context.params

    await dbConnect()

  // Try to find reader by MongoDB _id first, then by userId for backward compatibility
  let reader: any = null
    try {
      const mongoose = await import('mongoose')
      if (mongoose.Types.ObjectId.isValid(id)) {
        reader = await Reader.findById(id).lean()
      }
    } catch (err) {
      // ignore and try by userId
    }

    if (!reader) {
      reader = await Reader.findOne({ userId: id }).lean()
    }

    if (!reader) {
      return new NextResponse('Reader not found', { status: 404 })
    }

    // Authorization: allow if reader is approved (public), or user is owner, or user is admin
    let isAdmin = false
    if (userId) {
      // tell TS the shape we expect from lean() so `role` is recognized
      const adminUser = await User.findOne({ clerkId: userId }).lean<{ role?: string }>()
      isAdmin = !!adminUser && adminUser.role === UserRole.ADMIN
    }

    const isOwner = !!userId && reader.userId === userId
    if (!reader.isApproved && !isOwner && !isAdmin) {
      // keep same behavior as profile route: hide unapproved profiles from others
      return new NextResponse('Reader not found', { status: 404 })
    }

    // Aggregate readings for this reader to compute stats
    const readerIdForMatch = reader.userId || (reader._id && String(reader._id))

    const agg: any[] = await Reading.aggregate([
      { $match: { readerId: readerIdForMatch } },
      {
        $group: {
          _id: '$readerId',
          totalReadings: { $sum: 1 },
          archivedCount: { $sum: { $cond: [{ $eq: ['$status', ReadingStatus.ARCHIVED] }, 1, 0] } },
          avgRating: { $avg: { $ifNull: ['$review.rating', null] } },
          ratingCount: { $sum: { $cond: [{ $ifNull: ['$review.rating', false] }, 1, 0] } },
          totalEarnings: { $sum: { $cond: [{ $eq: ['$status', ReadingStatus.ARCHIVED] }, '$readingOption.finalPrice', 0] } }
        }
      }
    ])

    const row = agg?.[0] || null

  const totalReadings = Number(row?.totalReadings ?? (reader.stats?.totalReadings ?? 0))
  const archivedCount = Number(row?.archivedCount ?? 0)
  const avgRaw = row?.avgRating != null ? Number(row.avgRating) : (reader.stats?.averageRating ?? 0)
  const averageRating = Number(Number.isFinite(avgRaw) ? Number(avgRaw).toFixed(2) : 0)
  const totalEarnings = Number(row?.totalEarnings ?? (reader.stats?.totalEarnings ?? 0))
  const completionRate = totalReadings > 0 ? Math.round((archivedCount / totalReadings) * 100) : (reader.stats?.completionRate ?? 0)

    const stats = {
      totalReadings,
      archivedCount,
      averageRating,
      reviewCount: Number(row?.ratingCount ?? 0),
      completionRate,
      totalEarnings
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('[READER_STATS_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
