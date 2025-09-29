"use client";

import { useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  initialPage?: number;
}

export function useInfiniteScroll<T>(
  fetchData: (page: number) => Promise<T[]>,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 100, initialPage = 1 } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newItems = await fetchData(page);
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setData(prev => [...prev, ...newItems]);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentObserver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { 
        root: null,
        rootMargin: `${threshold}px`,
      }
    );
    
    observer.current = currentObserver;
    
    return () => currentObserver.disconnect();
  }, [hasMore, threshold]);

  useEffect(() => {
    const currentElement = lastElementRef.current;
    const currentObserver = observer.current;

    if (currentElement && currentObserver) {
      currentObserver.observe(currentElement);
    }

    return () => {
      if (currentElement && currentObserver) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [lastElementRef.current]);

  const reset = () => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
  };

  return {
    data,
    loading,
    error,
    hasMore,
    lastElementRef,
    reset,
  };
}
