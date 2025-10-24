import mongoose from 'mongoose';

const readingTimeSpanSchema = new mongoose.Schema({
  duration: { type: Number, required: true }, // in minutes
  label: { type: String, required: true }, // "15 minutes", "30 minutes", etc.
  multiplier: { type: Number, required: true } // Price multiplier
}, { _id: false });

export enum ReadingStatus {
  SUGGESTED = 'suggested',
  INSTANT_QUEUE = 'instant_queue',
  SCHEDULED = 'scheduled', 
  MESSAGE_QUEUE = 'message_queue',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
  DISPUTED = 'disputed',
  REFUNDED = 'refunded'
}

export enum Topic {
  CAREER_WORK = 'Career & Work',
  LOST_SEEKING = 'Lost & Seeking',
  LOVE_RELATIONSHIPS = 'Love & Relationships',
  PAST_LIFE = 'Past Life',
  LIFE_PATH = 'Life Path',
  FUTURE_LIFE = 'Future Life'
}

const readingSchema = new mongoose.Schema({
  clientId: { type: String, required: true }, // Clerk user ID
  readerId: { type: String, required: true }, // Clerk user ID
  topic: { 
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        // Allow any non-empty string
        return typeof v === 'string' && v.length > 0;
      },
      message: 'Topic must be a non-empty string'
    }
  },
  question: String,
  readingOption: {
    type: { type: String, enum: ['phone_call', 'video_message', 'live_video'], required: true },
    basePrice: { type: Number, required: true }, // base price in credits
    timeSpan: { type: readingTimeSpanSchema, required: true },
    finalPrice: { type: Number, required: true } // final price after multiplier applied
  },
  scheduledDate: Date,
  status: { 
    type: String,
    enum: Object.values(ReadingStatus),
    default: ReadingStatus.INSTANT_QUEUE
  },
  credits: { type: Number, required: true },
  readingLink: String, // Renamed from deliveryUrl
  title: String, // Reading title for notes
  notes: String, // Reading notes
  review: {
    rating: { type: Number },
    review: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  completedDate: Date
}, {
  timestamps: true
});

// Indexes for performance
readingSchema.index({ clientId: 1, createdAt: -1 });
readingSchema.index({ readerId: 1, createdAt: -1 });
readingSchema.index({ status: 1 });
readingSchema.index({ scheduledDate: 1 });
readingSchema.index({ createdAt: -1 });

// Static method to find readings by status
readingSchema.statics.findByStatus = function(status: ReadingStatus) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to find readings for a client
readingSchema.statics.findByClient = function(clientId: string) {
  return this.find({ clientId }).sort({ createdAt: -1 });
};

// Static method to find readings for a reader
readingSchema.statics.findByReader = function(readerId: string) {
  return this.find({ readerId }).sort({ createdAt: -1 });
};

// Clear any cached model to ensure fresh schema
if (mongoose.models.Reading) {
  delete mongoose.models.Reading;
}

export default mongoose.model('Reading', readingSchema);
