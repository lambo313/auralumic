import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import dbConnect from "@/lib/database"
import Reader from "@/models/Reader"
import Reading, { ReadingStatus } from '@/models/Reading'
import { getMockReaderById } from "@/components/readers/mock-reader-data"
import mongoose from "mongoose"

interface LeanReaderDocument {
  _id: mongoose.Types.ObjectId;
  userId: string;
  isApproved: boolean;
  stats?: {
    totalReadings?: number;
    averageRating?: number;
    totalEarnings?: number;
    completionRate?: number;
    archivedCount?: number;
  };
  [key: string]: unknown;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await context.params

    console.log("GET /api/readers/[id] - userId from auth:", userId, "requested id:", id);

    await dbConnect()

    // Try to find reader by MongoDB _id first (only if it's a valid ObjectId)
    let reader: LeanReaderDocument | null = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      reader = await Reader.findById(id)
        .select('-__v')
        .lean() as LeanReaderDocument | null;
      console.log("Reader found by _id:", reader ? "yes" : "no");
    }

    // If not found by _id, try by userId (for backward compatibility)
    if (!reader) {
      reader = await Reader.findOne({ userId: id })
        .select('-__v')
        .lean() as LeanReaderDocument | null;
      console.log("Reader found by userId:", reader ? "yes" : "no");
    }

    if (reader) {
      console.log("Reader isApproved:", reader.isApproved, "reader.userId:", reader.userId);
    }

    // If no reader found in database, try mock data
    if (!reader) {
      const mockReader = getMockReaderById(id)
      if (mockReader) {
        // Check if mock reader is approved
        if (!mockReader.isApproved) {
          return new NextResponse("Reader not found", { status: 404 })
        }
        // Convert mock reader to API format
        return NextResponse.json({
          ...mockReader,
          createdAt: mockReader.createdAt.toISOString(),
          lastActive: mockReader.lastActive.toISOString(),
          updatedAt: mockReader.updatedAt?.toISOString() || mockReader.createdAt.toISOString()
        })
      }
      return new NextResponse("Reader not found", { status: 404 })
    }

    // Allow access if the reader is approved OR if the authenticated user is the owner
    const isOwner = userId && reader.userId === userId
    console.log("Access check - isOwner:", isOwner, "reader.isApproved:", reader.isApproved);
    
    if (!reader.isApproved && !isOwner) {
      console.log("Access denied - reader not approved and user is not owner");
      return new NextResponse("Reader not found", { status: 404 })
    }

    // Convert _id to id for consistency with frontend expectations
    const formattedReader: any = {
      ...reader,
      id: reader._id.toString()
    };

    // Attach computed stats by aggregating readings for this reader so profile UI can show metrics
    try {
      const readerIdForMatch = reader.userId || String(reader._id)
      const agg = await Reading.aggregate([
        { $match: { readerId: readerIdForMatch } },
        {
          $facet: {
            metrics: [
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
            ],
            clientCounts: [
              { $group: { _id: '$clientId', count: { $sum: 1 } } },
              { $group: { _id: null, uniqueClients: { $sum: 1 }, repeatClients: { $sum: { $cond: [{ $gte: ['$count', 2] }, 1, 0] } } } }
            ],
            pendingReadings: [
              { $match: { status: { $in: [ReadingStatus.INSTANT_QUEUE, ReadingStatus.SCHEDULED, ReadingStatus.MESSAGE_QUEUE] } } },
              // attach basic client info via lookup
              { $lookup: { from: 'users', localField: 'clientId', foreignField: 'clerkId', as: 'client' } },
              { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
              // derive a readable client username: prefer username, then full name, then email
              { $project: { _id: 1, clientId: 1, status: 1, scheduledDate: 1, createdAt: 1, readingOption: 1,
                  clientUsername: {
                    $ifNull: [
                      '$client.username',
                      { $ifNull: [ { $trim: { input: { $concat: [ { $ifNull: ['$client.firstName', ''] }, ' ', { $ifNull: ['$client.lastName', ''] } ] } } }, '$client.email' ] }
                    ]
                  }
              } }
            ]
          }
        }
      ])

      const metrics = agg?.[0]?.metrics?.[0] || null
      const clientStats = agg?.[0]?.clientCounts?.[0] || { uniqueClients: 0, repeatClients: 0 }
  const pending = agg?.[0]?.pendingReadings || []

      const totalReadings = Number(metrics?.totalReadings ?? reader.stats?.totalReadings ?? 0)
      const archivedCount = Number(metrics?.archivedCount ?? 0)
      const avgRaw = metrics?.avgRating != null ? Number(metrics.avgRating) : (reader.stats?.averageRating ?? 0)
      const averageRating = Number(Number.isFinite(avgRaw) ? Number(avgRaw).toFixed(2) : 0)
      const totalEarnings = Number(metrics?.totalEarnings ?? (reader.stats?.totalEarnings ?? 0))
      const completionRate = totalReadings > 0 ? Math.round((archivedCount / totalReadings) * 100) : (reader.stats?.completionRate ?? 0)

      const repeatClientCount = Number(clientStats?.repeatClients ?? 0)
      const uniqueClients = Number(clientStats?.uniqueClients ?? 0)
      const repeatClientRate = uniqueClients > 0 ? Math.round((repeatClientCount / uniqueClients) * 100) : 0

      formattedReader.stats = {
        totalReadings,
        archivedCount,
        averageRating,
        totalEarnings,
        completionRate,
        repeatClientCount,
        repeatClientRate
      }

      // include reviewCount and pendingReviews for UI where useful
    formattedReader.reviewCount = Number(metrics?.ratingCount ?? 0)
    formattedReader.pendingReadings = pending.map((p: any) => ({ id: String(p._id), clientId: p.clientId, clientUsername: p.clientUsername ?? p.client?.username ?? null, status: p.status, scheduledDate: p.scheduledDate, createdAt: p.createdAt, readingOption: p.readingOption }))
    } catch (err) {
      console.warn('[READER_GET] stats aggregation failed', err)
      // fallback to any existing stats on the reader
      formattedReader.stats = {
        totalReadings: reader.stats?.totalReadings ?? 0,
        archivedCount: reader.stats?.archivedCount ?? 0,
        averageRating: reader.stats?.averageRating ?? 0,
        totalEarnings: reader.stats?.totalEarnings ?? 0,
        completionRate: reader.stats?.completionRate ?? 0,
        repeatClientCount: 0,
        repeatClientRate: 0
      }
      formattedReader.reviewCount = 0
  formattedReader.pendingReadings = []
    }

    return NextResponse.json(formattedReader)

  } catch (error) {
    console.error("[READER_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    await dbConnect()

    // Ensure the user is trying to update their own profile
    if (id !== userId) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Check if the reader exists
    let reader = await Reader.findOne({ userId: id })

    // Check if username is being changed and if it's already taken
    if (body.username) {
      const existingUsername = await Reader.findOne({ username: body.username });
      if (existingUsername && existingUsername.userId !== userId) {
        return new NextResponse("Username is already taken", { status: 409 });
      }
    }

    if (!reader) {
      // Create new reader profile if it doesn't exist
      const newReaderData = {
        userId: id,
        username: body.username,
        profileImage: body.profileImage,
        tagline: body.tagline,
        location: body.location,
        experience: body.experience || '',
        additionalInfo: body.additionalInfo || '',
        attributes: body.attributes || { tools: [], abilities: [], style: '' },
        availability: body.availability || {
          schedule: {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
          },
          timezone: 'UTC',
          instantBooking: false
        },
        isApproved: false, // New profiles need approval
        status: 'pending'
      }

      reader = await Reader.create(newReaderData)
    } else {
      // Update existing reader
      reader = await Reader.findByIdAndUpdate(
        reader._id,
        { $set: body },
        { new: true, runValidators: true }
      )
    }

    // Remove __v field from response
    const readerObj = reader.toObject()
    delete readerObj.__v

    return NextResponse.json(readerObj)

  } catch (error) {
    console.error("[READER_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
