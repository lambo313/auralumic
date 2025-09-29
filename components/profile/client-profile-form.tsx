"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useToast } from "@/components/ui/use-toast";

const clientProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().optional(),
});

type ClientProfileFormValues = z.infer<typeof clientProfileSchema>;

interface ClientProfileFormProps {
  user: {
    id: string;
    name?: string;
    location?: string;
    role?: string;
  };
}

export function ClientProfileForm({ user: initialData }: ClientProfileFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClientProfileFormValues>({
    resolver: zodResolver(clientProfileSchema),
    defaultValues: {
      name: initialData.name || "",
      location: initialData.location || "",
    },
  });

  async function onSubmit(data: ClientProfileFormValues) {
    try {
      setIsSubmitting(true);
      // TODO: API call to update client profile
      toast({
        title: "Profile updated",
        description: "Your client profile has been updated successfully.",
      });
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your name" />
              </FormControl>
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
                <Input {...field} placeholder="City, Country" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
