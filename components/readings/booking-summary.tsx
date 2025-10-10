import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ReadingRequest } from "@/types"

interface BookingSummaryProps {
  bookingData: ReadingRequest
  readerName: string
  onConfirm: () => void
  onBack: () => void
  isLoading: boolean
}

export function BookingSummary({
  bookingData,
  readerName,
  onConfirm,
  onBack,
  isLoading,
}: BookingSummaryProps) {
  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div>
          <h3 className="font-semibold mb-2">Reading Details</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Reader</dt>
              <dd>{readerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Topic</dt>
              <dd>{bookingData.topic}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Duration</dt>
              <dd>{bookingData.duration} minutes</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Date & Time</dt>
              <dd>
                {bookingData.scheduledDate ? new Date(bookingData.scheduledDate).toLocaleString(undefined, {
                  dateStyle: "full",
                  timeStyle: "short",
                }) : 'Not scheduled'}
              </dd>
            </div>
          </dl>
        </div>

        {bookingData.description && (
          <div>
            <h3 className="font-semibold mb-2">Additional Details</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {bookingData.description}
            </p>
          </div>
        )}

        <div>
          <h3 className="font-semibold mb-2">Payment</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Credit Cost</dt>
              <dd>{bookingData.creditCost} credits</dd>
            </div>
          </dl>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onConfirm} disabled={isLoading}>
          {isLoading ? "Confirming..." : "Confirm Booking"}
        </Button>
      </CardFooter>
    </Card>
  )
}
