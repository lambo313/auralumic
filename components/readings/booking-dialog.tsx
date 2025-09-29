import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Steps } from "@/components/ui/steps"
import { ReadingRequestForm } from "./reading-request-form"
import { AvailabilityPicker } from "./availability-picker"
import { BookingSummary } from "./booking-summary"
import { useReadingBooking } from "@/hooks/use-reading-booking"
import type { ReadingRequest } from "@/types"

interface BookingDialogProps {
  readerId: string
  readerName: string
  isOpen: boolean
  onClose: () => void
}

const steps = [
  { title: "Reading Details", description: "Choose type and topic" },
  { title: "Select Time", description: "Pick available slot" },
  { title: "Review & Confirm", description: "Confirm booking details" }
]

export function BookingDialog({
  readerId,
  readerName,
  isOpen,
  onClose,
}: BookingDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [bookingData, setBookingData] = useState<Partial<ReadingRequest>>({
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
  const { createReading, isLoading, error } = useReadingBooking()
  const { toast } = useToast()

  const handleDetailsSubmit = (data: Partial<ReadingRequest>) => {
    setBookingData((prev) => ({ ...prev, ...data }))
    setCurrentStep(1)
  }

  const handleTimeSelected = (date: Date) => {
    setBookingData((prev) => ({
      ...prev,
      scheduledDate: date,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }))
    setCurrentStep(2)
  }

  const handleConfirm = async () => {
    try {
      if (!bookingData.scheduledDate || !bookingData.topic || !bookingData.duration) {
        throw new Error("Missing required booking information")
      }

      await createReading({
        readerId,
        topic: bookingData.topic,
        description: bookingData.description || "",
        duration: bookingData.duration,
        scheduledDate: bookingData.scheduledDate,
        timeZone: bookingData.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      })

      toast({
        title: "Booking Confirmed",
        description: "Your reading request has been sent to the reader.",
      })

      onClose()
    } catch (err) {
      toast({
        title: "Booking Failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ReadingRequestForm
            readerId={readerId}
            readerName={readerName}
            onSubmit={handleDetailsSubmit}
            onCancel={onClose}
            defaultValues={bookingData}
          />
        )
      case 1:
        return (
          <AvailabilityPicker
            readerId={readerId}
            duration={bookingData.duration || 30}
            onTimeSelected={handleTimeSelected}
            onCancel={handleBack}
          />
        )
      case 2:
        return (
          <BookingSummary
            bookingData={bookingData as ReadingRequest}
            readerName={readerName}
            onConfirm={handleConfirm}
            onBack={handleBack}
            isLoading={isLoading}
          />
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Book a Reading</DialogTitle>
        </DialogHeader>

        <Steps
          steps={steps}
          currentStep={currentStep}
          className="mb-6"
        />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {renderStep()}
      </DialogContent>
    </Dialog>
  )
}
