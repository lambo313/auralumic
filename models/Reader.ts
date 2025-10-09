import mongoose from 'mongoose';

const readingTimeSpanSchema = new mongoose.Schema({
  duration: { type: Number, required: true }, // in minutes
  label: { type: String, required: true }, // "15 minutes", "30 minutes", etc.
  multiplier: { type: Number, required: true }, // Price multiplier
  isActive: { type: Boolean, default: true }
}, { _id: false });

const weeklyScheduleSchema = new mongoose.Schema({
  monday: [{ start: String, end: String }],
  tuesday: [{ start: String, end: String }],
  wednesday: [{ start: String, end: String }],
  thursday: [{ start: String, end: String }],
  friday: [{ start: String, end: String }],
  saturday: [{ start: String, end: String }],
  sunday: [{ start: String, end: String }]
}, { _id: false });

const readerSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Clerk user ID - keeping as string for Clerk integration
  username: { type: String, required: true, unique: true }, // Unique username for the reader
  profileImage: { type: String, required: true },
  backgroundImage: String,
  tagline: { type: String, required: true },
  location: { type: String, required: true }, // Format: "State, Country"
  aboutMe: { type: String }, // Video link for about me section
  additionalInfo: { type: String }, // Added additionalInfo field
  isOnline: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  status: { type: String, default: "pending" }, // Reader status (e.g., pending, approved, rejected, suspended)
  
  // Approval tracking
  approvedAt: { type: Date },
  approvedBy: { type: String }, // Admin user ID who approved
  rejectedAt: { type: Date },
  rejectedBy: { type: String }, // Admin user ID who rejected
  
  languages: { type: [String], default: [] }, // List of languages
  attributes: {
    tools: {
      type: [String],
      validate: {
        validator: function(v: string[]): boolean {
          return v.length <= 3;
        },
        message: 'Tools array cannot have more than 3 items'
      }
    },
    abilities: {
      type: [String],
      validate: {
        validator: function(v: string[]): boolean {
          return v.length <= 3;
        },
        message: 'Abilities array cannot have more than 3 items'
      }
    },
    style: String // max 1 as it's a single string
  },
  availability: {
    schedule: { type: weeklyScheduleSchema, required: true },
    timezone: { type: String, required: true },
    instantBooking: { type: Boolean, default: false }
  },
  stats: {
    totalReadings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
  },
  readingOptions: [{
    type: { type: String, enum: ['phone_call', 'video_message', 'live_video'] },
    name: { type: String, required: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true }, // base price in credits
    timeSpans: [readingTimeSpanSchema],
    isActive: { type: Boolean, default: true }
  }],
  badges: [{ type: String }], // Badge IDs
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for performance
// Note: userId and username indexes are automatically created by unique: true
readerSchema.index({ isApproved: 1, isOnline: 1 });
readerSchema.index({ 'stats.averageRating': -1 });
readerSchema.index({ createdAt: -1 });

// Static method to find approved and online readers
readerSchema.statics.findAvailable = function() {
  return this.find({ isApproved: true, isOnline: true })
    .populate('reviews', 'rating comment clientId createdAt');
};

// Virtual for full profile URL
readerSchema.virtual('profileUrl').get(function() {
  return `/reader/${this.username}`;
});

export default mongoose.models.Reader || mongoose.model('Reader', readerSchema);
