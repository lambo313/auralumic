'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ProfileHeader } from '@/components/profile/profile-header';
import { StatusManager } from '@/components/profile/status-manager';
import { Card } from '@/components/ui/card';
import { withSafeRendering } from '@/components/ui/with-safe-rendering';
import { Separator } from '@/components/ui/separator';
import { Status } from '@/types';

type UserMetadata = {
  bio?: string;
  location?: string;
  website?: string;
};

// Mock user statuses for development - this would come from an API in production
const mockUserStatuses: Status[] = [
  {
    id: "67053cb0f1a2b3c4d5e6f789",
    userId: "67053cb1a2b3c4d5e6f78901",
    content: "I've been feeling really lost in my career lately. I have a good job but something feels missing. I wake up every day feeling unmotivated and I'm starting to question if this is the right path for me. Any insights would be appreciated.",
    mood: "confused",
    category: "career",
    isActive: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    suggestedReadings: [
      {
        id: "67053cb2b3c4d5e6f7890123",
        statusId: "67053cb0f1a2b3c4d5e6f789",
        readerId: "67053cb3c4d5e6f789012345",
        readerName: "Luna Mystic",
        readerAvatarUrl: "/assets/readers/luna.jpg",
        title: "Career Path Clarity Reading",
        description: "A comprehensive tarot reading to explore your true calling and uncover what's blocking your career satisfaction.",
        suggestedType: "tarot",
        estimatedDuration: 45,
        suggestedPrice: 65,
        message: "I sense there&apos;s a deeper purpose trying to emerge in your life. Let&apos;s explore what the cards reveal about your authentic career path.",
        isAccepted: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]
  }
];

function ClientProfilePage() {
  const { user, role } = useAuth();
  const [userStatuses, setUserStatuses] = useState<Status[]>(mockUserStatuses);
  const [isPostingStatus, setIsPostingStatus] = useState(false);

  const handlePostStatus = async (statusData: {
    content: string;
    mood: string;
    category: string;
  }) => {
    setIsPostingStatus(true);
    try {
      // Close any existing active status
      const updatedStatuses = userStatuses.map(status => ({
        ...status,
        isActive: false,
        updatedAt: new Date()
      }));

      // Create new status
      const newStatus: Status = {
        id: `67053cb4${Date.now().toString(16)}`, // MongoDB-like ObjectId with timestamp
        userId: user?.id || "67053cb1a2b3c4d5e6f78901",
        content: statusData.content,
        mood: statusData.mood,
        category: statusData.category,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        suggestedReadings: []
      };

      setUserStatuses([newStatus, ...updatedStatuses]);
    } catch (error) {
      console.error("Error posting status:", error);
      alert("Failed to post status. Please try again.");
    } finally {
      setIsPostingStatus(false);
    }
  };

  const handleAcceptSuggestion = async (suggestionId: string) => {
    try {
      const statusWithSuggestion = userStatuses.find(status =>
        status.suggestedReadings.some(s => s.id === suggestionId)
      );

      if (!statusWithSuggestion) return;

      const updatedStatuses = userStatuses.map(status => {
        if (status.id === statusWithSuggestion.id) {
          return {
            ...status,
            isActive: false,
            acceptedSuggestedReadingId: suggestionId,
            updatedAt: new Date(),
            suggestedReadings: status.suggestedReadings.map(suggestion => ({
              ...suggestion,
              isAccepted: suggestion.id === suggestionId,
              updatedAt: new Date()
            }))
          };
        }
        return status;
      });

      setUserStatuses(updatedStatuses);
      alert("Reading suggestion accepted! The reader will be notified.");
    } catch (error) {
      console.error("Error accepting suggestion:", error);
      alert("Failed to accept suggestion. Please try again.");
    }
  };

  return (
    <main className="container py-6">
      <div className="mb-6">
        <h1 className="page-title">Your Client Profile</h1>
        <p className="page-description">
          Manage your profile information and preferences
        </p>
      </div>

      {user ? (
        <div className="space-y-8">
          <ProfileHeader user={{
            avatarUrl: user.imageUrl,
            profileImage: undefined,
            name: user.fullName || undefined,
            username: user.username ?? undefined,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            bio: (user.unsafeMetadata as UserMetadata)?.bio,
            location: (user.unsafeMetadata as UserMetadata)?.location,
            website: (user.unsafeMetadata as UserMetadata)?.website
          }} isOwnProfile={true} />

          <Separator />

          {/* Status Management Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">My Status Updates</h2>
              <p className="text-sm text-muted-foreground">
                Share what&apos;s on your mind and receive personalized reading suggestions from our readers.
              </p>
            </div>
            
            <StatusManager
              userStatuses={userStatuses}
              userName={user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || "You"}
              userAvatar={user.imageUrl}
              onPostStatus={handlePostStatus}
              onAcceptSuggestion={handleAcceptSuggestion}
              onSuggestReading={async () => {}} // Main profile page doesn't need suggest reading
              isPostingStatus={isPostingStatus}
              canPost={true}
              isOwnProfile={true}
              userRole={role || "client"}
              clientData={undefined} // Own profile doesn't need client data for modal
            />
          </div>

        </div>
      ) : (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            Please sign in to view your profile
          </p>
        </Card>
      )}
    </main>
  );
}

export default withSafeRendering(ClientProfilePage);