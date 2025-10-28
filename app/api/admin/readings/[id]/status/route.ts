import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '@/lib/database'
import { z } from 'zod'
import Reading from '@/models/Reading'
import Reader from '@/models/Reader'
import User from '@/models/User'

const bodySchema = z.object({
  status: z.enum([
    'suggested',
    'instant_queue',
    'scheduled',
    'message_queue',
    'in_progress',
    'completed',
    'disputed',
    'refunded',
    'archived',
  ]),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure caller is an admin
    await dbConnect()
    const adminUser = await User.findOne({ clerkId: userId })
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.issues }, { status: 400 })
    }

    const { status } = parsed.data

    const reading = await Reading.findById(id)
    if (!reading) {
      return NextResponse.json({ error: 'Reading not found' }, { status: 404 })
    }

    // Update status
    const updatedReading = await Reading.findByIdAndUpdate(
      id,
      { $set: { status, updatedAt: new Date() } },
      { new: true }
    )

    // Side-effects: update reader availability if applicable
    try {
      const readerId = reading.readerId
      if (status === 'in_progress') {
        await Reader.findOneAndUpdate(
          { userId: readerId },
          { $set: { status: 'busy', lastActive: new Date() } }
        )
      }

      if (status === 'archived') {
        const remaining = await Reading.countDocuments({ readerId: reading.readerId, status: 'in_progress' })
        if (remaining === 0) {
          await Reader.findOneAndUpdate(
            { userId: reading.readerId },
            { $set: { status: 'available', lastActive: new Date() } }
          )
        }
      }
    } catch (err) {
      console.error('[ADMIN_READING_STATUS_SIDE_EFFECT] Failed to reconcile reader status:', err)
    }

    return NextResponse.json({ reading: updatedReading })
  } catch (error) {
    console.error('Error in admin update reading status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
