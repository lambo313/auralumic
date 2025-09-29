"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/services/api";
import { useUser } from "@clerk/nextjs";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters"),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: {
    id: string;
    name?: string;
    bio?: string;
    location?: string;
    website?: string;
    role?: string;
  };
}

export function ProfileForm({ user: initialData }: ProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const role = initialData.role;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.name || "",
      bio: initialData.bio || "",
      location: initialData.location || "",
      website: initialData.website || "",
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          hasCompletedOnboarding: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update Clerk metadata
      if (user) {
        const currentMetadata = user.publicMetadata || {};
        await user.update({
          unsafeMetadata: {
            ...currentMetadata,
            hasCompletedOnboarding: true
          }
        });
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      if (role === 'reader') {
        router.push('/onboarding/reader-application');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#F8F8FF]">Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="bg-black/40 border-[#7878FF]/40 text-[#F8F8FF] placeholder:text-[#C0C0C0]/50 focus-visible:ring-[#7878FF]/50 focus-visible:border-[#7878FF]" 
                  placeholder="Enter your name"
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#F8F8FF]">Bio</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  className="bg-black/40 border-[#7878FF]/40 text-[#F8F8FF] placeholder:text-[#C0C0C0]/50 focus-visible:ring-[#7878FF]/50 focus-visible:border-[#7878FF] min-h-[100px]" 
                  placeholder="Tell us about yourself and your spiritual journey"
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#F8F8FF]">Location</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="bg-black/40 border-[#7878FF]/40 text-[#F8F8FF] placeholder:text-[#C0C0C0]/50 focus-visible:ring-[#7878FF]/50 focus-visible:border-[#7878FF]" 
                  placeholder="City, Country"
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#F8F8FF]">Website</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="url" 
                  className="bg-black/40 border-[#7878FF]/40 text-[#F8F8FF] placeholder:text-[#C0C0C0]/50 focus-visible:ring-[#7878FF]/50 focus-visible:border-[#7878FF]" 
                  placeholder="https://your-website.com"
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[#7878FF] hover:bg-[#7878FF]/90 text-white"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
