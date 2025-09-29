import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"

interface ReadingDetailsProps {
  reading: {
    id: string
    topic: string
    description: string
    status: "pending" | "accepted" | "declined" | "completed"
    duration: number
    credits: number
    createdAt: Date
    notes?: string
    reader: {
      id: string
      name: string
      avatarUrl?: string
      bio?: string
    }
    client: {
      id: string
      name: string
      avatarUrl?: string
    }
  }
  userRole: "reader" | "client"
  isOpen: boolean
  onClose: () => void
  onAccept?: () => void
  onDecline?: () => void
  onComplete?: () => void
}

export function ReadingDetails({
  reading,
  userRole,
  isOpen,
  onClose,
  onAccept,
  onDecline,
  onComplete,
}: ReadingDetailsProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {reading.topic}
            </DialogTitle>
            <Badge className={getStatusColor(reading.status)}>
              {reading.status.charAt(0).toUpperCase() + reading.status.slice(1)}
            </Badge>
          </div>
          <DialogDescription>
            {formatDate(reading.createdAt)} • {reading.duration} minutes •{" "}
            {reading.credits} credits
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {reading.description}
            </p>
          </div>

          {reading.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Reader Notes</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {reading.notes}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {userRole === "client" ? "Reader" : "Client"}
              </h3>
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage 
                    src={
                      userRole === "client"
                        ? reading.reader.avatarUrl
                        : reading.client.avatarUrl
                    }
                    alt={
                      userRole === "client"
                        ? reading.reader.name
                        : reading.client.name
                    }
                  />
                  <AvatarFallback>
                    {(userRole === "client"
                      ? reading.reader.name
                      : reading.client.name
                    )[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {userRole === "client"
                      ? reading.reader.name
                      : reading.client.name}
                  </p>
                  {userRole === "client" && reading.reader.bio && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {reading.reader.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose}>
            Close
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
