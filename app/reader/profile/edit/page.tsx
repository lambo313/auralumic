"use client";

import { useAuth } from '@/hooks/use-auth';
import { ReaderProfileForm } from '@/components/profile/reader-profile-form';
import { Card } from '@/components/ui/card';
import { withSafeRendering } from '@/components/ui/with-safe-rendering';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface ReaderData {
  userId: string;
  username: string;
  profileImage: string;
  tagline: string;
  location: string;
  aboutMe?: string;
  additionalInfo?: string;
  attributes?: {
    abilities?: string[];
    tools?: string[];
    style?: string;
  };
  availability?: {
    schedule: Record<string, { start: string; end: string }[]>;
    timezone: string;
    instantBooking: boolean;
  };
}

function ReaderProfileEditPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [readerData, setReaderData] = useState<ReaderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReaderProfile = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/readers/${user.id}`);
        
        if (response.ok) {
          const data = await response.json();
          setReaderData(data);
        } else if (response.status === 404) {
          // Reader profile doesn't exist yet - this is okay for first-time setup
          setReaderData(null);
        } else {
          throw new Error('Failed to fetch reader profile');
        }
      } catch (err) {
        console.error('Error fetching reader profile:', err);
        setError('Failed to load reader profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReaderProfile();
  }, [user?.id]);

  if (!user) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Please sign in to edit your profile
        </p>
      </Card>
    );
  }

  if (role !== 'reader') {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          This page is only accessible to readers. Please apply to become a reader first.
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <main className="container py-6">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            Loading reader profile...
          </p>
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-6">
        <Card className="p-6">
          <p className="text-center text-destructive">
            {error}
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main className="container py-6">
      <div className="mb-6">
        <h1 className="page-title">Edit Reader Profile</h1>
        <p className="page-description">
          Update your reader profile information and preferences
        </p>
      </div>
      <div className="space-y-8">
        <ReaderProfileForm
          reader={{
            id: user.id,
            username: readerData?.username || user.username || '',
            profileImage: readerData?.profileImage || user.imageUrl || '',
            tagline: readerData?.tagline || '',
            location: readerData?.location || '',
            aboutMe: readerData?.aboutMe || '',
            additionalInfo: readerData?.additionalInfo || '',
            attributes: readerData?.attributes,
            availability: readerData?.availability ? 
              JSON.stringify(readerData.availability) : undefined,
            role: role || undefined
          }}
        />
      </div>
    </main>
  );
}

export default withSafeRendering(ReaderProfileEditPage);