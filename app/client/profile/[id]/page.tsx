"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ReaderProfile } from "@/components/readers";
import { Card } from "@/components/ui/card";
import { withSafeRendering } from "@/components/ui/with-safe-rendering";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { User, Reader } from "@/types/index";
import { getMockReaderById } from "@/components/readers/mock-reader-data";
import { readerService } from "@/services/reader-service";
import { userService } from "@/services/api";

// Fetch profile by id (client or reader)
function useProfile(id: string | null) {
  const { user, role } = useAuth();
  const [profile, setProfile] = useState<User | Reader | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        if (!id || (user && id === user.id)) {
          // Own profile (client or reader)
          const data = await userService.getCurrentUser();
          setProfile(data);
        } else {
          // Reader profile
          try {
            const data = await readerService.getReaderById(id);
            setProfile(data);
          } catch (err) {
            // Use mock reader if fetch fails
            // Use mock reader if fetch fails
            const mockReader = getMockReaderById(id);
            if (mockReader) {
              setProfile(mockReader);
            } else {
              setProfile(null);
            }
            setError(null);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch profile");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [id, user]);

  return { profile, role, loading, error };
}


function ClientProfileViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : null;
  const { user, role } = useAuth();
  const { profile, loading, error } = useProfile(id);
  const isOwnProfile = !id || (user && id === user.id) ? true : false;

  return (
    <main className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{(profile && 'role' in profile && profile.role === "client") ? "Client Profile" : "Reader Profile"}</h1>
        <p className="text-sm text-muted-foreground">
          {isOwnProfile
            ? (profile && 'role' in profile && profile.role === "client")
              ? "Manage your client profile and preferences"
              : "Manage your reader profile and preferences"
            : `Viewing ${(profile && 'role' in profile && profile.role === "client") ? "Client" : "Reader"}: ${(profile && 'username' in profile) ? profile.username : 'Unknown'}`}
        </p>
      </div>

      {loading ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Loading profile...</p>
        </Card>
      ) : error ? (
        <Card className="p-6">
          <p className="text-center text-red-500">{error}</p>
        </Card>
      ) : profile ? (
        <div className="space-y-8">
          <ProfileHeader user={profile as any} isOwnProfile={Boolean(isOwnProfile)} />
          <Separator />
          {/* Sleek ReaderProfile display for reader profiles */}
          {!isOwnProfile && profile && (!('role' in profile) || profile.role === "reader") ? (
            (() => {
              const reader = profile as Reader;
              const readerProfileData = {
                id: reader.id,
                name: reader.username ?? `${(reader as any).firstName ?? ""} ${(reader as any).lastName ?? ""}`.trim(),
                avatarUrl: reader.profileImage ?? "/assets/readers/default.jpg",
                bio: reader.experience ?? reader.additionalInfo ?? "",
                specialties: (reader as any).specialties ?? [],
                rating: (reader as any).rating ?? 0,
                reviewCount: (reader as any).reviewCount ?? 0,
                status: (reader as any).status ?? "available",
                completedReadings: (reader as any).completedReadings ?? 0,
                languages: (reader as any).languages ?? ["English"],
                isVerified: (reader as any).isVerified ?? false,
                joinDate: reader.createdAt ? new Date(reader.createdAt) : new Date(),
                testimonials: (reader as any).testimonials ?? [],
              };
              // Only show request button if logged in as client
              const showRequestButton = role === "client";
              const handleRequestReading = () => {
                // TODO: Implement request reading logic (e.g., open modal, call API)
                alert("Request Reading for " + readerProfileData.name);
              };
              return (
                <div className="mt-6">
                  <Card className="p-0 shadow-none border-none bg-transparent">
                    <div className="rounded-xl overflow-hidden">
                      <div className="bg-white dark:bg-zinc-900">
                        <div className="p-0">
                          <ReaderProfile
                            reader={readerProfileData}
                            onRequestReading={showRequestButton ? handleRequestReading : undefined}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })()
          ) : null}
          {/* If viewing own reader profile, you can add more details here if needed */}
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

export default withSafeRendering(ClientProfileViewPage);