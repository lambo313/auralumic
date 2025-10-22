import { pusherServer } from '@/lib/pusher';
import dbConnect from '@/lib/database';
import Notification, { NotificationType } from '@/models/Notification';

interface NotificationData {
  readingId?: string;
  readerId?: string;
  clientId?: string;
  credits?: number;
  badgeId?: string;
  messageId?: string;
  reviewId?: string;
  notificationId?: string;
};

export const sendNotification = async ({
  userId,
  type,
  message,
  data,
}: {
  userId: string;
  type: NotificationType;
  message: string;
  data?: NotificationData;
}) => {
  try {
    await pusherServer.trigger(`user-${userId}`, 'notification', {
      type,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Notification send failed:', error);
    throw error;
  }
};

export const notificationTypes: Record<string, NotificationType> = {
  READING_IN_PROGRESS: NotificationType.READING_IN_PROGRESS,
  READING_CANCELLED: NotificationType.READING_CANCELLED,
  READING_COMPLETED: NotificationType.READING_COMPLETED,
  REVIEW_REQUEST: NotificationType.REVIEW_REQUEST,
  NEW_COMMENT: NotificationType.NEW_COMMENT,
  POST_LIKED: NotificationType.POST_LIKED,
  DISPUTE_FILED: NotificationType.DISPUTE_FILED,
} as const;

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  data,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
}) => {
  // Connect to database
  await dbConnect();
  
  // Store notification in database
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    relatedId: data?.readingId || data?.reviewId || data?.badgeId,
    actionUrl: data?.readingId ? `/readings/${data.readingId}` : undefined,
  });

  // Send real-time notification
  await sendNotification({
    userId,
    type,
    message,
    data: {
      ...data,
      notificationId: notification.id,
    },
  });

  return notification;
};
