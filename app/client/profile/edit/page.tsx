"use client";

import { useAuth } from '@/hooks/use-auth';
import { ClientProfileForm } from '@/components/profile/client-profile-form';
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

function ClientProfileEditPage() {
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
      router.push('/client/profile');
    }, 800);
  };

  return (
    <main className="container py-6">
      <div className="mb-6">
        <h1 className="page-title">Edit Profile</h1>
        <p className="page-description">
          Update your profile information and preferences
        </p>
      </div>
      <div className="space-y-8">
        <ClientProfileForm
          user={{
            id: user.id,
            name: user.fullName || user.username || '',
            location: (user.unsafeMetadata as UserMetadata)?.location || '',
            role: role || undefined
          }}
        />
      </div>
    </main>
  );
}

export default withSafeRendering(ClientProfileEditPage);