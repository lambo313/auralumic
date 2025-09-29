"use client";
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { PaymentForm } from "@/components/payments/payment-form"

interface BookingDetails {
  topic: string
  duration: number
  question?: string
  scheduledDate: string
  timeZone: string
}

export function PaymentConfirmation() {
  const router = useRouter()
  const { toast } = useToast()
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const details = sessionStorage.getItem("bookingDetails")
    if (details) {
      setBookingDetails(JSON.parse(details))
    } else {
      // Navigate back based on current route
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        if (pathname.includes('/client/')) {
          router.push('/client/reading/request');
        } else if (pathname.includes('/reader/')) {
          router.push('/reader/reading/request');
        } else {
          router.push('/dashboard/reading/request'); // fallback
        }
      } else {
        router.push('/dashboard/reading/request'); // fallback
      }
    }
  }, [router])

  async function onPaymentSuccess() {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/readings/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingDetails),
      })

      if (!response.ok) throw new Error("Failed to create reading request")

      sessionStorage.removeItem("bookingDetails")
      toast({
        title: "Success",
        description: "Your reading request has been submitted",
      })
      // Navigate to readings based on current route
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        if (pathname.includes('/client/')) {
          router.push('/client/readings');
        } else if (pathname.includes('/reader/')) {
          router.push('/reader/readings');
        } else {
          router.push('/dashboard/readings'); // fallback
        }
      } else {
        router.push('/dashboard/readings'); // fallback
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create reading request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!bookingDetails) {
    return null
  }

  // Calculate cost based on duration
  const costPerMinute = 2 // 2 credits per minute
  const totalCost = bookingDetails.duration * costPerMinute

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 text-sm">
            <div className="grid grid-cols-2">
              <p className="text-muted-foreground">Topic</p>
              <p>{bookingDetails.topic}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-muted-foreground">Duration</p>
              <p>{bookingDetails.duration} minutes</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-muted-foreground">Scheduled Date</p>
              <p>{format(new Date(bookingDetails.scheduledDate), "PPP 'at' p")}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-muted-foreground">Time Zone</p>
              <p>{bookingDetails.timeZone}</p>
            </div>
            {bookingDetails.question && (
              <div className="grid grid-cols-2">
                <p className="text-muted-foreground">Question</p>
                <p>{bookingDetails.question}</p>
              </div>
            )}
            <div className="grid grid-cols-2 font-medium">
              <p>Total Cost</p>
              <p>{totalCost} credits</p>
            </div>
          </div>

          <PaymentForm
            amount={totalCost}
            onSuccess={onPaymentSuccess}
            onError={(error) => {
              toast({
                title: "Payment Error",
                description: error.message,
                variant: "destructive",
              })
            }}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Back
        </Button>
      </div>
    </div>
  )
}
