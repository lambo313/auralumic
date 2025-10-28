import { ReadingCard } from "./reading-card"
import type { Reading } from "@/types/readings"

interface ReadingListProps {
  readings: Reading[];
  loading?: boolean;
  currentCredits?: number;
  onReadingUpdated?: () => void;
  onCreditsUpdated?: (newBalance: number) => void;
  userRole: "reader" | "client";
}

export function ReadingList({ readings, loading, currentCredits, onReadingUpdated, onCreditsUpdated, userRole }: ReadingListProps) {
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
              readerId: '',
              clientId: ''
            }}
            userRole={userRole}
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
      {readings.map((reading, index) => {
        // Map ReadingStatus to the expected status values for ReadingCard
        const mapStatus = (status: string) => {
          switch (status) {
            case 'disputed': return 'disputed' as const; // show disputed readings in the completed list UI
            case 'instant_queue': return 'pending' as const;
            case 'scheduled': return 'pending' as const; 
            case 'message_queue': return 'pending' as const;
            case 'in_progress': return 'inProgress' as const;
            default: return status as 'pending' | 'inProgress' | 'cancelled' | 'completed';
          }
        };

        // Ensure we have a valid ID - prefer id over _id
        const readingId = reading.id || (reading as unknown as { _id?: string })._id?.toString() || `reading-${index}`;
        
        // Pass the full reading with consistent ID
        const fullReadingWithId = {
          ...reading,
          id: readingId
        };

        return (
          <ReadingCard
            key={readingId}
            reading={{
              id: readingId,
              topic: reading.topic,
              description: reading.question || '',
              status: mapStatus(reading.status),
              duration: reading.readingOption.timeSpan.duration,
              credits: reading.credits,
              createdAt: new Date(reading.createdAt),
              readerId: reading.readerId,
              clientId: reading.clientId,
              title: reading.title // Include title field
            }}
            fullReading={fullReadingWithId}
            currentCredits={currentCredits}
            userRole={userRole}
            onReadingUpdated={onReadingUpdated}
            onCreditsUpdated={onCreditsUpdated}
          />
        );
      })}
    </div>
  );
}
