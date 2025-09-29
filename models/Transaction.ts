import mongoose from 'mongoose';

export enum TransactionType {
  CREDIT_PURCHASE = 'credit_purchase',
  READING_PAYMENT = 'reading_payment',
  REFUND = 'refund'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { 
    type: String,
    enum: Object.values(TransactionType),
    required: true
  },
  amount: { type: Number, required: true }, // in cents
  credits: { type: Number, required: true },
  status: { 
    type: String,
    enum: Object.values(TransactionStatus),
    default: TransactionStatus.PENDING
  },
  stripePaymentId: String,
  readingId: String, // Optional, only for reading payments
  packageId: String, // Optional, only for credit purchases
  metadata: { type: Map, of: String },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
