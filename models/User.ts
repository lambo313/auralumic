import mongoose from 'mongoose';

export enum UserRole {
  CLIENT = 'client',
  READER = 'reader',
  ADMIN = 'admin',
}

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  username: { type: String },
  role: { 
    type: String, 
    enum: Object.values(UserRole),
    default: UserRole.CLIENT 
  },
  credits: { type: Number, default: 0 },
  subscriptionId: String,
  timezone: { type: String, default: 'America/New_York' },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
    }
  },
  hasCompletedOnboarding: { type: Boolean, default: false },
  lastLogin: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Export both default and named export for compatibility
export { User };
export default User;
