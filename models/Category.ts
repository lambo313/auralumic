import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
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
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  icon: { 
    type: String, 
    required: true,
    trim: true
  },
  isActive: { 
    type: Boolean, 
    required: true,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for efficient searching
// Note: id field already has unique index from unique: true property
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });

export default mongoose.models.Category || mongoose.model('Category', categorySchema);