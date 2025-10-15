import { useState, useEffect } from "react";
import { useAuth } from "./use-auth";

export type ReaderStatus = 'available' | 'busy' | 'offline';

interface UseReaderStatusReturn {
  status: ReaderStatus;
  isOnline: boolean;
  loading: boolean;
  error: string | null;
  updateStatus: (newStatus: ReaderStatus) => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export function useReaderStatus(): UseReaderStatusReturn {
  const { user, role } = useAuth();
  const [status, setStatus] = useState<ReaderStatus>('offline');
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = async () => {
    if (!user || role !== 'reader') return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/readers/status');
      if (!response.ok) {
        throw new Error('Failed to fetch reader status');
      }

      const data = await response.json();
      setStatus(data.status);
      setIsOnline(data.isOnline);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
      console.error('Error fetching reader status:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: ReaderStatus) => {
    if (!user || role !== 'reader') {
      throw new Error('Only readers can update status');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/readers/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reader status');
      }

      const data = await response.json();
      setStatus(data.status);
      setIsOnline(data.isOnline);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      console.error('Error updating reader status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial status when component mounts or user/role changes
  useEffect(() => {
    if (user && role === 'reader') {
      refreshStatus();
    }
  }, [user, role]);

  return {
    status,
    isOnline,
    loading,
    error,
    updateStatus,
    refreshStatus,
  };
}