import mongoose from 'mongoose';

const creditPackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  price: { type: Number, required: true }, // in cents for Stripe
  discount: { type: Number, default: 0 }, // percentage
  isPopular: { type: Boolean, default: false },
  stripePriceId: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.CreditPackage || mongoose.model('CreditPackage', creditPackageSchema);
