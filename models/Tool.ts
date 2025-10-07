import mongoose from 'mongoose';

const toolSchema = new mongoose.Schema({
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
  }
}, {
  timestamps: true
});

// Create indexes for efficient searching
toolSchema.index({ name: 1 });
// Note: id field already has unique index from unique: true property

export default mongoose.models.Tool || mongoose.model('Tool', toolSchema);