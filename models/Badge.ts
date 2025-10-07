import mongoose from 'mongoose';

export enum BadgeTier {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold'
}

const badgeSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  attribute: { 
    type: String, 
    required: true,
    trim: true
  }, // Reference to ability, tool, or style
  tier: { 
    type: String,
    enum: Object.values(BadgeTier),
    required: true
  },
  requirements: {
    readingsCompleted: { type: Number, required: true },
    averageRating: { type: Number, required: true },
    timeframe: { type: Number, required: true } // Days
  },
  icon: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Create indexes for efficient searching
badgeSchema.index({ attribute: 1, tier: 1 });
// Note: id field already has unique index from unique: true property
badgeSchema.index({ name: 1 });

export default mongoose.models.Badge || mongoose.model('Badge', badgeSchema);
