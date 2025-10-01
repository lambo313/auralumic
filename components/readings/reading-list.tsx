import { ReadingCard } from "./reading-card"
import type { Reading } from "@/types/readings"

interface ReadingListProps {
  readings: Reading[];
  loading?: boolean;
}

export function ReadingList({ readings, loading }: ReadingListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <ReadingCard
            key={i}
            reading={{
              id: `loading-${i}`,
              topic: 'Loading...',
              description: '',
              status: 'pending',
              duration: 0,
              credits: 0,
              createdAt: new Date(),
              reader: { id: '', name: '', avatarUrl: '' },
              client: { id: '', name: '', avatarUrl: '' },
            }}
            userRole="client"
            onViewDetails={() => {}}
            loading
          />
        ))}
      </div>
    );
  }

  if (!readings || readings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No readings found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {readings.map((reading) => {
        // Map ReadingStatus to the expected status values for ReadingCard
        const mapStatus = (status: string) => {
          switch (status) {
            case 'requested': return 'pending' as const;
            case 'in_progress': return 'accepted' as const;
            default: return status as 'pending' | 'accepted' | 'declined' | 'completed';
          }
        };

        return (
          <ReadingCard
            key={reading.id}
            reading={{
              id: reading.id,
              topic: reading.topic,
              description: reading.question || '',
              status: mapStatus(reading.status),
              duration: reading.readingOption.timeSpan.duration,
              credits: reading.credits,
              createdAt: reading.createdAt,
              client: { id: reading.clientId, name: 'Client' },
              reader: { id: reading.readerId, name: 'Reader' }
            }}
            userRole="client"
            onViewDetails={() => {
              const pathname = window.location.pathname;
              if (pathname.includes('/client/')) {
                window.location.href = `/client/reading/${reading.id}`;
              } else if (pathname.includes('/reader/')) {
                window.location.href = `/reader/reading/${reading.id}`;
              } else {
                window.location.href = `/dashboard/reading/${reading.id}`; // fallback
              }
            }}
          />
        );
      })}
    </div>
  );
}
