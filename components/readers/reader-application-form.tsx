"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import { uploadFile, FILE_UPLOAD_CONFIG, isValidFileType, isValidFileSize } from "@/lib/upload";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/hooks/use-auth";

const readerApplicationSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  profileImage: z.string().optional(),
  tagline: z.string().min(10, "Tagline must be at least 10 characters").max(100, "Tagline must be less than 100 characters"),
  location: z.string().min(1, "Please specify your location"),
  experience: z.string().min(1, "Please describe your experience"),
  additionalInfo: z.string().optional(),
});

type ReaderApplicationData = z.infer<typeof readerApplicationSchema>;

export function ReaderApplicationForm() {
  const attributes = require('@/data/attributes.json');
  const { user, isSignedIn } = useAuth();
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  // Timezone options (can be expanded)
  const timezoneOptions = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Australia/Sydney"
  ];
  // Simple schedule: user picks available days (full day)
  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [timezone, setTimezone] = useState<string>("UTC");

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
  // No specialties field needed; attributes are built for payload
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [usernameStatus, setUsernameStatus] = useState<{
    available: boolean | null;
    message: string;
    checking: boolean;
  }>({ available: null, message: "", checking: false });

  const form = useForm<ReaderApplicationData>({
    resolver: zodResolver(readerApplicationSchema),
    defaultValues: {
      username: "",
      profileImage: "",
      tagline: "",
      location: "",
      experience: "",
      additionalInfo: "",
    },
  });

  async function onSubmit(data: ReaderApplicationData) {
    // Build attributes object
    const attributes = {
      abilities: selectedAbilities,
      tools: selectedTools,
      style: selectedStyle || ""
    };
    // Build schedule object (full day for selected days)
    const schedule: Record<string, { start: string; end: string }[]> = {};
    daysOfWeek.forEach(day => {
      schedule[day] = availableDays.includes(day)
        ? [{ start: "00:00", end: "23:59" }] // available all day
        : [];
    });
    // Build availability object
    const availability = {
      schedule,
      timezone,
      instantBooking: false // default, can be added to form later
    };
    // Get app user ID from user object (from database)
    const appUserId = user?.id;
    // Compose API payload to match /api/readers/apply expectations
    let profileImageUrl = data.profileImage || "";
    try {
      setIsSubmitting(true);
      // Validate that we have either a URL or a file
      if (!profileImageUrl && !profileImageFile) {
        toast({
          title: "Profile Image Required",
          description: "Please provide either a profile image URL or upload a file.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      // If a file was selected, upload it first
      if (profileImageFile) {
        setIsUploading(true);
        profileImageUrl = await uploadFile(profileImageFile);
        setIsUploading(false);
      }
      if (!isSignedIn || !appUserId) {
        toast({
          title: "Authentication Error",
          description: "You must be signed in to submit an application.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      const payload = {
        userId: appUserId,
        username: data.username,
        profileImage: profileImageUrl,
        tagline: data.tagline,
        location: data.location,
        attributes,
        availability,
        experience: data.experience,
        additionalInfo: data.additionalInfo,
      };
      const response = await fetch("/api/readers/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to submit application");
      }
      const result = await response.json();
      toast({
        title: "Application Submitted",
        description: "Your reader application has been submitted successfully! We'll review it and get back to you soon. You can now access your dashboard.",
      });
      setTimeout(() => {
        // Redirect to reader dashboard after successful application
        window.location.href = "/reader/dashboard";
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
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
      form.setValue("profileImage", ""); // Clear URL field when file is selected
    };
    reader.readAsDataURL(file);
  };

  // Watch username field for real-time validation
  const username = form.watch("username");
  const debouncedUsername = useDebounce(username, 500);

  useEffect(() => {
    if (debouncedUsername && debouncedUsername.length >= 3) {
      checkUsernameAvailability(debouncedUsername);
    } else {
      setUsernameStatus({ available: null, message: "", checking: false });
    }
  }, [debouncedUsername]);

  const checkUsernameAvailability = async (username: string) => {
    setUsernameStatus({ available: null, message: "", checking: true });
    
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
  };

  // ...existing code...

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
          name="tagline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tagline</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Intuitive Tarot Reader with 10+ years experience" {...field} />
              </FormControl>
              <FormDescription>
                A brief, compelling description of what you offer (10-100 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., New York, NY or London, UK" {...field} />
              </FormControl>
              <FormDescription>
                Your city and country/state
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Abilities, Tools, Style Selection (not a form field, but part of payload) */}
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

        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your experience as a reader..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Include how long you&apos;ve been reading and any relevant certifications
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Availability: Days of week checkboxes */}
        <div className="space-y-2">
          <FormLabel>General Availability</FormLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {daysOfWeek.map(day => (
              <label key={day} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={availableDays.includes(day)}
                  onChange={e => {
                    setAvailableDays(prev =>
                      e.target.checked
                        ? [...prev, day]
                        : prev.filter(d => d !== day)
                    );
                  }}
                />
                <span className="capitalize">{day}</span>
              </label>
            ))}
          </div>
          <FormDescription>
            Select the days you are generally available. (You&apos;ll be able to set specific hours later)
          </FormDescription>
        </div>
        {/* Timezone dropdown */}
        <div className="space-y-2">
          <FormLabel>Timezone</FormLabel>
          <select
            className="border rounded px-2 py-1 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
          >
            {timezoneOptions.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
          <FormDescription>
            Select your timezone for accurate scheduling.
          </FormDescription>
        </div>

        <FormField
          control={form.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Information</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Anything else you'd like us to know?"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isSubmitting || isUploading || usernameStatus.available === false} 
          className="w-full"
        >
          {isUploading ? "Uploading..." : isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
    </Form>
  );
}
