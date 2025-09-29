import mongoose from 'mongoose';

export enum SuggestedReadingType {
  TAROT = 'tarot',
  ASTROLOGY = 'astrology',
  NUMEROLOGY = 'numerology',
  PSYCHIC = 'psychic',
  ORACLE_CARDS = 'oracle_cards',
  RUNES = 'runes',
  PALMISTRY = 'palmistry',
  CRYSTAL_READING = 'crystal_reading',
  DREAM_INTERPRETATION = 'dream_interpretation',
  ENERGY_HEALING = 'energy_healing',
  INTUITIVE_GUIDANCE = 'intuitive_guidance'
}

const suggestedReadingSchema = new mongoose.Schema({
  statusId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Status', 
    required: true 
  },
  readerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Reader', 
    required: true 
  },
  readerName: { 
    type: String, 
    required: true 
  },
  readerAvatarUrl: { 
    type: String 
  },
  title: { 
    type: String, 
    required: true,
    minlength: 5,
    maxlength: 100
  },
  description: { 
    type: String, 
    required: true,
    minlength: 20,
    maxlength: 500
  },
  suggestedType: { 
    type: String, 
    enum: Object.values(SuggestedReadingType),
    required: true
  },
  estimatedDuration: { 
    type: Number, 
    required: true,
    min: 5,
    max: 180 // Max 3 hours
  },
  suggestedPrice: { 
    type: Number, 
    min: 1,
    max: 1000
  },
  message: { 
    type: String,
    maxlength: 300
  },
  isAccepted: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexes for performance
suggestedReadingSchema.index({ statusId: 1, createdAt: -1 });
suggestedReadingSchema.index({ readerId: 1, isAccepted: 1 });
suggestedReadingSchema.index({ suggestedType: 1 });

// Middleware to update updatedAt on save
suggestedReadingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to accept this suggestion
suggestedReadingSchema.methods.accept = function() {
  this.isAccepted = true;
  this.updatedAt = new Date();
  return this.save();
};

// Static method to find suggestions for a status
suggestedReadingSchema.statics.findByStatus = function(statusId: string) {
  return this.find({ statusId })
    .populate('readerId', 'username profileImage')
    .sort({ createdAt: -1 });
};

// Static method to find suggestions by reader
suggestedReadingSchema.statics.findByReader = function(readerId: string) {
  return this.find({ readerId })
    .populate('statusId', 'content category mood')
    .sort({ createdAt: -1 });
};

const SuggestedReading = mongoose.models.SuggestedReading || mongoose.model('SuggestedReading', suggestedReadingSchema);

export { SuggestedReading };
export default SuggestedReading;