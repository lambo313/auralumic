"use client";

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { AvailabilityPicker } from "./availability-picker"
import { useReadingBooking } from "@/hooks/use-reading-booking"

const readingRequestSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(200),
  description: z.string().min(1, "Description is required"),
  duration: z.number().min(15).max(120),
});

type ReadingRequestData = z.infer<typeof readingRequestSchema>;

interface ReadingRequestFormProps {
  readerId: string;
  readerName: string;
  onSubmit: (data: ReadingRequestData) => void;
  onCancel: () => void;
  defaultValues?: Partial<ReadingRequestData>;
}

const durations = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
]

export function ReadingRequestForm({
  readerId,
  readerName,
  onSubmit,
  onCancel,
}: ReadingRequestFormProps) {
  const [step, setStep] = useState<"details" | "scheduling">("details");
  const { createReading, isLoading } = useReadingBooking();
  const [formData, setFormData] = useState<ReadingRequestData | null>(null);

  const form = useForm<ReadingRequestData>({
    resolver: zodResolver(readingRequestSchema),
    defaultValues: {
      topic: "",
      description: "",
      duration: 30,
    },
  });

  const handleDetailsSubmit = (data: ReadingRequestData) => {
    onSubmit(data);
  };

  const handleTimeSelected = async (scheduledDate: Date) => {
    if (!formData) return;

    try {
      await createReading({
        readerId,
        ...formData,
        scheduledDate,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      onSubmit(formData);
    } catch (error) {
      setStep("details");
    }
  };

  if (step === "scheduling") {
    return (
      <AvailabilityPicker
        readerId={readerId}
        duration={formData?.duration || 30}
        onTimeSelected={handleTimeSelected}
        onCancel={() => setStep("details")}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Reading from {readerName}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleDetailsSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What would you like to discuss?"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a brief topic for your reading
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide more details about what you'd like to explore in this reading..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The more detail you provide, the better prepared your reader will be
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reading duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {durations.map((duration) => (
                        <SelectItem key={duration.value} value={duration.value}>
                          {duration.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose how long you&apos;d like your reading to be
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Next: Select Time"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
