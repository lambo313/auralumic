// Use Reader interface from types/index.ts for consistency

export interface ReadingRequest {
  id: string;
  readerId: string;
  clientId: string;
  status: 'pending' | 'inProgress' | 'cancelled' | 'completed';
  topic: string;
  message?: string;
  createdAt: Date;
  scheduledFor?: Date;
}

export interface Reading {
  id: string;
  readerId: string;
  clientId: string;
  status: 'scheduled' | 'inProgress' | 'completed' | 'cancelled';
  type: 'video' | 'audio' | 'chat';
  topic: string;
  duration: number;
  startedAt?: Date;
  completedAt?: Date;
  recording?: string;
  transcript?: string;
  rating?: number;
  review?: string;
}
