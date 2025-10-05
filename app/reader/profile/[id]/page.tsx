'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withSafeRendering } from '@/components/ui/with-safe-rendering';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Star, 
  MapPin,
  Sparkles,
  Video,
  Phone,
  MessageSquare,
  Globe,
  Award,
  ChevronLeft
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
}

interface ReaderProfileViewPageProps {
  params: Promise<{ id: string }>;
}

function ReaderProfileViewPage({ params }: ReaderProfileViewPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [readerData, setReaderData] = useState<ReaderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readerId, setReaderId] = useState<string | null>(null);

  // Unwrap params
  useEffect(() => {
    params.then(({ id }) => setReaderId(id));
  }, [params]);

  useEffect(() => {
    const fetchReaderProfile = async () => {
      if (!readerId) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/readers/${readerId}`);
        
        if (response.ok) {
          const data = await response.json();
          // Only show approved readers to non-owners
          if (!data.isApproved && data.userId !== user?.id) {
            setError('This reader profile is not yet approved.');
            return;
          }
          setReaderData(data);
        } else if (response.status === 404) {
          setError('Reader not found.');
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

    if (readerId) {
      fetchReaderProfile();
    }
  }, [readerId, user?.id]);

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

  if (error || !readerData) {
    return (
      <main className="container py-6">
        <Card className="p-6">
          <div className="text-center space-y-4">
            <p className="text-destructive">{error || 'Reader not found'}</p>
            <Button variant="outline" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  const availableDays = getAvailableDays();
  const isOwnProfile = user?.id === readerData.userId;

  return (
    <main className="container py-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="relative overflow-hidden">
          {readerData.backgroundImage && (
            <div 
              className="h-32 bg-cover bg-center"
              style={{ backgroundImage: `url(${readerData.backgroundImage})` }}
            />
          )}
          <CardContent className={readerData.backgroundImage ? 'pt-6' : 'pt-6 pb-6'}>
            <div className="flex items-start gap-6">
              <Avatar className={`h-24 w-24 border-4 border-background ${readerData.backgroundImage ? '-mt-16' : ''}`}>
                <AvatarImage src={readerData.profileImage} alt={readerData.username} />
                <AvatarFallback>{readerData.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold">{readerData.username}</h1>
                      <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs ${
                        readerData.isOnline 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}>
                        <div className={`h-2 w-2 rounded-full ${
                          readerData.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                        }`} />
                        {readerData.isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>
                    <p className="text-lg text-muted-foreground mt-1">{readerData.tagline}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {readerData.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {readerData.stats.averageRating.toFixed(1)} ({readerData.stats.totalReadings} readings)
                      </span>
                    </div>
                  </div>
                  
                  {!isOwnProfile && readerData.isApproved && (
                    <Button size="lg" onClick={() => router.push(`/client/book-reading?reader=${readerData.userId}`)}>
                      Book Reading
                    </Button>
                  )}
                  
                  {isOwnProfile && (
                    <Button variant="outline" onClick={() => router.push('/reader/profile/edit')}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readerData.stats.totalReadings}</div>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readerData.stats.completionRate}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Attributes & Specialties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Specialties
              </CardTitle>
              <CardDescription>Abilities, tools, and reading style</CardDescription>
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
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Availability
              </CardTitle>
              <CardDescription>Schedule and timezone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {readerData.availability && (
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
                      {readerData.availability.instantBooking ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reading Options */}
        {readerData.readingOptions && readerData.readingOptions.filter(opt => opt.isActive).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Reading Options
              </CardTitle>
              <CardDescription>Available reading formats and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {readerData.readingOptions.filter(opt => opt.isActive).map((option, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        {option.type === 'phone_call' && <Phone className="h-5 w-5 text-blue-500" />}
                        {option.type === 'video_message' && <Video className="h-5 w-5 text-purple-500" />}
                        {option.type === 'live_video' && <Video className="h-5 w-5 text-green-500" />}
                        <div className="flex-1">
                          <h4 className="font-semibold">{option.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                          <div className="mt-3">
                            <span className="text-lg font-bold">{option.basePrice} credits</span>
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

        {/* Experience */}
        {readerData.experience && (
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {readerData.experience}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        {readerData.additionalInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {readerData.additionalInfo}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Badges & Languages */}
        <div className="grid gap-6 lg:grid-cols-2">
          {readerData.badges && readerData.badges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
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

          {readerData.languages && readerData.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Languages
                </CardTitle>
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
      </div>
    </main>
  );
}

export default withSafeRendering(ReaderProfileViewPage);
