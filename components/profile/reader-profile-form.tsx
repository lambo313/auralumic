"use client";

import { useState, useEffect, useCallback } from "react";
import { uploadFile, FILE_UPLOAD_CONFIG, isValidFileType, isValidFileSize } from "@/lib/upload";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { LocationSelector } from "@/components/ui/location-selector";
import { timezoneGroups, getCommonTimezones, formatTimezoneLabel } from "@/lib/timezone-utils";
import attributesData from "@/data/attributes.json";

// Reuse schema from ReaderApplicationForm
const readerProfileSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  profileImage: z.string().optional(),
  tagline: z.string().min(10, "Tagline must be at least 10 characters").max(100, "Tagline must be less than 100 characters"),
  location: z.string().min(1, "Please select your location"),
  aboutMe: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type ReaderProfileFormValues = z.infer<typeof readerProfileSchema>;

interface ReaderProfileFormProps {
  reader: {
    id: string;
    username: string;
    profileImage?: string;
    tagline?: string;
    location?: string;
    aboutMe?: string;
    attributes?: {
      abilities?: string[];
      tools?: string[];
      style?: string;
    };
    availability?: string;
    additionalInfo?: string;
    role?: string;
  };
}

export function ReaderProfileForm({ reader }: ReaderProfileFormProps) {
  const router = useRouter();
  
  // Load attributes
  const attributes = attributesData;
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  // Get common timezones for quick access, with full list available
  const commonTimezones = getCommonTimezones();
  const [showAllTimezones, setShowAllTimezones] = useState(false);
  // Simple schedule: user picks available days with specific times
  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [scheduleHours, setScheduleHours] = useState<Record<string, { start: string; end: string }>>({});
  const [timezone, setTimezone] = useState<string>("UTC");
  const [instantBooking, setInstantBooking] = useState<boolean>(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    available: boolean | null;
    message: string;
    checking: boolean;
  }>({ available: null, message: "", checking: false });

  const readerForm = useForm<ReaderProfileFormValues>({
    resolver: zodResolver(readerProfileSchema),
    defaultValues: {
      username: reader.username || "",
      profileImage: reader.profileImage || "",
      tagline: reader.tagline || "",
      location: reader.location || "",
      aboutMe: reader.aboutMe || "",
      additionalInfo: reader.additionalInfo || "",
    },
  });

  useEffect(() => {
    const fetchReaderData = async () => {
      try {
        const response = await fetch(`/api/readers/${reader.id}`);
        if (response.ok) {
          const data = await response.json();
          // Update form with fetched data
          readerForm.reset({
            username: data.username || "",
            profileImage: data.profileImage || "",
            tagline: data.tagline || "",
            location: data.location || "",
            aboutMe: data.aboutMe || "",
            additionalInfo: data.additionalInfo || "",
          });
          // Update selected attributes
          setSelectedAbilities(data.attributes?.abilities || []);
          setSelectedTools(data.attributes?.tools || []);
          setSelectedStyle(data.attributes?.style || null);
          // Update availability
          setTimezone(data.availability?.timezone || "UTC");
          setInstantBooking(data.availability?.instantBooking || false);
          const days = Object.keys(data.availability?.schedule || {}).filter(
            day => data.availability.schedule[day].length > 0
          );
          setAvailableDays(days);
          
          // Load schedule hours for each day
          const hours: Record<string, { start: string; end: string }> = {};
          days.forEach(day => {
            const daySchedule = data.availability?.schedule[day];
            if (daySchedule && daySchedule.length > 0) {
              hours[day] = {
                start: daySchedule[0].start,
                end: daySchedule[0].end
              };
            }
          });
          setScheduleHours(hours);
        }
      } catch (error) {
        console.error("Failed to fetch reader data", error);
      }
    };
    if (reader.id) {
      fetchReaderData();
    }
  }, [reader.id]);

  // Watch username field for real-time validation
  const username = readerForm.watch("username");
  const debouncedUsername = useDebounce(username, 500);

  const checkUsernameAvailability = useCallback(async (username: string) => {
    setUsernameStatus({ available: null, message: "", checking: true });
    
    // If the username is the same as the current user's username, it's available
    if (username === reader.username) {
      setUsernameStatus({
        available: true,
        message: "This is your current username",
        checking: false
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/readers/check-username?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      
      setUsernameStatus({
        available: data.available,
        message: data.message,
        checking: false
      });
    } catch (error) {
      setUsernameStatus({
        available: false,
        message: "Error checking username availability",
        checking: false
      });
    }
  }, [reader.username]);

  useEffect(() => {
    if (debouncedUsername && debouncedUsername.length >= 3) {
      checkUsernameAvailability(debouncedUsername);
    } else {
      setUsernameStatus({ available: null, message: "", checking: false });
    }
  }, [debouncedUsername, checkUsernameAvailability]);

  // Toggle logic
  const toggleAbility = (name: string) => {
    setSelectedAbilities(prev =>
      prev.includes(name)
        ? prev.filter(a => a !== name)
        : prev.length < 3 ? [...prev, name] : prev
    );
  };
  const toggleTool = (name: string) => {
    setSelectedTools(prev =>
      prev.includes(name)
        ? prev.filter(t => t !== name)
        : prev.length < 3 ? [...prev, name] : prev
    );
  };
  const selectStyle = (name: string) => {
    setSelectedStyle(prev => prev === name ? null : name);
  };

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");

  async function onSubmit(data: ReaderProfileFormValues) {
    // Build schedule object with specific times for selected days
    const schedule: Record<string, { start: string; end: string }[]> = {};
    daysOfWeek.forEach(day => {
      if (availableDays.includes(day) && scheduleHours[day]) {
        schedule[day] = [{ 
          start: scheduleHours[day].start, 
          end: scheduleHours[day].end 
        }];
      } else {
        schedule[day] = [];
      }
    });
    // Build availability object
    const availability = {
      schedule,
      timezone,
      instantBooking
    };

    try {
      setIsSubmitting(true);
      let profileImageUrl = data.profileImage || "";
      // Validate that we have either a URL or a file
      if (!profileImageUrl && !profileImageFile) {
        toast({
          title: "Profile Image Required",
          description: "Please provide either a profile image URL or upload a file.",
          variant: "destructive",
        });
        return;
      }
      // If a file was selected, upload it first
      if (profileImageFile) {
        setIsUploading(true);
        profileImageUrl = await uploadFile(profileImageFile);
        setIsUploading(false);
      }
      // API call to update reader profile
      const response = await fetch(`/api/readers/${reader.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          profileImage: profileImageUrl,
          tagline: data.tagline,
          location: data.location,
          attributes: {
            abilities: selectedAbilities,
            tools: selectedTools,
            style: selectedStyle || "",
          },
          availability,
          aboutMe: data.aboutMe,
          additionalInfo: data.additionalInfo,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      toast({
        title: "Profile updated",
        description: "Your reader profile has been updated successfully.",
      });
      
      // Redirect to reader profile page after successful save
      router.push("/reader/profile");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  }

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Validate file type
    if (!isValidFileType(file, FILE_UPLOAD_CONFIG.allowedTypes)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a valid image file (JPEG, PNG, GIF, or WebP).",
        variant: "destructive",
      });
      return;
    }
    // Validate file size
    if (!isValidFileSize(file, FILE_UPLOAD_CONFIG.maxSize)) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }
    setProfileImageFile(file);
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImagePreview(e.target?.result as string);
      readerForm.setValue("profileImage", ""); // Clear URL field when file is selected
    };
    reader.readAsDataURL(file);
  };

  return (
    <Form {...readerForm}>
      <form onSubmit={readerForm.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={readerForm.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder="e.g., mystic_reader123" {...field} />
                  {usernameStatus.checking && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Choose a unique username that clients will use to find you (3-20 characters, letters, numbers, and underscores only)
              </FormDescription>
              {usernameStatus.message && (
                <div className={`text-sm ${
                  usernameStatus.available === true 
                    ? "text-green-600" 
                    : usernameStatus.available === false 
                      ? "text-red-600" 
                      : ""
                }`}>
                  {usernameStatus.message}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={readerForm.control}
          name="profileImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {/* File Upload Option */}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('profile-image-upload')?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? "Uploading..." : "Upload Image"}
                    </Button>
                  </div>
                  {/* Preview */}
                  {profileImagePreview && (
                    <div className="mt-2">
                      <img 
                        src={profileImagePreview} 
                        alt="Profile preview" 
                        className="w-24 h-24 object-cover rounded-full border"
                      />
                    </div>
                  )}
                  {/* OR Separator */}
                  <div className="text-center text-sm text-gray-500">OR</div>
                  {/* URL Input Option */}
                  <Input 
                    placeholder="https://example.com/your-photo.jpg" 
                    {...field}
                    disabled={!!profileImageFile}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Upload an image file or provide a URL to your profile photo
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={readerForm.control}
          name="tagline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tagline</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Intuitive Tarot Reader with 10+ years experience" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={readerForm.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <LocationSelector
                  value={field.value}
                  onChange={(location, detectedTimezone) => {
                    field.onChange(location);
                    setTimezone(detectedTimezone);
                  }}
                />
              </FormControl>
              <FormDescription>
                Select your country and state/province. This will automatically set your timezone.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={readerForm.control}
          name="aboutMe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About Me Video</FormLabel>
              <FormControl>
                <Input placeholder="e.g., https://youtube.com/embed/your-video-id" {...field} />
              </FormControl>
              <FormDescription>
                Provide a link to a video where you introduce yourself to potential clients (YouTube embed link, Vimeo embed link, etc.)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Abilities, Tools, Style Selection */}
        <div className="mb-6">
          <FormLabel>Abilities <span className="text-xs text-muted-foreground">(max 3)</span></FormLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {attributes.Abilities.map((a: { id: string; name: string; description: string }) => (
              <Button
                key={a.id}
                type="button"
                variant={selectedAbilities.includes(a.name) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleAbility(a.name)}
                disabled={!selectedAbilities.includes(a.name) && selectedAbilities.length >= 3}
                size="sm"
                title={a.description}
              >
                {a.name}
              </Button>
            ))}
          </div>
          <FormLabel>Tools <span className="text-xs text-muted-foreground">(max 3)</span></FormLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {attributes.Tools.map((t: { id: string; name: string; description: string }) => (
              <Button
                key={t.id}
                type="button"
                variant={selectedTools.includes(t.name) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTool(t.name)}
                disabled={!selectedTools.includes(t.name) && selectedTools.length >= 3}
                size="sm"
                title={t.description}
              >
                {t.name}
              </Button>
            ))}
          </div>
          <FormLabel>Style <span className="text-xs text-muted-foreground">(choose 1)</span></FormLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {attributes.Styles.map((s: { id: string; name: string; description: string }) => (
              <Button
                key={s.id}
                type="button"
                variant={selectedStyle === s.name ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => selectStyle(s.name)}
                size="sm"
                title={s.description}
              >
                {s.name}
              </Button>
            ))}
          </div>
          <FormDescription>
            Select up to 3 abilities, 3 tools, and 1 style that best describe your reading approach.
          </FormDescription>
        </div>

        {/* Availability: Days of week with detailed time settings */}
        <div className="space-y-4">
          <FormLabel>Detailed Availability Schedule</FormLabel>
          <div className="space-y-3">
            {daysOfWeek.map(day => (
              <div key={day} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={availableDays.includes(day)}
                      onChange={e => {
                        setAvailableDays(prev =>
                          e.target.checked
                            ? [...prev, day]
                            : prev.filter(d => d !== day)
                        );
                        if (e.target.checked && !scheduleHours[day]) {
                          setScheduleHours(prev => ({
                            ...prev,
                            [day]: { start: "09:00", end: "17:00" }
                          }));
                        }
                      }}
                    />
                    <span className="capitalize font-medium">{day}</span>
                  </label>
                </div>
                {availableDays.includes(day) && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div className="space-y-1">
                      <FormLabel className="text-sm">Start Time</FormLabel>
                      <Input
                        type="time"
                        value={scheduleHours[day]?.start || "09:00"}
                        onChange={e => {
                          setScheduleHours(prev => ({
                            ...prev,
                            [day]: {
                              ...prev[day],
                              start: e.target.value
                            }
                          }));
                        }}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <FormLabel className="text-sm">End Time</FormLabel>
                      <Input
                        type="time"
                        value={scheduleHours[day]?.end || "17:00"}
                        onChange={e => {
                          setScheduleHours(prev => ({
                            ...prev,
                            [day]: {
                              ...prev[day],
                              end: e.target.value
                            }
                          }));
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <FormDescription>
            Select the days you are available and set specific hours for each day. You can edit these times later.
          </FormDescription>
        </div>
        {/* Timezone dropdown */}
        <div className="space-y-2">
          <FormLabel>Timezone</FormLabel>
          <div className="space-y-3">
            <select
              className="w-full border rounded-md px-3 py-2 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              value={timezone}
              onChange={e => {
                const value = e.target.value;
                if (value === 'show-all') {
                  setShowAllTimezones(true);
                } else if (value === 'show-common') {
                  setShowAllTimezones(false);
                } else {
                  setTimezone(value);
                }
              }}
            >
              {!showAllTimezones ? (
                <>
                  <optgroup label="Common Timezones">
                    {commonTimezones.map(tz => (
                      <option key={tz.value} value={tz.value}>
                        {formatTimezoneLabel(tz)}
                      </option>
                    ))}
                  </optgroup>
                  <option value="show-all">── Show All Timezones ──</option>
                </>
              ) : (
                <>
                  <option value="show-common">── Show Common Only ──</option>
                  {timezoneGroups.map(group => (
                    <optgroup key={group.region} label={group.region}>
                      {group.timezones.map(tz => (
                        <option key={tz.value} value={tz.value}>
                          {formatTimezoneLabel(tz)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </>
              )}
            </select>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAllTimezones(!showAllTimezones)}
                className="text-xs"
              >
                {showAllTimezones ? 'Show Common Only' : 'Show All Timezones'}
              </Button>
            </div>
          </div>
          <FormDescription>
            Select your timezone for accurate scheduling. The timezone will be automatically detected based on your selected location.
          </FormDescription>
        </div>

        {/* Instant Booking Toggle */}
        <div className="space-y-2">
          <FormLabel>Instant Booking</FormLabel>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="instantBooking"
              checked={instantBooking}
              onChange={(e) => setInstantBooking(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="instantBooking" className="text-sm font-medium">
              Enable instant booking for phone and video calls
            </label>
          </div>
          <FormDescription>
            When enabled, clients can choose between instant readings or scheduled readings for phone and video calls. Video messages are always queued regardless of this setting.
          </FormDescription>
        </div>

        <FormField
          control={readerForm.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Information</FormLabel>
              <FormControl>
                <Textarea placeholder="Anything else you&apos;d like us to know?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting || usernameStatus.available === false} className="w-full">
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
