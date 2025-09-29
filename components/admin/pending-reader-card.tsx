import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, StarIcon, ClockIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface PendingReaderCardProps {
  reader: {
    id: string
    name: string
    email: string
    avatarUrl?: string
    bio: string
    applicationDate: Date
    attributes: {
      tools: string[]
      abilities: string[]
      style: string
    }
    profileCompleteness: number
  }
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onViewDetails: (id: string) => void
}

export function PendingReaderCard({
  reader,
  onApprove,
  onReject,
  onViewDetails,
}: PendingReaderCardProps) {
  const initials = reader.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Card>
      <CardHeader className="flex-row items-center space-x-4 space-y-0">
        <Avatar className="h-16 w-16">
          <AvatarImage src={reader.avatarUrl} alt={reader.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{reader.name}</h3>
            <Badge variant={reader.profileCompleteness >= 80 ? "default" : "secondary"}>
              {reader.profileCompleteness}% Complete
            </Badge>
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center">
              <CalendarIcon className="mr-1 h-4 w-4" />
              Applied {formatDistanceToNow(reader.applicationDate)} ago
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {reader.bio}
        </p>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {reader.attributes.tools.map((tool) => (
              <Badge key={tool} variant="outline">
                {tool}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {reader.attributes.abilities.map((ability) => (
              <Badge key={ability} variant="outline">
                {ability}
              </Badge>
            ))}
          </div>
          <Badge variant="outline" className="mt-2">
            {reader.attributes.style}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="justify-end space-x-2">
        <Button variant="ghost" onClick={() => onViewDetails(reader.id)}>
          View Details
        </Button>
        <Button variant="destructive" onClick={() => onReject(reader.id)}>
          Reject
        </Button>
        <Button 
          variant="default" 
          onClick={() => onApprove(reader.id)}
          disabled={reader.profileCompleteness < 80}
        >
          Approve
        </Button>
      </CardFooter>
    </Card>
  )
}
