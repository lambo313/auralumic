"use client";

import { useAuth } from '@/hooks/use-auth';
import { ReaderProfileForm } from '@/components/profile/reader-profile-form';
import { Card } from '@/components/ui/card';
import { withSafeRendering } from '@/components/ui/with-safe-rendering';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type UserMetadata = {
  bio?: string;
  location?: string;
  website?: string;
  tagline?: string;
  experience?: string;
  availability?: string;
  additionalInfo?: string;
};

function ReaderProfileEditPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Please sign in to edit your profile
        </p>
      </Card>
    );
  }

  // Handler for save/submit
  const handleSave = async () => {
    setIsSubmitting(true);
    // Simulate save, replace with actual API call if needed
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/reader/profile');
    }, 800);
  };

  return (
    <main className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Reader Profile</h1>
        <p className="text-sm text-muted-foreground">
          Update your reader profile information and preferences
        </p>
      </div>
      <div className="space-y-8">
        <ReaderProfileForm
          reader={{
            id: user.id,
            username: user.username || '',
            profileImage: user.imageUrl || '',
            tagline: (user.unsafeMetadata as UserMetadata)?.tagline || '',
            location: (user.unsafeMetadata as UserMetadata)?.location || '',
            experience: (user.unsafeMetadata as UserMetadata)?.experience || '',
            availability: (user.unsafeMetadata as UserMetadata)?.availability || '',
            additionalInfo: (user.unsafeMetadata as UserMetadata)?.additionalInfo || '',
            role: role || undefined
          }}
        />
      </div>
    </main>
  );
}

export default withSafeRendering(ReaderProfileEditPage);