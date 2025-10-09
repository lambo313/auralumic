'use client';

import { useState, useEffect, useCallback } from 'react';
import { readerService } from '@/services/reader-service';
import type { Reader } from '@/types/index';

interface UseReadersResult {
  readers: Reader[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

interface UseReadersParams {
  query?: string;
  page?: number;
  limit?: number;
}

export function useReaders(params: UseReadersParams = {}): UseReadersResult {
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);

  const fetchReaders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await readerService.getReaders({
        query: params.query,
        page: params.page || 1,
        limit: params.limit || 50 // Get more readers for better filtering experience
      });
      
      setReaders(response.readers);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch readers');
      console.error('Error fetching readers:', err);
    } finally {
      setLoading(false);
    }
  }, [params.query, params.page, params.limit]);

  useEffect(() => {
    fetchReaders();
  }, [fetchReaders]);

  return {
    readers,
    loading,
    error,
    refetch: fetchReaders,
    pagination
  };
}