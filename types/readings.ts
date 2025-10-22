export type ReadingStatus = 'suggested' | 'instant_queue' | 'scheduled' | 'message_queue' | 'in_progress' | 'completed' | 'disputed' | 'refunded' | 'archived';

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
  status: ReadingStatus;
  credits: number;
  readingLink?: string; // Renamed from deliveryUrl
  createdAt: Date;
  completedDate?: Date;
  updatedAt: Date;
}

// UI state for reading request form
export interface ReadingRequest {
  readerId: string;
  topic: string;
  description: string;
  question?: string; // For API compatibility
  duration: number;
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
  scheduledDate?: string;
  timeZone: string;
  creditCost: number;
  status: 'instant_queue' | 'scheduled' | 'message_queue';
}

// API payload type (matches the Zod schema in API route)
export interface CreateReadingPayload {
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
  scheduledDate?: string;
  timeZone?: string;
  status?: 'instant_queue' | 'scheduled' | 'message_queue';
}
