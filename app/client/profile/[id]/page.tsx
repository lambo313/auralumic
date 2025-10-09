"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { ProfileHeader } from "@/components/profile/profile-header";
import { StatusManager } from "@/components/profile/status-manager";
import { Card } from "@/components/ui/card";
import { withSafeRendering } from "@/components/ui/with-safe-rendering";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import type { User, Status } from "@/types/index";
import { getMockClientById } from "@/components/clients/mock-client-data";
import { userService } from "@/services/api";

type UserMetadata = {
  bio?: string;
  location?: string;
  website?: string;
};

// Fetch client profile by id
function useClientProfile(id: string | null) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        if (!id || (user && id === user.id)) {
          // Own profile
          const data = await userService.getCurrentUser();
          setProfile(data);
        } else {
          // Other client profile - use mock data for now
          const mockClient = getMockClientById(id);
          if (mockClient) {
            // Convert ClientStatusSummary to User format
            const clientUser: User = {
              id: mockClient.id,
              clerkId: mockClient.id,
              email: `${mockClient.name.toLowerCase().replace(' ', '.')}@email.com`,
              username: mockClient.name.toLowerCase().replace(' ', '_'),
              role: "client",
              credits: 0,
              preferences: {
                theme: 'auto',
                notifications: {
                  email: true,
                  push: true,
                  inApp: true
                }
              },
              hasCompletedOnboarding: true,
              createdAt: mockClient.joinDate,
              updatedAt: mockClient.lastActive,
              lastLogin: mockClient.lastActive,
              bio: `Spiritual seeker interested in ${mockClient.preferredCategories?.join(', ') || 'guidance'}`,
              location: "United States"
            };
            setProfile(clientUser);
          } else {
            setError("Client profile not found");
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch profile");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [id, user]);

  return { profile, loading, error };
}


function ClientProfileViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : null;
  const { user, role } = useAuth();
  const { profile, loading, error } = useClientProfile(id);
  const isOwnProfile = !id || (user && id === user.id);

  // Mock client statuses for development - in production this would come from API
  const [clientStatuses, setClientStatuses] = useState<Status[]>([]);
  const [isPostingStatus, setIsPostingStatus] = useState(false);

  // Get client's statuses from mock data if viewing another client
  useEffect(() => {
    if (profile && !isOwnProfile) {
      const mockClient = getMockClientById(profile.id);
      if (mockClient?.currentStatus) {
        setClientStatuses([mockClient.currentStatus]);
      }
    }
  }, [profile, isOwnProfile]);

  // Get client data for modal
  const getClientData = () => {
    if (profile && !isOwnProfile) {
      return getMockClientById(profile.id);
    }
    return undefined;
  };

  // Get avatar URL for client (from mock data if available)
  const getClientAvatar = (profile: User) => {
    if (isOwnProfile) {
      return (profile as User & { imageUrl?: string }).imageUrl;
    } else {
      const mockClient = getMockClientById(profile.id);
      return mockClient?.avatarUrl || (profile as User & { imageUrl?: string }).imageUrl || "/assets/clients/default.jpg";
    }
  };

  const handlePostStatus = async (statusData: {
    content: string;
    mood: string;
    category: string;
  }) => {
    if (!isOwnProfile) return; // Only allow posting on own profile
    
    setIsPostingStatus(true);
    try {
      // Close any existing active status
      const updatedStatuses = clientStatuses.map(status => ({
        ...status,
        isActive: false,
        updatedAt: new Date()
      }));

      // Create new status
      const newStatus: Status = {
        id: `67053cb4${Date.now().toString(16)}`, // MongoDB-like ObjectId with timestamp
        userId: user?.id || profile?.id || "",
        content: statusData.content,
        mood: statusData.mood,
        category: statusData.category,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        suggestedReadings: []
      };

      setClientStatuses([newStatus, ...updatedStatuses]);
    } catch (error) {
      console.error("Error posting status:", error);
      alert("Failed to post status. Please try again.");
    } finally {
      setIsPostingStatus(false);
    }
  };

  const handleAcceptSuggestion = async (suggestionId: string) => {
    if (!isOwnProfile) return; // Only allow accepting on own profile
    
    try {
      const statusWithSuggestion = clientStatuses.find(status =>
        status.suggestedReadings.some(s => s.id === suggestionId)
      );

      if (!statusWithSuggestion) return;

      const updatedStatuses = clientStatuses.map(status => {
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

      setClientStatuses(updatedStatuses);
      alert("Reading suggestion accepted! The reader will be notified.");
    } catch (error) {
      console.error("Error accepting suggestion:", error);
      alert("Failed to accept suggestion. Please try again.");
    }
  };

  const handleSuggestReading = async (statusId: string) => {
    // The modal is now handled directly in the StatusCard component
    // No additional action needed here
    console.log("Suggest reading for status:", statusId);
  };

  return (
    <main className="container py-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-6 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="mb-6">
        <h1 className="page-title">Client Profile</h1>
        <p className="page-description">
          {isOwnProfile
            ? "Manage your client profile and preferences"
            : `Viewing Client: ${profile?.username || 'Unknown'}`}
        </p>
      </div>

      {loading ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Loading profile...</p>
        </Card>
      ) : error ? (
        <Card className="p-6">
          <div className="text-center space-y-4">
            <p className="text-red-500">{error}</p>
            <Button variant="outline" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </Card>
      ) : profile ? (
        <div className="space-y-8">
          <ProfileHeader user={{
            avatarUrl: getClientAvatar(profile),
            profileImage: undefined,
            name: profile.username,
            username: profile.username,
            firstName: undefined,
            lastName: undefined,
            bio: profile.bio,
            location: profile.location,
            website: profile.website
          }} isOwnProfile={Boolean(isOwnProfile)} />

          <Separator />

          {/* Status Management Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {isOwnProfile ? "My Status Updates" : "Recent Activity"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isOwnProfile 
                  ? "Share what's on your mind and receive personalized reading suggestions from our readers."
                  : "View recent status updates and activity."
                }
              </p>
            </div>
            
            {isOwnProfile ? (
              <StatusManager
                userStatuses={clientStatuses}
                userName={profile.username || "You"}
                userAvatar={getClientAvatar(profile)}
                onPostStatus={handlePostStatus}
                onAcceptSuggestion={handleAcceptSuggestion}
                onSuggestReading={handleSuggestReading}
                isPostingStatus={isPostingStatus}
                canPost={true}
                isOwnProfile={true}
                userRole={role || "client"}
                clientData={getClientData()}
              />
            ) : (
              clientStatuses.length > 0 ? (
                <StatusManager
                  userStatuses={clientStatuses}
                  userName={profile.username || "Client"}
                  userAvatar={getClientAvatar(profile)}
                  onPostStatus={async () => {}} // No posting for other profiles
                  onAcceptSuggestion={async () => {}} // No accepting for other profiles
                  onSuggestReading={handleSuggestReading}
                  isPostingStatus={false}
                  canPost={false} // Disable posting for other profiles
                  isOwnProfile={false}
                  userRole={role || "client"}
                  clientData={getClientData()}
                />
              ) : (
                <Card className="p-6">
                  <p className="text-center text-muted-foreground">
                    This client hasn&apos;t posted any status updates yet.
                  </p>
                </Card>
              )
            )}
          </div>
        </div>
      ) : (
        <Card className="p-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Client profile not found</p>
            <Button variant="outline" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </Card>
      )}
    </main>
  );
}

export default withSafeRendering(ClientProfileViewPage);