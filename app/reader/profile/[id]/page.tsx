'use client';

import { useAuth } from '@/hooks/use-auth';
import { useCredits } from '@/hooks/use-credits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { withSafeRendering } from '@/components/ui/with-safe-rendering';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { RequestReadingModal } from '@/components/readers/request-reading-modal';
import { useLoadingState } from '@/hooks/use-loading-state';
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
import type { ReadingRequest } from '@/types/readings';
import { getTimezoneByValue, formatTimezoneLabel } from '@/lib/timezone-utils';
import { ReaderStatusBadge } from '@/components/readers/reader-status-badge';

interface ReaderData {
  userId: string;
  username: string;
  profileImage: string;
  backgroundImage?: string;
  tagline: string;
  location: string;
  aboutMe?: string;
  additionalInfo?: string;
  isOnline: boolean;
  isApproved: boolean;
  status: 'available' | 'busy' | 'offline' | 'pending' | 'approved' | 'rejected' | 'suspended';
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
    totalEarnings?: number;
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
  const { credits, refreshBalance } = useCredits();
  const router = useRouter();
  const { isLoading: isRequestLoading, withLoading } = useLoadingState();
  const [readerData, setReaderData] = useState<ReaderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readerId, setReaderId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Helper function to convert 24-hour time to 12-hour format
  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Format available days
  const getAvailableDays = () => {
    if (!readerData?.availability?.schedule) return [];
    return Object.entries(readerData.availability.schedule)
      .filter(([_, times]) => times.length > 0)
      .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1));
  };

  // Handle request reading modal
  const handleRequestReading = () => {
    setIsModalOpen(true);
  };

  const handleModalRequestReading = async (request: ReadingRequest) => {
    try {
      await withLoading(async () => {
        // Here you would typically make an API call to submit the reading request
        const response = await fetch('/api/reading-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...request,
            readerId: readerData?.userId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit reading request');
        }

        // You might want to show a success message or redirect
        // For now, we'll just close the modal
      });
    } catch (error) {
      console.error('Error submitting reading request:', error);
      // You might want to show an error message to the user
    } finally {
      setIsModalOpen(false);
    }
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
    <main className="container mx-auto px-4 py-8 max-w-6xl">
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
        <h1 className="page-title">
          Reader Profile
        </h1>
        <p className="page-description">
          Explore the reader&apos;s specialties, availability, and more
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Header */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-950 dark:via-gray-900/50 dark:to-gray-950">
          {readerData.backgroundImage && (
            <div 
              className="h-40 md:h-48 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${readerData.backgroundImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            </div>
          )}
          <CardContent className={`${readerData.backgroundImage ? 'pt-8' : 'pt-8'} pb-8`}>
            <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
              {/* Avatar Section */}
              <div className="relative">
                <Avatar className={`h-28 w-28 md:h-32 md:w-32 border-4 border-white/80 shadow-xl backdrop-blur-sm ${readerData.backgroundImage ? '-mt-20 md:-mt-24' : ''}`}>
                  <AvatarImage src={readerData.profileImage} alt={readerData.username} className="object-cover" />
                  <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {readerData.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Status Indicator */}
                <div className="absolute -bottom-2 -right-2">
                  <ReaderStatusBadge 
                    status={readerData.status} 
                    isOnline={readerData.isOnline} 
                    variant="compact"
                    className="backdrop-blur-md shadow-lg border-2 border-white/50"
                  />
                </div>
              </div>
              
              {/* Profile Information */}
              <div className="flex-1 w-full">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                        {readerData.username}
                      </h1>
                      <p className="text-lg md:text-xl text-muted-foreground font-medium">{readerData.tagline}</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30">
                          <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium">{readerData.location}</span>
                      </span>
                      <span className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <div className="p-1 rounded-md bg-yellow-100 dark:bg-yellow-900/30">
                          <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                        </div>
                        <span className="font-medium">
                          {readerData.stats.averageRating.toFixed(1)} · {readerData.stats.totalReadings} readings
                        </span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {!isOwnProfile && readerData.isApproved && (
                      <Button 
                        size="lg" 
                        onClick={handleRequestReading}
                        disabled={isRequestLoading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        {isRequestLoading ? 'Processing...' : 'Book Reading'}
                      </Button>
                    )}
                    
                    {isOwnProfile && (
                      <Button 
                        variant="outline" 
                        onClick={() => router.push('/reader/profile/edit')}
                        className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105"
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-blue-950/30 dark:via-gray-950 dark:to-blue-950/30 group hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Readings</CardTitle>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {readerData.stats.totalReadings}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Sessions completed</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-yellow-50 via-white to-yellow-50/50 dark:from-yellow-950/30 dark:via-gray-950 dark:to-yellow-950/30 group hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300">Average Rating</CardTitle>
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors">
                <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                {readerData.stats.averageRating.toFixed(1)}
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Client satisfaction</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 via-white to-green-50/50 dark:from-green-950/30 dark:via-gray-950 dark:to-green-950/30 group hover:scale-105 sm:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300">Completion Rate</CardTitle>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {readerData.stats.completionRate}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Success rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Attributes & Specialties */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                Specialties
              </CardTitle>
              <CardDescription className="text-base">Abilities, tools, and reading style</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {readerData.attributes?.abilities && readerData.attributes.abilities.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Abilities</p>
                  <div className="flex flex-wrap gap-2">
                    {readerData.attributes.abilities.map((ability) => (
                      <Badge key={ability} variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors px-3 py-1">
                        {getAttributeName(ability, 'Abilities')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {readerData.attributes?.tools && readerData.attributes.tools.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Tools</p>
                  <div className="flex flex-wrap gap-2">
                    {readerData.attributes.tools.map((tool) => (
                      <Badge key={tool} variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors px-3 py-1">
                        {getAttributeName(tool, 'Tools')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {readerData.attributes?.style && (
                <div>
                  <p className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Reading Style</p>
                  <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors px-3 py-1">
                    {getAttributeName(readerData.attributes.style, 'Styles')}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Availability
              </CardTitle>
              <CardDescription className="text-base">Schedule and timezone information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {readerData.availability && (
                <>
                  <div>
                    <p className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Schedule</p>
                    {availableDays.length > 0 ? (
                      <div className="space-y-2">
                        {availableDays.map((day) => {
                          const daySchedule = readerData.availability?.schedule[day.toLowerCase()];
                          const timeSlot = daySchedule && daySchedule.length > 0 ? daySchedule[0] : null;
                          return (
                            <div key={day} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                              <span className="font-medium text-blue-700 dark:text-blue-300">{day}</span>
                              {timeSlot ? (
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatTime12Hour(timeSlot.start)} - {formatTime12Hour(timeSlot.end)}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-500">All day</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No availability set</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-sm bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                    <div className="p-1 rounded bg-gray-200 dark:bg-gray-700">
                      <Globe className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Timezone:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {(() => {
                        const timezoneObj = getTimezoneByValue(readerData.availability.timezone);
                        return timezoneObj ? formatTimezoneLabel(timezoneObj) : readerData.availability.timezone;
                      })()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                    <div className="p-1 rounded bg-gray-200 dark:bg-gray-700">
                      <Clock className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Instant Booking:</span>
                    <span className={`font-medium ${readerData.availability.instantBooking ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
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

        {/* About Me Video */}
        {readerData.aboutMe && (
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video">
                <iframe
                  src={readerData.aboutMe}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  title="About Me Video"
                />
              </div>
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

      {/* Request Reading Modal */}
      {readerData && (
        <RequestReadingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          client={{ credits }}
          reader={{
            id: readerData.userId,
            userId: readerData.userId,
            username: readerData.username,
            profileImage: readerData.profileImage,
            tagline: readerData.tagline,
            location: readerData.location,
            aboutMe: readerData.aboutMe,
            languages: readerData.languages,
            isOnline: readerData.isOnline,
            isApproved: readerData.isApproved,
            attributes: {
              tools: readerData.attributes?.tools || [],
              abilities: readerData.attributes?.abilities || [],
              style: readerData.attributes?.style
            },
            availability: readerData.availability ? {
              schedule: {
                monday: readerData.availability.schedule?.monday || [],
                tuesday: readerData.availability.schedule?.tuesday || [],
                wednesday: readerData.availability.schedule?.wednesday || [],
                thursday: readerData.availability.schedule?.thursday || [],
                friday: readerData.availability.schedule?.friday || [],
                saturday: readerData.availability.schedule?.saturday || [],
                sunday: readerData.availability.schedule?.sunday || []
              },
              timezone: readerData.availability.timezone,
              instantBooking: readerData.availability.instantBooking
            } : {
              schedule: {
                monday: [],
                tuesday: [],
                wednesday: [],
                thursday: [],
                friday: [],
                saturday: [],
                sunday: []
              },
              timezone: 'UTC',
              instantBooking: false
            },
            stats: {
              totalReadings: readerData.stats.totalReadings,
              averageRating: readerData.stats.averageRating,
              totalEarnings: readerData.stats.totalEarnings ?? 0,
              completionRate: readerData.stats.completionRate
            },
            badges: readerData.badges || [],
            reviews: [], // This might need to be fetched separately or added to ReaderData
            status: readerData.status,
            readingOptions: readerData.readingOptions?.map(option => ({
              type: option.type as "phone_call" | "video_message" | "live_video",
              name: option.name,
              description: option.description,
              basePrice: option.basePrice,
              timeSpans: [
                {
                  duration: 15,
                  label: "15 minutes",
                  multiplier: 1,
                  isActive: true
                },
                {
                  duration: 30,
                  label: "30 minutes", 
                  multiplier: 2,
                  isActive: true
                },
                {
                  duration: 60,
                  label: "60 minutes",
                  multiplier: 4,
                  isActive: true
                }
              ],
              isActive: option.isActive
            })) || [],
            additionalInfo: readerData.additionalInfo,
            backgroundImage: readerData.backgroundImage,
            createdAt: new Date(readerData.createdAt),
            lastActive: new Date(), // Add current date as default or fetch from API
            updatedAt: new Date(readerData.createdAt) // Use createdAt as fallback or fetch actual updatedAt
          }}
          onCreditsUpdated={(newBalance) => {
            // Refresh the credits from the server to ensure accuracy
            refreshBalance();
          }}
        />
      )}
    </main>
  );
}

export default withSafeRendering(ReaderProfileViewPage);
