'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import type { Reading } from '@/types/readings';

interface ReadingsData {
  acceptedReadings: Reading[];
  requestedReadings: Reading[];
  suggestedReadings: Reading[];
  archivedReadings: Reading[];
  loading: boolean;
  error: Error | null;
}

export function useReadings(): ReadingsData {
  const { user } = useAuth();
  const [data, setData] = useState<ReadingsData>({
    acceptedReadings: [],
    requestedReadings: [],
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
          requested: Reading[];
          suggested: Reading[];
          archived: Reading[];
        }>(
          (acc, reading) => {
            if (reading.status === 'completed' || reading.status === 'declined') {
              acc.archived.push(reading);
            } else if (reading.status === 'accepted') {
              acc.accepted.push(reading);
            } else if (reading.status === 'requested') {
              acc.requested.push(reading);
            } else if (reading.status === 'suggested') {
              acc.suggested.push(reading);
            }
            return acc;
          },
          { accepted: [], requested: [], suggested: [], archived: [] }
        );

        setData({
          acceptedReadings: sorted.accepted,
          requestedReadings: sorted.requested,
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
