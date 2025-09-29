import { ReadingCard } from "./reading-card"

import type { Reading } from '@/types/readings';

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
      {readings.map((reading) => (
        <ReadingCard
          key={reading.id}
          reading={{
            ...reading,
            description: reading.notes || '',
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
      ))}
    </div>
  );
}
