import mongoose from 'mongoose';

export enum NotificationType {
  READING_ACCEPTED = 'reading_accepted',
  READING_DECLINED = 'reading_declined',
  READING_COMPLETED = 'reading_completed',
  REVIEW_REQUEST = 'review_request',
  NEW_COMMENT = 'new_comment',
  POST_LIKED = 'post_liked',
  DISPUTE_FILED = 'dispute_filed'
}

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Clerk user ID
  type: { 
    type: String,
    enum: Object.values(NotificationType),
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedId: String,
  actionUrl: String,
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

// Static method to find unread notifications for user
notificationSchema.statics.findUnreadForUser = function(userId: string) {
  return this.find({ userId, isRead: false }).sort({ createdAt: -1 });
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = function(userId: string, notificationIds: string[]) {
  return this.updateMany(
    { userId, _id: { $in: notificationIds } },
    { $set: { isRead: true } }
  );
};

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
