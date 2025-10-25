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
import { useState, useEffect } from "react"
import { ReadingDetailsModal } from "./reading-details-modal"
import type { Reading } from "@/types/readings"

interface ReadingCardProps {
  reading: {
    id: string
    topic: string
    description: string
    status: "pending" | "inProgress" | "cancelled" | "completed"
    duration: number
    credits: number
    createdAt: Date
    readerId: string
    clientId: string
    title?: string // Added optional title property
  }
  userRole: "reader" | "client"
  fullReading?: Reading // Full reading object for modal
  currentCredits?: number // Current user credits for edit calculations
  onAccept?: () => void
  onDecline?: () => void
  onComplete?: () => void
  onViewDetails?: () => void // Made optional since we'll use modal
  onReadingUpdated?: () => void
  onCreditsUpdated?: (newBalance: number) => void
  loading?: boolean
}

export function ReadingCard({
  reading,
  userRole,
  fullReading,
  currentCredits = 0,
  onAccept,
  onDecline,
  onComplete,
  onViewDetails,
  onReadingUpdated,
  onCreditsUpdated,
  loading,
}: ReadingCardProps) {
  const [readerData, setReaderData] = useState<{ username: string; profileImage?: string } | null>(null)
  const [clientData, setClientData] = useState<{ username: string; profileImage?: string } | null>(null)
  const [fetchingUsers, setFetchingUsers] = useState(true)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    async function fetchUserData() {
      if (loading) return
      
      try {
        setFetchingUsers(true)
        
        // Fetch reader data using readerId (Clerk user ID)
        const readerResponse = await fetch(`/api/readers/${reading.readerId}`)
        if (readerResponse.ok) {
          const readerInfo = await readerResponse.json()
          setReaderData({
            username: readerInfo.username,
            profileImage: readerInfo.profileImage
          })
        }

        // Fetch client data using clientId (Clerk user ID)
        const clientResponse = await fetch(`/api/users/${reading.clientId}`)
        if (clientResponse.ok) {
          const clientInfo = await clientResponse.json()
          setClientData({
            username: clientInfo.username || clientInfo.firstName || 'Client',
            profileImage: clientInfo.profileImage || clientInfo.imageUrl
          })
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        // Set fallback data
        setReaderData({ username: 'Reader', profileImage: undefined })
        setClientData({ username: 'Client', profileImage: undefined })
      } finally {
        setFetchingUsers(false)
      }
    }

    fetchUserData()
  }, [reading.readerId, reading.clientId, loading])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-grey-500"
      case "inProgress":
        return "bg-blue-500"
      case "archived":
        return "bg-green-500"
      case "refunded":
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
          <CardTitle className="text-xl font-bold">
            {reading.topic}
            {reading.title ? ` • ${reading.title}` : ''}
          </CardTitle>
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
                  <AvatarImage src={readerData?.profileImage} alt={readerData?.username} />
                  <AvatarFallback>
                    {fetchingUsers ? '...' : (readerData?.username?.[0]?.toUpperCase() || 'R')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Reader</p>
                  <p className="text-xs text-muted-foreground">
                    {fetchingUsers ? 'Loading...' : (readerData?.username || 'Unknown Reader')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={clientData?.profileImage} alt={clientData?.username} />
                  <AvatarFallback>
                    {fetchingUsers ? '...' : (clientData?.username?.[0]?.toUpperCase() || 'C')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Client</p>
                  <p className="text-xs text-muted-foreground">
                    {fetchingUsers ? 'Loading...' : (clientData?.username || 'Unknown Client')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button 
          variant="ghost" 
          onClick={() => {
            if (onViewDetails) {
              onViewDetails();
            } else if (fullReading) {
              setShowDetailsModal(true);
            }
          }}
        >
          View Details
        </Button>
      </CardFooter>

      {/* Reading Details Modal */}
      {fullReading && showDetailsModal && (
        <ReadingDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          reading={fullReading}
          userRole={userRole}
          currentCredits={currentCredits}
          onCreditsUpdated={onCreditsUpdated}
          onReadingUpdated={() => {
            setShowDetailsModal(false);
            onReadingUpdated?.();
          }}
        />
      )}
    </Card>
  )
}
