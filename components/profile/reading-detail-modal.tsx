"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format } from 'date-fns'

export function ReadingDetailModal({
  reading,
  open,
  onOpenChange,
}: {
  reading: any | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!reading) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reading Details</DialogTitle>
          <DialogDescription>
            Details for the pending reading
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <div className="text-sm text-muted-foreground">Client</div>
            <div className="font-medium">{reading.clientUsername ?? reading.clientId}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="font-medium">{reading.status}</div>
          </div>

          {reading.scheduledDate && (
            <div>
              <div className="text-sm text-muted-foreground">Scheduled</div>
              <div className="font-medium">{new Date(reading.scheduledDate).toLocaleString()}</div>
            </div>
          )}

          {reading.readingOption?.finalPrice != null && (
            <div>
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="font-medium">{reading.readingOption.finalPrice} credits</div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ReadingDetailModal
