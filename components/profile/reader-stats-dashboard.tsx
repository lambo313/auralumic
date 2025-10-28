import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

import { Reader } from "@/types";
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ReaderStatsDashboardProps {
  user: Reader;
}

export function ReaderStatsDashboard({ user }: ReaderStatsDashboardProps) {
  // Placeholder: Replace with actual stats logic
  const stats = {
  totalReadings: user?.stats?.totalReadings ?? 0,
  completedReadings: (user as any)?.stats?.archivedCount ?? 0,
    averageRating: user?.stats?.averageRating ?? 0,
    totalEarnings: user?.stats?.totalEarnings ?? 0,
    completionRate: user?.stats?.completionRate ?? 0,
  repeatClientCount: (user as any)?.stats?.repeatClientCount ?? 0,
  repeatClientRate: (user as any)?.stats?.repeatClientRate ?? 0,
    profileViews: 0, // Not available in current stats
    bookingRequests: 0, // Not available in current stats
    totalBookings: user?.stats?.totalReadings ?? 0, // Use totalReadings as proxy
    pendingReadings: (user as any)?.pendingReadings ?? [],
    badges: user?.badges ?? [],
  };

  const router = useRouter()
  const statusMap: Record<string, string> = {
    instant_queue: 'instant',
    scheduled: 'scheduled',
    message_queue: 'message',
  }

  const navigateReadingList = (reading: any) => {
    const s = statusMap[reading.status] ?? 'all'
    router.push(`/reader/readings?status=${s}`)
  }

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-y-2 gap-x-4">
        <div>
          <h2 className="text-lg font-semibold">Reader Performance Overview</h2>
          <p className="text-sm text-muted-foreground">Your activity, earnings and client metrics at a glance.</p>
        </div>
        <div className="items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/reader/readings')}>All Readings</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4  dark:bg-slate-900/50 rounded-lg shadow-aura border">
          <div className="text-sm text-muted-foreground">Total Readings</div>
          <div className="mt-2 text-2xl font-bold">{stats.totalReadings}</div>
        </div>
        <div className="p-4  dark:bg-slate-900/50 rounded-lg shadow-aura border">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="mt-2 text-2xl font-bold">{stats.completedReadings}</div>
        </div>
        <div className="p-4  dark:bg-slate-900/50 rounded-lg shadow-aura border">
          <div className="text-sm text-muted-foreground">Average Rating</div>
          <div className="mt-2 text-2xl font-bold">{stats.averageRating}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4  dark:bg-slate-900/50 rounded-lg shadow-aura border">
          <div className="text-sm text-muted-foreground">Total Earnings</div>
          <div className="mt-2 text-2xl font-bold">{stats.totalEarnings}</div>
        </div>
        <div className="p-4  dark:bg-slate-900/50 rounded-lg shadow-aura border">
          <div className="text-sm text-muted-foreground">Completion Rate</div>
          <div className="mt-2 text-2xl font-bold">{stats.completionRate}%</div>
        </div>
        <div className="p-4  dark:bg-slate-900/50 rounded-lg shadow-aura border">
          <div className="text-sm text-muted-foreground">Repeat Clients</div>
          <div className="mt-2 text-2xl font-bold">{stats.repeatClientCount}</div>
        </div>
      </div>

      <Separator className="my-6" />
      <div className="mb-4">
        <h3 className="font-semibold mb-3">Badges</h3>
        {stats.badges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {stats.badges.map((badge: string, index: number) => (
              <div key={index} className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">{badge}</div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No badges earned yet.</p>
        )}
      </div>

      <Separator className="my-6" />
      <div>
        <h3 className="font-semibold mb-3">Pending Readings</h3>
        {stats.pendingReadings.length > 0 ? (
          <div className="space-y-3">
            {stats.pendingReadings.map((reading: any, index: number) => (
              <div key={reading.id} className="flex items-center justify-between p-3  dark:bg-slate-900/50 rounded-lg border shadow-aura">
                <div>
                  <div className="font-medium">{reading.readingOption?.type ? reading.readingOption.type : `Reading #${index + 1}`}</div>
                  <div className="text-sm text-muted-foreground">Client: {reading.clientUsername ?? reading.clientId}</div>
                  <div className="text-sm text-muted-foreground">Status: {reading.status}{reading.scheduledDate ? ` · Scheduled: ${new Date(reading.scheduledDate).toLocaleString()}` : ''}</div>
                </div>
                <Button size="sm" className="ml-2" onClick={() => navigateReadingList(reading)}>
                  View
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No pending readings.</p>
        )}
      </div>
    </Card>
  );
}
