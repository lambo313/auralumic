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
  Globe,
  MapPin
} from 'lucide-react';
import attributesData from '@/data/attributes.json';
import { getTimezoneByValue, formatTimezoneLabel } from '@/lib/timezone-utils';

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
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
          Reader Profile
        </h1>
        <p className="text-lg text-muted-foreground font-medium mt-2">
          Manage your reader profile and track your performance
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
                <div className={`h-28 w-28 md:h-32 md:w-32 rounded-full border-4 border-white/80 shadow-xl backdrop-blur-sm overflow-hidden ${readerData.backgroundImage ? '-mt-20 md:-mt-24' : ''}`}>
                  <img 
                    src={readerData.profileImage} 
                    alt={readerData.username} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Status Indicator */}
                <div className={`absolute -bottom-2 -right-2 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md shadow-lg ${
                  readerData.isOnline 
                    ? 'bg-green-500/90 text-white border border-green-400/50' 
                    : 'bg-gray-500/90 text-white border border-gray-400/50'
                }`}>
                  <div className={`h-2 w-2 rounded-full ${
                    readerData.isOnline ? 'bg-white animate-pulse' : 'bg-gray-200'
                  }`} />
                  {readerData.isOnline ? 'Online' : 'Offline'}
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
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/reader/profile/edit')}
                      className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105"
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Banner */}
        <Card className={`relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 ${
          readerData.isApproved 
            ? 'bg-gradient-to-br from-green-50 via-white to-green-50/50 dark:from-green-950/30 dark:via-gray-950 dark:to-green-950/30' 
            : 'bg-gradient-to-br from-yellow-50 via-white to-yellow-50/50 dark:from-yellow-950/30 dark:via-gray-950 dark:to-yellow-950/30'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {readerData.isApproved ? (
                  <>
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
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
                    <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                      <XCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-blue-950/30 dark:via-gray-950 dark:to-blue-950/30 group hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Readings</CardTitle>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{readerData.stats.totalReadings}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
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
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Out of 5.0</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 via-white to-green-50/50 dark:from-green-950/30 dark:via-gray-950 dark:to-green-950/30 group hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Earnings</CardTitle>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{readerData.stats.totalEarnings} credits</div>
              <p className="text-xs text-muted-foreground mt-1">Lifetime</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 via-white to-purple-50/50 dark:from-purple-950/30 dark:via-gray-950 dark:to-purple-950/30 group hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300">Completion Rate</CardTitle>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{readerData.stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Of all bookings</p>
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
                Attributes & Specialties
              </CardTitle>
              <CardDescription className="text-base">Your unique abilities and reading style</CardDescription>
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
          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Availability
              </CardTitle>
              <CardDescription className="text-base">Your schedule and timezone information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {readerData.availability ? (
                <>
                  <div>
                    <p className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Schedule</p>
                    {availableDays.length > 0 ? (
                      <div className="space-y-2">
                        {availableDays.map((day) => {
                          const daySchedule = readerData.availability?.schedule[day.toLowerCase()];
                          const timeSlot = daySchedule && daySchedule.length > 0 ? daySchedule[0] : null;
                          return (
                            <div key={day} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                              <span className="font-medium text-blue-700 dark:text-blue-300">{day}</span>
                              {timeSlot ? (
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
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
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">Timezone:</span>
                    <span className="text-muted-foreground">
                      {(() => {
                        const timezoneObj = getTimezoneByValue(readerData.availability.timezone);
                        return timezoneObj ? formatTimezoneLabel(timezoneObj) : readerData.availability.timezone;
                      })()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                    <div className="p-1 rounded bg-gray-200 dark:bg-gray-700">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">Instant Booking:</span>
                    <span className={`font-medium ${readerData.availability.instantBooking ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
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
          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                Reading Options
              </CardTitle>
              <CardDescription className="text-base">Services you offer to clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {readerData.readingOptions.map((option, index) => (
                  <Card key={index} className={`border-0 shadow-sm hover:shadow-md transition-all duration-300 ${!option.isActive && 'opacity-50'}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        {option.type === 'phone_call' && (
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                        {option.type === 'video_message' && (
                          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                        )}
                        {option.type === 'live_video' && (
                          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <Video className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{option.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{option.basePrice} credits</span>
                            <Badge variant={option.isActive ? 'default' : 'secondary'} className="ml-2">
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

        {/* About Me Video & Additional Info */}
        <div className="grid gap-8 lg:grid-cols-2">
          {readerData.aboutMe && (
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  About Me Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src={readerData.aboutMe}
                    className="w-full h-full"
                    allowFullScreen
                    title="About Me Video"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {readerData.additionalInfo && (
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {readerData.additionalInfo}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Badges & Languages */}
        <div className="grid gap-8 lg:grid-cols-2">
          {readerData.badges && readerData.badges.length > 0 && (
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  Achievements & Badges
                </CardTitle>
                <CardDescription className="text-base">Badges earned for your accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {readerData.badges.map((badgeId) => (
                    <div key={badgeId} className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/30 transition-colors">
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
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Languages
                </CardTitle>
                <CardDescription className="text-base">Languages you can conduct readings in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {readerData.languages.map((language) => (
                    <Badge key={language} variant="outline" className="px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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

export default withSafeRendering(ReaderProfilePage);