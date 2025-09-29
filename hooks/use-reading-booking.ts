import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";

interface ReadingResponse {
  id: string;
  readerId: string;
  userId: string;
  topic: string;
  description: string;
  duration: number;
  scheduledDate: string;
  timeZone: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface UseReadingBooking {
  isLoading: boolean;
  error: string | null;
  checkAvailability: (readerId: string, date: Date, duration: number) => Promise<Date[]>;
  createReading: (data: {
    readerId: string;
    topic: string;
    description: string;
    duration: number;
    scheduledDate: Date;
    timeZone: string;
  }) => Promise<ReadingResponse>;
}

export function useReadingBooking(): UseReadingBooking {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const checkAvailability = async (readerId: string, date: Date, duration: number) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        readerId,
        date: date.toISOString(),
        duration: duration.toString(),
      });

      const response = await fetch(`/api/readings/availability?${params}`);
      if (!response.ok) {
        throw new Error("Failed to check availability");
      }

      const data = await response.json();
      return data.availableSlots.map((slot: string) => new Date(slot));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check reader availability",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createReading = async (data: {
    readerId: string;
    topic: string;
    description: string;
    duration: number;
    scheduledDate: Date;
    timeZone: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/readings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          scheduledDate: data.scheduledDate.toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: "Reading request created successfully",
      });

      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create reading request",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    checkAvailability,
    createReading,
  };
}
