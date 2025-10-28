'use client';

import { ReadingList } from '@/components/readings/reading-list';
import { useReadings } from '@/hooks/use-readings';
import { useAuth } from '@/hooks/use-auth';
import { useCredits } from '@/hooks/use-credits';
import { useMemo, useState, useEffect, useRef } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function ClientReadingsPage() {
  const { user } = useAuth();
  const { credits, refreshBalance } = useCredits();
  const { 
    inProgressReadings, 
    instantQueueReadings,
    scheduledReadings,
    messageQueueReadings,
    suggestedReadings,
    archivedReadings,
    disputedReadings,
    refundedReadings,
    loading, 
    error,
    refetch
  } = useReadings();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const initialStatus = searchParams?.get('status') ?? 'all';
  const initialPage = parseInt(searchParams?.get('page') || '1', 10) || 1;

  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [page, setPage] = useState<number>(initialPage);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
    if (page && page > 1) params.set('page', String(page));
    const q = params.toString();
    const url = q ? `${pathname}?${q}` : pathname;
    router.replace(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  // Filter readings to only show those where current user is the client
  const filteredReadings = useMemo(() => {
    if (!user?.id) return {
      inProgress: [],
      instantQueue: [],
      scheduled: [],
      messageQueue: [],
      suggested: [],
      archived: [],
      disputed: [],
      refunded: []
    };

    return {
      inProgress: inProgressReadings.filter(r => r.clientId === user.id),
      instantQueue: instantQueueReadings.filter(r => r.clientId === user.id),
      scheduled: scheduledReadings.filter(r => r.clientId === user.id),
      messageQueue: messageQueueReadings.filter(r => r.clientId === user.id),
      suggested: suggestedReadings.filter(r => r.clientId === user.id),
      // archived should only include readings explicitly archived/completed
      archived: archivedReadings.filter(r => r.clientId === user.id && (r.status === 'archived' || r.status === 'completed')),
      // disputed and refunded are provided separately by the hook
      disputed: disputedReadings.filter(r => r.clientId === user.id),
      refunded: refundedReadings.filter(r => r.clientId === user.id),
    };
  }, [user, inProgressReadings, instantQueueReadings, scheduledReadings, messageQueueReadings, suggestedReadings, archivedReadings, disputedReadings, refundedReadings]);

  const [sortAsc, setSortAsc] = useState<boolean>(false);
  // Helper to sort arrays by updatedAt (newest first by default), fallback to createdAt
  const sortByUpdated = (arr: Array<any>, asc = sortAsc) => arr.slice().sort((a, b) => {
    const aDate = new Date((a as any).updatedAt ?? (a as any).createdAt).getTime();
    const bDate = new Date((b as any).updatedAt ?? (b as any).createdAt).getTime();
    return asc ? aDate - bDate : bDate - aDate;
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const usernameCache = useRef<Record<string, string>>({});

  // Note: don't early-return here because hooks below must be called
  // unconditionally. We'll show an error UI just before the final render.

  const getReadingsForFilter = () => {
    switch (statusFilter) {
      case 'inProgress':
        return sortByUpdated(filteredReadings.inProgress, sortAsc);
      case 'instant':
        return sortByUpdated(filteredReadings.instantQueue, sortAsc);
      case 'scheduled':
        return sortByUpdated(filteredReadings.scheduled, sortAsc);
      case 'messages':
        return sortByUpdated(filteredReadings.messageQueue, sortAsc);
      case 'disputed':
        return sortByUpdated(filteredReadings.disputed, sortAsc);
      case 'suggested':
        return sortByUpdated(filteredReadings.suggested, sortAsc);
      case 'archived':
        return sortByUpdated(filteredReadings.archived, sortAsc);
      case 'cancelled':
        return sortByUpdated(filteredReadings.refunded, sortAsc);
      default: {
        const combined = [
          ...filteredReadings.inProgress,
          ...filteredReadings.instantQueue,
          ...filteredReadings.scheduled,
          ...filteredReadings.messageQueue,
          ...filteredReadings.suggested,
          ...filteredReadings.archived,
          ...filteredReadings.disputed,
          ...filteredReadings.refunded,
        ];
        return sortByUpdated(combined, sortAsc);
      }
    }
  };

  // Debounce searchQuery -> debouncedQuery
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Run search when debouncedQuery changes
  useEffect(() => {
    let cancelled = false;
    const runSearch = async () => {
      if (!debouncedQuery) {
        setSearchResults(null);
        return;
      }
      const q = debouncedQuery.toLowerCase();
      const base = getReadingsForFilter();
      const results: any[] = [];
      for (const r of base) {
        // match topic or title
        if ((r.topic || '').toLowerCase().includes(q) || (r.title || '').toLowerCase().includes(q)) {
          results.push(r);
          continue;
        }
        // fetch reader username (client page searches reader username)
        const rid = r.readerId;
        let uname = usernameCache.current[rid];
        if (!uname) {
          try {
            const resp = await fetch(`/api/readers/${rid}`);
            if (resp.ok) {
              const data = await resp.json();
              uname = (data.username || data.firstName || '').toLowerCase();
              usernameCache.current[rid] = uname;
            }
          } catch (err) {
            // ignore
          }
        }
        if (uname && uname.includes(q)) {
          results.push(r);
        }
      }
      if (!cancelled) setSearchResults(results);
    };
    runSearch();
    return () => { cancelled = true; };
  }, [debouncedQuery, statusFilter, archivedReadings, disputedReadings, refundedReadings]);

  const counts = {
    inProgress: filteredReadings.inProgress.length,
    instant: filteredReadings.instantQueue.length,
    scheduled: filteredReadings.scheduled.length,
    messages: filteredReadings.messageQueue.length,
    suggested: filteredReadings.suggested.length,
    archived: filteredReadings.archived.length,
    disputed: filteredReadings.disputed.length,
    cancelled: filteredReadings.refunded.length,
    all: (() => [
      ...filteredReadings.inProgress,
      ...filteredReadings.instantQueue,
      ...filteredReadings.scheduled,
      ...filteredReadings.messageQueue,
      ...filteredReadings.suggested,
      ...filteredReadings.archived,
      ...filteredReadings.disputed,
      ...filteredReadings.refunded,
    ].length)()
  };

  // pagination
  const PAGE_SIZE = 10;
  // If searchResults present, use them (sorted); otherwise use the normal filter results
  const baseForSelection = getReadingsForFilter() ?? [];
  const selectedReadings = searchResults ? sortByUpdated(searchResults, sortAsc) : baseForSelection;
  const total = selectedReadings.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pagedReadings = selectedReadings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Error loading readings: {error.message}</p>
      </div>
    );
  }

  return (
    <main className="container py-6">
      <div className="mb-6">
        <h1 className="page-title">Readings</h1>
        <p className="page-description">Manage your reading sessions and requests</p>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search reader, topic, or title"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-[320px]"
            aria-label="Search readings"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSortAsc(s => !s)}
            title={sortAsc ? 'Sort by oldest first' : 'Sort by newest first'}
            aria-label="Toggle sort order"
          >
            {sortAsc ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {/* <label className="text-sm text-muted-foreground">Status</label> */}
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder={`All Status (${counts.all})`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status ({counts.all})</SelectItem>
              <SelectItem value="inProgress">In Progress ({counts.inProgress})</SelectItem>
              <SelectItem value="instant">Instant Queue ({counts.instant})</SelectItem>
              <SelectItem value="scheduled">Scheduled ({counts.scheduled})</SelectItem>
              <SelectItem value="messages">Message Queue ({counts.messages})</SelectItem>
              <SelectItem value="suggested">Suggested ({counts.suggested})</SelectItem>
              <SelectItem value="disputed">Disputed ({counts.disputed})</SelectItem>
              <SelectItem value="cancelled">Cancelled ({counts.cancelled})</SelectItem>
              <SelectItem value="archived">Completed ({counts.archived})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        <ReadingList
          readings={pagedReadings}
          loading={loading}
          currentCredits={credits}
          onReadingUpdated={refetch}
          onCreditsUpdated={refreshBalance}
          userRole="client"
        />

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, total)} of {total}</div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded border"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded border ${i + 1 === page ? 'bg-accent text-accent-foreground' : ''}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded border"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}