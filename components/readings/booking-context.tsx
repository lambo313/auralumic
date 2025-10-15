import type { ReadingRequest } from "@/types"

interface BookingContextValue {
  step: number
  bookingData: ReadingRequest
  selectedReaderId: string | null
  isLoading: boolean
  setStep: (step: number) => void
  updateBookingData: (data: Partial<ReadingRequest>) => void
  setSelectedReaderId: (id: string | null) => void
  setIsLoading: (loading: boolean) => void
}

const INITIAL_BOOKING_DATA: ReadingRequest = {
  readerId: "",
  topic: "",
  duration: 30,
  creditCost: 0,
  description: "",
  readingOption: {
    type: 'video_message',
    basePrice: 0,
    timeSpan: {
      duration: 30,
      label: '30 minutes',
      multiplier: 1,
    },
    finalPrice: 0,
  },
  scheduledDate: undefined,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  status: "instant_queue",
}

const DEFAULT_CONTEXT_VALUE: BookingContextValue = {
  step: 0,
  bookingData: INITIAL_BOOKING_DATA,
  selectedReaderId: null,
  isLoading: false,
  setStep: () => {},
  updateBookingData: () => {},
  setSelectedReaderId: () => {},
  setIsLoading: () => {},
}

import { createContext, useContext, useState, ReactNode } from "react"

export const BookingContext = createContext<BookingContextValue>(DEFAULT_CONTEXT_VALUE)

interface BookingProviderProps {
  children: ReactNode
}

export function BookingProvider({ children }: BookingProviderProps) {
  const [step, setStep] = useState(0)
  const [bookingData, setBookingData] = useState<ReadingRequest>(INITIAL_BOOKING_DATA)
  const [selectedReaderId, setSelectedReaderId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const updateBookingData = (data: Partial<ReadingRequest>) => {
    setBookingData((prev: ReadingRequest) => ({ ...prev, ...data }))
  }

  return (
    <BookingContext.Provider
      value={{
        step,
        bookingData,
        selectedReaderId,
        isLoading,
        setStep,
        updateBookingData,
        setSelectedReaderId,
        setIsLoading,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider")
  }
  return context
}
