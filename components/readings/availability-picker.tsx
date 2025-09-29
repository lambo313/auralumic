import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useReadingBooking } from "@/hooks/use-reading-booking";

interface AvailabilityPickerProps {
  readerId: string;
  duration: number;
  onTimeSelected: (date: Date) => void;
  onCancel: () => void;
}

export function AvailabilityPicker({
  readerId,
  duration,
  onTimeSelected,
  onCancel,
}: AvailabilityPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const { checkAvailability, isLoading } = useReadingBooking();

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDate(date);
    const slots = await checkAvailability(readerId, date, duration);
    setAvailableSlots(slots);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4">
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 2))}
            className="rounded-md border"
          />

          {selectedDate && availableSlots.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.toISOString()}
                  variant="outline"
                  onClick={() => onTimeSelected(slot)}
                  className="text-sm"
                >
                  {slot.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Button>
              ))}
            </div>
          )}

          {selectedDate && availableSlots.length === 0 && !isLoading && (
            <p className="text-center text-muted-foreground">
              No available slots for this date
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end space-x-2 p-4">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
