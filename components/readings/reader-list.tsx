import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Reader } from "@/types"

interface ReaderListProps {
  readers: Reader[]
  selectedReaderId: string | null
  onSelect: (readerId: string) => void
}

export function ReaderList({ readers, selectedReaderId, onSelect }: ReaderListProps) {
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {readers.map((reader) => (
          <Card
            key={reader.id}
            className={`cursor-pointer transition-colors ${
              selectedReaderId === reader.id ? "border-primary" : ""
            }`}
            onClick={() => onSelect(reader.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {reader.username
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                  <AvatarImage src={reader.profileImage} />
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{reader.username}</h4>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">★</span>
                      <span className="text-sm">{reader.stats.averageRating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">
                        ({reader.reviews.length})
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {reader.tagline}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {reader.attributes.tools.map((tool) => (
                      <span
                        key={tool}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                      >
                        {tool}
                      </span>
                    ))}
                    {reader.attributes.abilities.map((ability) => (
                      <span
                        key={ability}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}
