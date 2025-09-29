import { ReaderCard } from "./reader-card"
import type { Reader } from "@/types/index"

interface ReaderListProps {
  readers: Reader[];
  onRequestReading?: (readerId: string) => Promise<void>;
  onSelectReader?: (readerId: string) => void;
}

export function ReaderList({
  readers,
  onRequestReading,
  onSelectReader,
}: ReaderListProps) {
  if (!readers.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No readers found</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {readers.map((reader) => (
        <ReaderCard
          key={reader.id}
          reader={reader}
          onRequestReading={
            onRequestReading ? () => onRequestReading(reader.id) : undefined
          }
          onSelectReader={onSelectReader ? () => onSelectReader(reader.id) : undefined}
        />
      ))}
    </div>
  )
}
