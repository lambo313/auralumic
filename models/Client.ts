import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, ref: 'User' }, // Reference to User clerkId
  isActive: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: false },
  languages: { type: [String], default: ['English'] },
  timezone: { type: String, default: 'America/New_York' },
  stats: {
    totalReadings: { type: Number, default: 0 },
    creditsUsed: { type: Number, default: 0 },
    favoriteReaders: [{ type: String }], // Reader userIds
  },
  readings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reading' }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  currentStatus: {
    content: { type: String },
    mood: { type: String },
    category: { type: String },
    isActive: { type: Boolean, default: false },
    postedAt: { type: Date }
  },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for performance
clientSchema.index({ userId: 1 });
clientSchema.index({ isActive: 1 });
clientSchema.index({ lastActive: -1 });

export default mongoose.models.Client || mongoose.model('Client', clientSchema);
