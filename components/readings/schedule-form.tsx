"use client";
import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface TimeSlot {
  time: string
  available: boolean
}

export function ScheduleForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  // Fetch available time slots when date is selected
  async function fetchTimeSlots(date: Date) {
    try {
      const response = await fetch(`/api/readings/availability?date=${format(date, "yyyy-MM-dd")}`)
      const data = await response.json()
      setTimeSlots(data.timeSlots)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load available time slots",
        variant: "destructive",
      })
    }
  }

  async function onSubmit() {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Please select both date and time",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const bookingDetails = JSON.parse(sessionStorage.getItem("bookingDetails") || "{}")
      const scheduledDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        ...selectedTime.split(":").map(Number)
      )

      const fullBookingDetails = {
        ...bookingDetails,
        scheduledDate: scheduledDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }

      sessionStorage.setItem("bookingDetails", JSON.stringify(fullBookingDetails))
      router.push("/dashboard/readings/request/payment")
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-medium">Select Date</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date)
                  if (date) fetchTimeSlots(date)
                }}
                className="rounded-md border"
                disabled={(date) => date < new Date()}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Select Time</h3>
              <Select
                disabled={!selectedDate || timeSlots.length === 0}
                onValueChange={setSelectedTime}
                value={selectedTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem
                      key={slot.time}
                      value={slot.time}
                      disabled={!slot.available}
                    >
                      {slot.time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedDate && timeSlots.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No available time slots for this date
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || !selectedDate || !selectedTime}
        >
          {isSubmitting ? "Processing..." : "Continue to Payment"}
        </Button>
      </div>
    </div>
  )
}
