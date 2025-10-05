'use client';

import { useAuth } from '@/hooks/use-auth';
import { ProfileHeader } from '@/components/profile/profile-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withSafeRendering } from '@/components/ui/with-safe-rendering';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Star, 
  Users, 
  DollarSign, 
  Award,
  Sparkles,
  Video,
  Phone,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Globe
} from 'lucide-react';
import attributesData from '@/data/attributes.json';

interface ReaderData {
  userId: string;
  username: string;
  profileImage: string;
  backgroundImage?: string;
  tagline: string;
  location: string;
  experience?: string;
  additionalInfo?: string;
  isOnline: boolean;
  isApproved: boolean;
  status: string;
  languages: string[];
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
  stats: {
    totalReadings: number;
    averageRating: number;
    totalEarnings: number;
    completionRate: number;
  };
  readingOptions?: Array<{
    type: string;
    name: string;
    description: string;
    basePrice: number;
    isActive: boolean;
  }>;
  badges?: string[];
  createdAt: string;
  lastActive: string;
}

function ReaderProfilePage() {
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

    if (role === 'reader') {
      fetchReaderProfile();
    } else {
      setIsLoading(false);
    }
  }, [user?.id, role]);

  // Helper function to get attribute name by ID
  const getAttributeName = (id: string, type: 'Abilities' | 'Tools' | 'Styles') => {
    const attribute = attributesData[type]?.find((attr: { id: string; name: string }) => attr.id === id);
    return attribute?.name || id;
  };

  // Format available days
  const getAvailableDays = () => {
    if (!readerData?.availability?.schedule) return [];
    return Object.entries(readerData.availability.schedule)
      .filter(([_, times]) => times.length > 0)
      .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1));
  };

  if (!user) {
    return (
      <main className="container py-6">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            Please sign in to view your profile
          </p>
        </Card>
      </main>
    );
  }

  if (role !== 'reader') {
    return (
      <main className="container py-6">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            This page is only accessible to readers. Please apply to become a reader first.
          </p>
        </Card>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="container py-6">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            Loading your profile...
          </p>
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-6">
        <Card className="p-6">
          <p className="text-center text-destructive">{error}</p>
        </Card>
      </main>
    );
  }

  if (!readerData) {
    return (
      <main className="container py-6">
        <Card className="p-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              You haven&apos;t set up your reader profile yet.
            </p>
            <Button onClick={() => router.push('/reader/profile/edit')}>
              Set Up Profile
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  const availableDays = getAvailableDays();

  return (
    <main className="container py-6">
      <div className="mb-6">
        <h1 className="page-title">Reader Profile</h1>
        <p className="page-description">
          Manage your reader profile and track your performance
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Header */}
        <ProfileHeader 
          user={{
            profileImage: readerData.profileImage,
            username: readerData.username,
            bio: readerData.tagline,
            location: readerData.location,
            createdAt: readerData.createdAt
          }} 
          isOwnProfile={true} 
        />

        {/* Status Banner */}
        <Card className={`border-2 ${
          readerData.isApproved 
            ? 'border-green-500/20 bg-green-500/5' 
            : 'border-yellow-500/20 bg-yellow-500/5'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {readerData.isApproved ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-400">
                        Profile Approved
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your profile is live and visible to clients
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                        Pending Approval
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your profile is under review by our team
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${
                  readerData.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                }`} />
                <span className="text-sm font-medium">
                  {readerData.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readerData.stats.totalReadings}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-1">
                {readerData.stats.averageRating.toFixed(1)}
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-xs text-muted-foreground">Out of 5.0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readerData.stats.totalEarnings} credits</div>
              <p className="text-xs text-muted-foreground">Lifetime</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readerData.stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">Of all bookings</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Attributes & Specialties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Attributes & Specialties
              </CardTitle>
              <CardDescription>Your unique abilities and reading style</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {readerData.attributes?.abilities && readerData.attributes.abilities.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Abilities</p>
                  <div className="flex flex-wrap gap-2">
                    {readerData.attributes.abilities.map((ability) => (
                      <Badge key={ability} variant="secondary" className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                        {getAttributeName(ability, 'Abilities')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {readerData.attributes?.tools && readerData.attributes.tools.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Tools</p>
                  <div className="flex flex-wrap gap-2">
                    {readerData.attributes.tools.map((tool) => (
                      <Badge key={tool} variant="secondary" className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                        {getAttributeName(tool, 'Tools')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {readerData.attributes?.style && (
                <div>
                  <p className="text-sm font-medium mb-2">Reading Style</p>
                  <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                    {getAttributeName(readerData.attributes.style, 'Styles')}
                  </Badge>
                </div>
              )}

              {(!readerData.attributes || 
                (!readerData.attributes.abilities?.length && 
                 !readerData.attributes.tools?.length && 
                 !readerData.attributes.style)) && (
                <p className="text-sm text-muted-foreground">
                  No attributes set. Edit your profile to add your specialties.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Availability
              </CardTitle>
              <CardDescription>Your schedule and timezone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {readerData.availability ? (
                <>
                  <div>
                    <p className="text-sm font-medium mb-2">Available Days</p>
                    {availableDays.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {availableDays.map((day) => (
                          <Badge key={day} variant="outline">
                            {day}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No availability set</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Timezone:</span>
                    <span className="text-muted-foreground">{readerData.availability.timezone}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Instant Booking:</span>
                    <span className={readerData.availability.instantBooking ? 'text-green-600' : 'text-muted-foreground'}>
                      {readerData.availability.instantBooking ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No availability set. Edit your profile to set your schedule.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reading Options */}
        {readerData.readingOptions && readerData.readingOptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Reading Options
              </CardTitle>
              <CardDescription>Services you offer to clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {readerData.readingOptions.map((option, index) => (
                  <Card key={index} className={`${!option.isActive && 'opacity-50'}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        {option.type === 'phone_call' && <Phone className="h-5 w-5 text-blue-500" />}
                        {option.type === 'video_message' && <Video className="h-5 w-5 text-purple-500" />}
                        {option.type === 'live_video' && <Video className="h-5 w-5 text-green-500" />}
                        <div className="flex-1">
                          <h4 className="font-semibold">{option.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-lg font-bold">{option.basePrice} credits</span>
                            <Badge variant={option.isActive ? 'default' : 'secondary'}>
                              {option.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experience & Additional Info */}
        <div className="grid gap-6 lg:grid-cols-2">
          {readerData.experience && (
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {readerData.experience}
                </p>
              </CardContent>
            </Card>
          )}

          {readerData.additionalInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {readerData.additionalInfo}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Badges */}
        {readerData.badges && readerData.badges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements & Badges
              </CardTitle>
              <CardDescription>Badges earned for your accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {readerData.badges.map((badgeId) => (
                  <div key={badgeId} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      {badgeId}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Languages */}
        {readerData.languages && readerData.languages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Languages
              </CardTitle>
              <CardDescription>Languages you can conduct readings in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {readerData.languages.map((language) => (
                  <Badge key={language} variant="outline">
                    {language}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

export default withSafeRendering(ReaderProfilePage);