'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReadingList } from '@/components/readings/reading-list';
import { useReadings } from '@/hooks/use-readings';
import { useAuth } from '@/hooks/use-auth';
import { useMemo } from 'react';

export default function ReaderReadingsPage() {
  const { user } = useAuth();
  const { 
    acceptedReadings, 
    instantQueueReadings,
    scheduledReadings,
    messageQueueReadings,
    suggestedReadings, 
    archivedReadings, 
    loading, 
    error 
  } = useReadings();

  // Filter readings to only show those where current user is the reader
  const filteredReadings = useMemo(() => {
    if (!user?.id) return {
      accepted: [],
      instantQueue: [],
      scheduled: [],
      messageQueue: [],
      suggested: [],
      archived: []
    };

    return {
      accepted: acceptedReadings.filter(r => r.readerId === user.id),
      instantQueue: instantQueueReadings.filter(r => r.readerId === user.id),
      scheduled: scheduledReadings.filter(r => r.readerId === user.id),
      messageQueue: messageQueueReadings.filter(r => r.readerId === user.id),
      suggested: suggestedReadings.filter(r => r.readerId === user.id),
      archived: archivedReadings.filter(r => r.readerId === user.id)
    };
  }, [user, acceptedReadings, instantQueueReadings, scheduledReadings, messageQueueReadings, suggestedReadings, archivedReadings]);

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
        <h1 className="page-title">Your Readings</h1>
        <p className="page-description">
          Manage your reading sessions and client requests
        </p>
      </div>

      <Tabs defaultValue="instant">
        <TabsList className="w-full justify-start flex-wrap">
          <TabsTrigger value="instant">Instant Queue</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="messages">Message Queue</TabsTrigger>
          <TabsTrigger value="suggested">Outgoing Suggestions</TabsTrigger>
          <TabsTrigger value="accepted">Active Readings</TabsTrigger>
          <TabsTrigger value="archived">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="instant" className="mt-6">
          <ReadingList readings={filteredReadings.instantQueue} loading={loading} />
        </TabsContent>
        <TabsContent value="scheduled" className="mt-6">
          <ReadingList readings={filteredReadings.scheduled} loading={loading} />
        </TabsContent>
        <TabsContent value="messages" className="mt-6">
          <ReadingList readings={filteredReadings.messageQueue} loading={loading} />
        </TabsContent>
        <TabsContent value="suggested" className="mt-6">
          <ReadingList readings={filteredReadings.suggested} loading={loading} />
        </TabsContent>
        <TabsContent value="accepted" className="mt-6">
          <ReadingList readings={filteredReadings.accepted} loading={loading} />
        </TabsContent>
        <TabsContent value="archived" className="mt-6">
          <ReadingList readings={filteredReadings.archived} loading={loading} />
        </TabsContent>
      </Tabs>
    </main>
  );
}