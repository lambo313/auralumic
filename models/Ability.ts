import mongoose from 'mongoose';

const abilitySchema = new mongoose.Schema({
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
abilitySchema.index({ name: 1 });
// Note: id field already has unique index from unique: true property

export default mongoose.models.Ability || mongoose.model('Ability', abilitySchema);