export interface WeeklySchedule {
  monday: { start: string; end: string }[];
  tuesday: { start: string; end: string }[];
  wednesday: { start: string; end: string }[];
  thursday: { start: string; end: string }[];
  friday: { start: string; end: string }[];
  saturday: { start: string; end: string }[];
  sunday: { start: string; end: string }[];
}

export interface ReaderAttributes {
  abilities: string[];
  tools: string[];
  style: string;
}

export interface ReaderAvailability {
  schedule: WeeklySchedule;
  timezone: string;
  instantBooking?: boolean;
}

// Reader profile types
export interface Reader {
  id: string;
  userId: string;
  username: string;
  profileImage: string;
  backgroundImage?: string;
  tagline: string;
  location: string;
  aboutMe?: string;
  additionalInfo?: string;
  isOnline: boolean;
  isApproved: boolean;
  status: string;
  languages: string[];
  attributes: {
    tools: string[];
    abilities: string[];
    style?: string;
  };
  availability: {
    schedule: WeeklySchedule;
    timezone: string;
    instantBooking: boolean;
  };
  stats: {
    totalReadings: number;
    averageRating: number;
    totalEarnings: number;
    completionRate: number;
  };
  readingOptions: Array<{
    type: 'phone_call' | 'video_message' | 'live_video';
    name: string;
    description: string;
    basePrice: number;
    timeSpans: Array<{ duration: number; label: string; multiplier: number; isActive: boolean }>;
    isActive: boolean;
  }>;
  badges: string[];
  reviews: string[];
  createdAt: Date;
  lastActive: Date;
  updatedAt: Date;
}
export * from './readings'

// Status and suggested reading types
export interface Status {
  id: string;
  userId: string; // Client who posted the status
  content: string;
  mood?: string; // e.g., "seeking guidance", "confused", "hopeful", etc.
  category?: string; // e.g., "love", "career", "spiritual", "general"
  isActive: boolean; // Whether this status is still accepting suggestions
  createdAt: Date;
  updatedAt: Date;
  suggestedReadings: SuggestedReading[];
  acceptedSuggestedReadingId?: string; // ID of accepted suggested reading (closes the status)
}

export interface SuggestedReading {
  id: string;
  statusId: string; // Status this is responding to
  readerId: string; // Reader who suggested this
  readerName: string;
  readerAvatarUrl?: string;
  title: string;
  description: string;
  suggestedType: string; // e.g., "tarot", "astrology", "numerology"
  estimatedDuration: number; // in minutes
  suggestedPrice?: number; // in credits
  message?: string; // Personal message from reader
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientStatusSummary {
  id: string;
  name: string;
  avatarUrl?: string;
  currentStatus?: Status;
  totalStatuses: number;
  joinDate: Date;
  lastActive: Date;
  preferredCategories?: string[];
}

// Import enums from models for consistency
export { UserRole } from '@/models/User';
export { ReadingStatus, Topic as ReadingTopic } from '@/models/Reading';
export { NotificationType } from '@/models/Notification';
export { BadgeTier } from '@/models/Badge';

// Core user types
export interface User {
  id: string;
  clerkId: string;
  email: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  role: 'client' | 'reader' | 'admin';
  credits: number;
  subscriptionId?: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
  };
  hasCompletedOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
}


// Reading related types
export interface Reading {
  id: string;
  clientId: string;
  readerId: string;
  topic: string;
  question?: string;
  readingOption: {
    type: 'phone_call' | 'video_message' | 'live_video';
    basePrice: number;
    timeSpan: {
      duration: number;
      label: string;
      multiplier: number;
    };
    finalPrice: number;
  };
  scheduledDate?: Date;
  status: 'requested' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'disputed' | 'refunded';
  credits: number;
  deliveryUrl?: string;
  createdAt: Date;
  completedDate?: Date;
  updatedAt: Date;
}

// Badge system
export interface Badge {
  id: string;
  name: string;
  attribute: string;
  tier: 'Bronze' | 'Silver' | 'Gold';
  requirements: {
    readingsCompleted: number;
    averageRating?: number;
    timeframe?: string;
  };
  icon: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// Availability scheduling
export interface Availability {
  day: number; // 0-6 for Sunday-Saturday
  startTime: string; // HH:mm format
  endTime: string;
  timezone: string;
}

// Notification system
export interface NotificationData {
  readingId?: string;
  readerId?: string;
  clientId?: string;
  credits?: number;
  badgeId?: string;
  reviewId?: string;
  notificationId?: string;
  messageId?: string;
  amount?: number;
  packageId?: string;
  scheduledDate?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'reading_accepted' | 'reading_declined' | 'reading_completed' | 'review_request' | 'new_comment' | 'post_liked' | 'dispute_filed';
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PostCategory = 
  | 'yearly'
  | 'monthly'
  | 'weekly'
  | 'daily'
  | 'shadow-work'
  | 'mirror-work'
  | 'astrology'
  | 'chakras';

// Post and interaction types
export interface Post {
  id: string;
  authorId: string;
  content: string;
  images?: string[];
  likes: number;
  comments: Comment[];
  isLiked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

// Credit package system
export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number; // Price in cents
  discount?: number; // Percentage discount
  isPopular?: boolean;
}
