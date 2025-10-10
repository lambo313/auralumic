export type ReadingStatus = 'requested' | 'suggested' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'disputed' | 'refunded';

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
  deliveryUrl?: string;
  createdAt: Date;
  completedDate?: Date;
  updatedAt: Date;
}

export interface ReadingRequest {
  readerId: string;
  topic: string;
  description: string;
  question?: string; // Add for API compatibility
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
  scheduledDate?: string; // String for API compatibility
  timeZone: string;
  creditCost: number;
  status: string;
}
