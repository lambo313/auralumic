"use client";
import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { StarRating } from "@/components/ui/star-rating"

const formSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, "Please provide a review comment").max(1000),
})

type FormValues = z.infer<typeof formSchema>

interface ReviewFormProps {
  readingId: string
}

export function ReviewForm({ readingId }: ReviewFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/readings/${readingId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error("Failed to submit review")

      toast({
        title: "Success",
        description: "Your review has been submitted",
      })
      // Navigate back based on current route
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        if (pathname.includes('/client/')) {
          router.push(`/client/reading/${readingId}`);
        } else if (pathname.includes('/reader/')) {
          router.push(`/reader/reading/${readingId}`);
        } else {
          router.push(`/dashboard/reading/${readingId}`); // fallback
        }
      } else {
        router.push(`/dashboard/reading/${readingId}`); // fallback
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <StarRating
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience with this reading..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const pathname = window.location.pathname;
                if (pathname.includes('/client/')) {
                  router.push(`/client/reading/${readingId}`);
                } else if (pathname.includes('/reader/')) {
                  router.push(`/reader/reading/${readingId}`);
                } else {
                  router.push(`/dashboard/reading/${readingId}`); // fallback
                }
              } else {
                router.push(`/dashboard/reading/${readingId}`); // fallback
              }
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
