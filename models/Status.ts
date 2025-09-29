import mongoose from 'mongoose';

export enum StatusMood {
  SEEKING_GUIDANCE = 'seeking_guidance',
  CONFUSED = 'confused',
  HOPEFUL = 'hopeful',
  ANXIOUS = 'anxious',
  EXCITED = 'excited',
  UNCERTAIN = 'uncertain',
  GRATEFUL = 'grateful',
  OVERWHELMED = 'overwhelmed'
}

export enum StatusCategory {
  LOVE = 'love',
  CAREER = 'career',
  SPIRITUAL = 'spiritual',
  GENERAL = 'general',
  FAMILY = 'family',
  HEALTH = 'health',
  FINANCES = 'finances',
  PERSONAL_GROWTH = 'personal_growth'
}

const statusSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true,
    minlength: 10,
    maxlength: 500
  },
  mood: { 
    type: String, 
    enum: Object.values(StatusMood),
    default: StatusMood.SEEKING_GUIDANCE
  },
  category: { 
    type: String, 
    enum: Object.values(StatusCategory),
    default: StatusCategory.GENERAL
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  suggestedReadings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuggestedReading'
  }],
  acceptedSuggestedReadingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuggestedReading',
    default: null
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
statusSchema.index({ userId: 1, isActive: 1 });
statusSchema.index({ category: 1, isActive: 1 });
statusSchema.index({ createdAt: -1 });

// Middleware to update updatedAt on save
statusSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for getting suggested readings count
statusSchema.virtual('suggestedReadingsCount').get(function() {
  return this.suggestedReadings.length;
});

// Method to accept a suggested reading
statusSchema.methods.acceptSuggestedReading = function(suggestedReadingId: string) {
  this.acceptedSuggestedReadingId = suggestedReadingId;
  this.isActive = false;
  this.updatedAt = new Date();
  return this.save();
};

const Status = mongoose.models.Status || mongoose.model('Status', statusSchema);

export { Status };
export default Status;