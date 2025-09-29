 "use client";
import { useAuth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { BookingForm } from "@/components/readings/booking-form"
import { useRouter } from "next/navigation"

export default function ClientRequestReadingPage() {
  const router = useRouter()
  const { userId, isLoaded } = useAuth()
  
  if (isLoaded && !userId) {
    redirect("/sign-in")
  }

  const handleSubmit = async (values: {
    topic: string;
    duration: string;
    scheduledDate: string;
    description?: string;
  }) => {
    // Store the booking details in the session or state management
    // You might want to use React Context, Redux, or URL parameters
    // For now, we'll pass them as URL search params
    const searchParams = new URLSearchParams({
      topic: values.topic,
      duration: values.duration,
      date: values.scheduledDate,
      ...(values.description && { description: values.description })
    })
    
    router.push(`/client/reading/request/payment?${searchParams.toString()}`)
  }

  return (
    <div className="container max-w-3xl py-6 space-y-6">
      <h1 className="text-3xl font-bold">Request Reading</h1>
      <BookingForm onSubmit={handleSubmit} />
    </div>
  )
}