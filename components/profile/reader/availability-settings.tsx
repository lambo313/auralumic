"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  instantBooking: z.boolean(),
  weeklySchedule: z.array(
    z.object({
      day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
    })
  ),
  timeZone: z.string(),
  breaks: z.array(
    z.object({
      startTime: z.string(),
      endTime: z.string(),
      day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
    })
  ),
})

type FormValues = z.infer<typeof formSchema>

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const

export function AvailabilitySettings() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instantBooking: true,
      weeklySchedule: weekDays.map(day => ({
        day,
        enabled: true,
        startTime: "09:00",
        endTime: "17:00",
      })),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      breaks: [],
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true)
      await fetch("/api/reader/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      toast({
        title: "Availability updated",
        description: "Your availability settings have been saved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update availability. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
        <FormField
          control={form.control}
          name="instantBooking"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between">
              <div>
                <FormLabel>Instant Booking</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Allow clients to book readings without approval
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Weekly Schedule</h3>
          {weekDays.map((day, index) => (
            <div key={day} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`weeklySchedule.${index}.enabled`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>{day}</FormLabel>
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name={`weeklySchedule.${index}.startTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={!form.watch(`weeklySchedule.${index}.enabled`)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <span>to</span>
                <FormField
                  control={form.control}
                  name={`weeklySchedule.${index}.endTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={!form.watch(`weeklySchedule.${index}.enabled`)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  )
}
