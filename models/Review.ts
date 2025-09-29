import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  readingId: { type: String, required: true },
  clientId: { type: String, required: true },
  readerId: { type: String, required: true },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  comment: { type: String, required: true },
  isDisputed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
