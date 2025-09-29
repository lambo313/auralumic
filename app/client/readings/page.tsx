'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReadingList } from '@/components/readings/reading-list';
import { useReadings } from '@/hooks/use-readings';

export default function ClientReadingsPage() {
  const { 
    acceptedReadings, 
    requestedReadings, 
    archivedReadings, 
    loading, 
    error 
  } = useReadings();

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
        <h1 className="text-2xl font-bold">Your Readings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your reading sessions and requests
        </p>
      </div>

      <Tabs defaultValue="accepted">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="requested">Requested</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        <TabsContent value="accepted" className="mt-6">
          <ReadingList readings={acceptedReadings} loading={loading} />
        </TabsContent>
        <TabsContent value="requested" className="mt-6">
          <ReadingList readings={requestedReadings} loading={loading} />
        </TabsContent>
        <TabsContent value="archived" className="mt-6">
          <ReadingList readings={archivedReadings} loading={loading} />
        </TabsContent>
      </Tabs>
    </main>
  );
}