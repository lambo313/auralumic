import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"

interface ReadingCardProps {
  reading: {
    id: string
    topic: string
    description: string
    status: "pending" | "accepted" | "declined" | "completed"
    duration: number
    credits: number
    createdAt: Date
    reader: {
      id: string
      name: string
      avatarUrl?: string
    }
    client: {
      id: string
      name: string
      avatarUrl?: string
    }
  }
  userRole: "reader" | "client"
  onAccept?: () => void
  onDecline?: () => void
  onComplete?: () => void
  onViewDetails: () => void
  loading?: boolean
}

export function ReadingCard({
  reading,
  userRole,
  onAccept,
  onDecline,
  onComplete,
  onViewDetails,
  loading,
}: ReadingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "accepted":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "declined":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-2">
            <div className="h-6 w-24 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
          </div>
          <div className="h-6 w-20 animate-pulse rounded bg-muted"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted"></div>
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 animate-pulse rounded-full bg-muted"></div>
              <div className="space-y-2">
                <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                <div className="h-3 w-20 animate-pulse rounded bg-muted"></div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <div className="h-9 w-24 animate-pulse rounded bg-muted"></div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-xl font-bold">{reading.topic}</CardTitle>
          <CardDescription>
            {formatDate(reading.createdAt)} • {reading.duration} minutes •{" "}
            {reading.credits} credits
          </CardDescription>
        </div>
        <Badge className={getStatusColor(reading.status)}>
          {reading.status.charAt(0).toUpperCase() + reading.status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {reading.description}
          </p>

          <div className="flex items-center space-x-4">
            {userRole === "client" ? (
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={reading.reader.avatarUrl} alt={reading.reader.name} />
                  <AvatarFallback>{reading.reader.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Reader</p>
                  <p className="text-xs text-muted-foreground">
                    {reading.reader.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={reading.client.avatarUrl} alt={reading.client.name} />
                  <AvatarFallback>{reading.client.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Client</p>
                  <p className="text-xs text-muted-foreground">
                    {reading.client.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onViewDetails}>
          View Details
        </Button>
        {userRole === "reader" && reading.status === "pending" && (
          <>
            <Button variant="outline" onClick={onDecline}>
              Decline
            </Button>
            <Button onClick={onAccept}>Accept</Button>
          </>
        )}
        {userRole === "reader" && reading.status === "accepted" && (
          <Button onClick={onComplete}>Mark as Complete</Button>
        )}
      </CardFooter>
    </Card>
  )
}
