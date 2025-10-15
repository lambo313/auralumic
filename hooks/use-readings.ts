'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import type { Reading } from '@/types/readings';

interface ReadingsData {
  acceptedReadings: Reading[];
  instantQueueReadings: Reading[];
  scheduledReadings: Reading[];
  messageQueueReadings: Reading[];
  suggestedReadings: Reading[];
  archivedReadings: Reading[];
  loading: boolean;
  error: Error | null;
}

export function useReadings(): ReadingsData {
  const { user } = useAuth();
  const [data, setData] = useState<ReadingsData>({
    acceptedReadings: [],
    instantQueueReadings: [],
    scheduledReadings: [],
    messageQueueReadings: [],
    suggestedReadings: [],
    archivedReadings: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchReadings() {
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
          accepted: Reading[];
          instantQueue: Reading[];
          scheduled: Reading[];
          messageQueue: Reading[];
          suggested: Reading[];
          archived: Reading[];
        }>(
          (acc, reading) => {
            if (reading.status === 'completed' || reading.status === 'disputed' || reading.status === 'refunded') {
              acc.archived.push(reading);
            } else if (reading.status === 'in_progress') {
              acc.accepted.push(reading);
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
          { accepted: [], instantQueue: [], scheduled: [], messageQueue: [], suggested: [], archived: [] }
        );

        setData({
          acceptedReadings: sorted.accepted,
          instantQueueReadings: sorted.instantQueue,
          scheduledReadings: sorted.scheduled,
          messageQueueReadings: sorted.messageQueue,
          suggestedReadings: sorted.suggested,
          archivedReadings: sorted.archived,
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
    }

    fetchReadings();
  }, [user]);

  return data;
}
