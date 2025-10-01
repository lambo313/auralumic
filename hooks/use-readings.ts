'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import type { Reading } from '@/types/readings';

interface ReadingsData {
  acceptedReadings: Reading[];
  requestedReadings: Reading[];
  archivedReadings: Reading[];
  loading: boolean;
  error: Error | null;
}

export function useReadings(): ReadingsData {
  const { user } = useAuth();
  const [data, setData] = useState<ReadingsData>({
    acceptedReadings: [],
    requestedReadings: [],
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

        const readings = await response.json();
        
        // Ensure readings is an array
        const readingsArray: Reading[] = Array.isArray(readings) ? readings : [];

        // Sort readings into categories
        const sorted = readingsArray.reduce<{
          accepted: Reading[];
          requested: Reading[];
          archived: Reading[];
        }>(
          (acc, reading) => {
            if (reading.status === 'completed' || reading.status === 'declined') {
              acc.archived.push(reading);
            } else if (reading.status === 'accepted') {
              acc.accepted.push(reading);
            } else if (reading.status === 'requested') {
              acc.requested.push(reading);
            }
            return acc;
          },
          { accepted: [], requested: [], archived: [] }
        );

        setData({
          acceptedReadings: sorted.accepted,
          requestedReadings: sorted.requested,
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
