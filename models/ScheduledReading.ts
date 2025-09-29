import mongoose from 'mongoose';

const scheduledReadingSchema = new mongoose.Schema({
  readingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reading',
    required: true,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  timeZone: {
    type: String,
    required: true,
  },
  remindersSent: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for querying readings by date range
scheduledReadingSchema.index({ scheduledDate: 1, status: 1 });

// Middleware to update the updatedAt timestamp
scheduledReadingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const ScheduledReading = mongoose.models.ScheduledReading || 
  mongoose.model('ScheduledReading', scheduledReadingSchema);
