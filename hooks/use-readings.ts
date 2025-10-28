'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import type { Reading } from '@/types/readings';

interface ReadingsData {
  inProgressReadings: Reading[];
  instantQueueReadings: Reading[];
  scheduledReadings: Reading[];
  messageQueueReadings: Reading[];
  suggestedReadings: Reading[];
  archivedReadings: Reading[];
  disputedReadings: Reading[];
  refundedReadings: Reading[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useReadings(): ReadingsData {
  const { user } = useAuth();
  const [data, setData] = useState<Omit<ReadingsData, 'refetch'>>({
    inProgressReadings: [],
    instantQueueReadings: [],
    scheduledReadings: [],
    messageQueueReadings: [],
    suggestedReadings: [],
    archivedReadings: [],
    disputedReadings: [],
    refundedReadings: [],
    loading: true,
    error: null,
  });

  const fetchReadings = async () => {
    if (!user) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Get all readings for the user
      const response = await fetch('/api/readings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch readings');
      }

      const data = await response.json();
      
      // Extract readings array from the response object
      const readingsArray: Reading[] = Array.isArray(data.readings) ? data.readings : [];

      // Sort readings into categories
      const sorted = readingsArray.reduce<{
        inProgress: Reading[];
        instantQueue: Reading[];
        scheduled: Reading[];
        messageQueue: Reading[];
        suggested: Reading[];
        archived: Reading[];
        disputed: Reading[];
        refunded: Reading[];
      }>(
        (acc, reading) => {
          // Keep archived, disputed and refunded separate so UI can show them independently
          if (reading.status === 'archived' || reading.status === 'completed') {
            acc.archived.push(reading);
          } else if (reading.status === 'disputed') {
            acc.disputed.push(reading);
          } else if (reading.status === 'refunded') {
            acc.refunded.push(reading);
          } else if (reading.status === 'in_progress') {
            acc.inProgress.push(reading);
          } else if (reading.status === 'instant_queue') {
            acc.instantQueue.push(reading);
          } else if (reading.status === 'scheduled') {
            acc.scheduled.push(reading);
          } else if (reading.status === 'message_queue') {
            acc.messageQueue.push(reading);
          } else if (reading.status === 'suggested') {
            acc.suggested.push(reading);
          }
          return acc;
        },
        { inProgress: [], instantQueue: [], scheduled: [], messageQueue: [], suggested: [], archived: [], disputed: [], refunded: [] }
      );

      setData({
        inProgressReadings: sorted.inProgress,
        instantQueueReadings: sorted.instantQueue,
        scheduledReadings: sorted.scheduled,
        messageQueueReadings: sorted.messageQueue,
        suggestedReadings: sorted.suggested,
        archivedReadings: sorted.archived,
        disputedReadings: sorted.disputed,
        refundedReadings: sorted.refunded,
        loading: false,
        error: null,
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('An error occurred'),
      }));
    }
  };

  useEffect(() => {
    fetchReadings();
  }, [user]);

  return {
    ...data,
    refetch: fetchReadings
  };
}
