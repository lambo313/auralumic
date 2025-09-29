import mongoose from 'mongoose';

export enum BadgeTier {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold'
}

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  attribute: { type: String, required: true }, // Reference to ability, tool, or style
  tier: { 
    type: String,
    enum: Object.values(BadgeTier),
    required: true
  },
  requirements: {
    readingsCompleted: { type: Number, required: true },
    averageRating: Number,
    timeframe: String
  },
  icon: { type: String, required: true },
  description: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.models.Badge || mongoose.model('Badge', badgeSchema);
