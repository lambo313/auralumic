'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReadingList } from '@/components/readings/reading-list';
import { useReadings } from '@/hooks/use-readings';
import { useAuth } from '@/hooks/use-auth';
import { useCredits } from '@/hooks/use-credits';
import { useMemo } from 'react';

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

  return (
    <main className="container py-6">
      <div className="mb-6">
        <h1 className="page-title">Your Readings</h1>
        <p className="page-description">
          Manage your reading sessions and requests
        </p>
      </div>

      <Tabs defaultValue="accepted">
        <TabsList className="w-full justify-start flex-wrap">
          <TabsTrigger value="accepted">In Progress</TabsTrigger>
          <TabsTrigger value="instant">Instant Queue</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="messages">Message Queue</TabsTrigger>
          <TabsTrigger value="suggested">Suggested</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        <TabsContent value="accepted" className="mt-6">
          <ReadingList 
            readings={filteredReadings.inProgress} 
            loading={loading}
            currentCredits={credits}
            onReadingUpdated={refetch}
            onCreditsUpdated={refreshBalance}
            userRole="client"
          />
        </TabsContent>
        <TabsContent value="instant" className="mt-6">
          <ReadingList 
            readings={filteredReadings.instantQueue} 
            loading={loading}
            currentCredits={credits}
            onReadingUpdated={refetch}
            onCreditsUpdated={refreshBalance}
            userRole="client"
          />
        </TabsContent>
        <TabsContent value="scheduled" className="mt-6">
          <ReadingList 
            readings={filteredReadings.scheduled} 
            loading={loading}
            currentCredits={credits}
            onReadingUpdated={refetch}
            onCreditsUpdated={refreshBalance}
            userRole="client"
          />
        </TabsContent>
        <TabsContent value="messages" className="mt-6">
          <ReadingList 
            readings={filteredReadings.messageQueue} 
            loading={loading}
            currentCredits={credits}
            onReadingUpdated={refetch}
            onCreditsUpdated={refreshBalance}
            userRole="client"
          />
        </TabsContent>
        <TabsContent value="suggested" className="mt-6">
          <ReadingList 
            readings={filteredReadings.suggested} 
            loading={loading}
            currentCredits={credits}
            onReadingUpdated={refetch}
            onCreditsUpdated={refreshBalance}
            userRole="client"
          />
        </TabsContent>
        <TabsContent value="archived" className="mt-6">
          <ReadingList 
            readings={filteredReadings.archived} 
            loading={loading}
            currentCredits={credits}
            onReadingUpdated={refetch}
            onCreditsUpdated={refreshBalance}
            userRole="client"
          />
        </TabsContent>
        <TabsContent value="cancelled" className="mt-6">
          <ReadingList 
            readings={filteredReadings.refunded} 
            loading={loading}
            currentCredits={credits}
            onReadingUpdated={refetch}
            onCreditsUpdated={refreshBalance}
            userRole="client"
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}