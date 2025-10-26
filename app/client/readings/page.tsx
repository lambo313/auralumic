'use client';

import { ReadingList } from '@/components/readings/reading-list';
import { useReadings } from '@/hooks/use-readings';
import { useAuth } from '@/hooks/use-auth';
import { useCredits } from '@/hooks/use-credits';
import { useMemo, useState, useEffect } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
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
      refunded: []
    };

    return {
      inProgress: inProgressReadings.filter(r => r.clientId === user.id),
      instantQueue: instantQueueReadings.filter(r => r.clientId === user.id),
      scheduled: scheduledReadings.filter(r => r.clientId === user.id),
      messageQueue: messageQueueReadings.filter(r => r.clientId === user.id),
      suggested: suggestedReadings.filter(r => r.clientId === user.id),
  archived: archivedReadings.filter(r => r.clientId === user.id && r.status !== 'refunded'),
  refunded: archivedReadings.concat([]).filter(r => r.clientId === user.id && r.status === 'refunded')
    };
  }, [user, inProgressReadings, instantQueueReadings, scheduledReadings, messageQueueReadings, suggestedReadings, archivedReadings]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Error loading readings: {error.message}</p>
      </div>
    );
  }

  const getReadingsForFilter = () => {
    switch (statusFilter) {
      case 'inProgress':
        return filteredReadings.inProgress;
      case 'instant':
        return filteredReadings.instantQueue;
      case 'scheduled':
        return filteredReadings.scheduled;
      case 'messages':
        return filteredReadings.messageQueue;
      case 'suggested':
        return filteredReadings.suggested;
      case 'archived':
        return filteredReadings.archived;
      case 'cancelled':
        return filteredReadings.refunded;
      default:
        return [
          ...filteredReadings.inProgress,
          ...filteredReadings.instantQueue,
          ...filteredReadings.scheduled,
          ...filteredReadings.messageQueue,
          ...filteredReadings.suggested,
          ...filteredReadings.archived,
          ...filteredReadings.refunded,
        ];
    }
  };

  const counts = {
    inProgress: filteredReadings.inProgress.length,
    instant: filteredReadings.instantQueue.length,
    scheduled: filteredReadings.scheduled.length,
    messages: filteredReadings.messageQueue.length,
    suggested: filteredReadings.suggested.length,
    archived: filteredReadings.archived.length,
    cancelled: filteredReadings.refunded.length,
    all: (() => [
      ...filteredReadings.inProgress,
      ...filteredReadings.instantQueue,
      ...filteredReadings.scheduled,
      ...filteredReadings.messageQueue,
      ...filteredReadings.suggested,
      ...filteredReadings.archived,
      ...filteredReadings.refunded,
    ].length)()
  };

  // pagination
  const PAGE_SIZE = 10;
  const selectedReadings = getReadingsForFilter();
  const total = selectedReadings.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pagedReadings = selectedReadings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main className="container py-6">
      <div className="mb-6">
        <h1 className="page-title">Readings</h1>
        <p className="page-description">Manage your reading sessions and requests</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div />
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Status</label>
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