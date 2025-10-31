import { z } from 'zod';
import { UserRole } from '@/models/User';
import { ReadingStatus, Topic } from '@/models/Reading';
import { NotificationType } from '@/models/Notification';
import { BadgeTier } from '@/models/Badge';

// User validation schemas
export const userRoleSchema = z.enum(['client', 'reader', 'admin']);

export const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1).max(50),
  role: userRoleSchema.optional().default('client')
});

export const updateUserSchema = z.object({
  role: userRoleSchema.optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
  username: z.string().min(1).max(50).optional(),
  hasCompletedOnboarding: z.boolean().optional()
});

// Reader validation schemas
export const weeklyScheduleSchema = z.object({
  monday: z.array(z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  })).default([]),
  tuesday: z.array(z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  })).default([]),
  wednesday: z.array(z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  })).default([]),
  thursday: z.array(z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  })).default([]),
  friday: z.array(z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  })).default([]),
  saturday: z.array(z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  })).default([]),
  sunday: z.array(z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  })).default([])
});

export const readerApplicationSchema = z.object({
  username: z.string().min(1).max(50),
  // Accept any string for profileImage (URL, data URI, blob URL, or empty) to support various upload flows
  profileImage: z.string().optional(),
  tagline: z.string().min(1).max(200),
  location: z.string().min(1).max(100),
  additionalInfo: z.string().max(1000).optional(),
  languages: z.array(z.string()).max(10).default([]),
  attributes: z.object({
    tools: z.array(z.string()).max(3),
    abilities: z.array(z.string()).max(3),
    style: z.string().optional()
  }),
  availability: z.object({
    schedule: weeklyScheduleSchema,
    timezone: z.string(),
    instantBooking: z.boolean().default(false)
  })
});

// Reading validation schemas
export const readingTopicSchema = z.enum([
  'Career & Work',
  'Lost & Seeking', 
  'Love & Relationships',
  'Past Life',
  'Life Path',
  'Future Life'
]);

export const readingStatusSchema = z.enum([
  'suggested',
  'instant_queue',
  'scheduled', 
  'message_queue',
  'in_progress',
  'completed',
  'disputed',
  'refunded'
]);

export const readingOptionTypeSchema = z.enum(['phone_call', 'video_message', 'live_video']);

export const createReadingSchema = z.object({
  readerId: z.string().min(1),
  topic: readingTopicSchema,
  question: z.string().max(1000).optional(),
  description: z.string().min(1).max(1000),
  readingOption: z.object({
    type: readingOptionTypeSchema,
    basePrice: z.number().min(1),
    timeSpan: z.object({
      duration: z.number().min(15).max(120),
      label: z.string(),
      multiplier: z.number().min(1)
    }),
    finalPrice: z.number().min(1)
  }),
  scheduledDate: z.string().transform(str => new Date(str)).optional(),
});

// Notification validation schemas
export const notificationTypeSchema = z.enum([
  'reading_in_progress',
  'reading_cancelled', 
  'reading_completed',
  'reading_request',
  'review_request',
  'new_comment',
  'post_liked',
  'dispute_filed',
  'reader_application_rejected'
]);

export const createNotificationSchema = z.object({
  userId: z.string().min(1),
  type: notificationTypeSchema,
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(500),
  relatedId: z.string().optional(),
  actionUrl: z.string().url().optional()
});

// Badge validation schemas
export const badgeTierSchema = z.enum(['Bronze', 'Silver', 'Gold']);

export const createBadgeSchema = z.object({
  name: z.string().min(1).max(100),
  attribute: z.string().min(1).max(50),
  tier: badgeTierSchema,
  requirements: z.object({
    readingsCompleted: z.number().min(1),
    averageRating: z.number().min(1).max(5).optional(),
    timeframe: z.string().optional()
  }),
  icon: z.string().min(1),
  description: z.string().min(1).max(500)
});

// Credit validation schemas
export const creditPackageSchema = z.object({
  name: z.string().min(1).max(100),
  credits: z.number().min(1),
  price: z.number().min(1), // in cents
  discount: z.number().min(0).max(100).optional(),
  isPopular: z.boolean().default(false),
  stripePriceId: z.string().min(1),
  isActive: z.boolean().default(true)
});

// Status validation schemas
export const statusMoodSchema = z.enum([
  'seeking_guidance',
  'confused',
  'hopeful', 
  'anxious',
  'excited',
  'uncertain',
  'grateful',
  'overwhelmed'
]);

export const statusCategorySchema = z.enum([
  'love',
  'career',
  'spiritual',
  'general',
  'family',
  'health',
  'finances',
  'personal_growth'
]);

export const createStatusSchema = z.object({
  content: z.string().min(10).max(500),
  mood: statusMoodSchema.optional(),
  category: statusCategorySchema.optional()
});

export const updateStatusSchema = z.object({
  content: z.string().min(10).max(500).optional(),
  mood: statusMoodSchema.optional(),
  category: statusCategorySchema.optional(),
  isActive: z.boolean().optional()
});

// SuggestedReading validation schemas
export const suggestedReadingTypeSchema = z.enum([
  'tarot',
  'astrology', 
  'numerology',
  'psychic',
  'oracle_cards',
  'runes',
  'palmistry',
  'crystal_reading',
  'dream_interpretation',
  'energy_healing',
  'intuitive_guidance'
]);

export const createSuggestedReadingSchema = z.object({
  statusId: z.string().min(1),
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(500),
  suggestedType: suggestedReadingTypeSchema,
  estimatedDuration: z.number().min(5).max(180),
  suggestedPrice: z.number().min(1).max(1000).optional(),
  message: z.string().max(300).optional()
});

export const updateSuggestedReadingSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(20).max(500).optional(),
  suggestedType: suggestedReadingTypeSchema.optional(),
  estimatedDuration: z.number().min(5).max(180).optional(),
  suggestedPrice: z.number().min(1).max(1000).optional(),
  message: z.string().max(300).optional(),
  isAccepted: z.boolean().optional()
});

// Admin validation schemas
export const adminStatsFiltersSchema = z.object({
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional()
});

export const categorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  isActive: z.boolean().default(true)
});

export const attributeSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(200)
});

// Search and pagination schemas
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10)
});

export const readersSearchSchema = z.object({
  query: z.string().optional(),
  ...paginationSchema.shape
});

export const userFiltersSchema = z.object({
  role: userRoleSchema.optional(),
  status: z.enum(['active', 'inactive', 'all']).default('all'),
  search: z.string().optional()
});