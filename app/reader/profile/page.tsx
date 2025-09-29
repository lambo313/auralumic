'use client';

import { useAuth } from '@/hooks/use-auth';
import { ProfileHeader } from '@/components/profile/profile-header';
import { Card } from '@/components/ui/card';
import { withSafeRendering } from '@/components/ui/with-safe-rendering';
import { Separator } from '@/components/ui/separator';

type UserMetadata = {
  bio?: string;
  location?: string;
  website?: string;
};

function ReaderProfilePage() {
  const { user, role } = useAuth();

  return (
    <main className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your reader profile and preferences
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

export default withSafeRendering(ReaderProfilePage);