"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReadingRequest } from "@/types/readings";
import type { Reader, WeeklySchedule } from "@/types/index";
import { User, Clock, CreditCard, MessageCircle, Calendar as CalendarIcon, Star, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RequestReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reader: Reader | null;
  onRequestReading?: (request: ReadingRequest) => Promise<void>;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ReadingType {
  value: string;
  label: string;
  duration: number[];
  baseCredits: number;
}

// Default duration and credit configurations for different reading types
const readingTypeDefaults: Record<string, { duration: number[], baseCredits: number }> = {
  tarot: { duration: [15, 30, 45, 60], baseCredits: 25 },
  astrology: { duration: [30, 45, 60, 90], baseCredits: 35 },
  numerology: { duration: [20, 30, 45], baseCredits: 20 },
  oracle: { duration: [15, 30, 45], baseCredits: 20 },
  palmistry: { duration: [20, 30, 45], baseCredits: 25 },
  mediumship: { duration: [30, 45, 60], baseCredits: 40 },
  energy: { duration: [30, 45, 60], baseCredits: 30 },
  chakra: { duration: [45, 60, 90], baseCredits: 35 },
  // Default fallback for any categories not in this list
  default: { duration: [15, 30, 45, 60], baseCredits: 25 }
};

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
];

// Helper functions for schedule management
const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const formatTimeTo12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const getAvailableTimeSlotsForDay = (
  date: Date, 
  schedule: WeeklySchedule, 
  duration: number = 30
): string[] => {
  const dayOfWeek = date.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek] as keyof WeeklySchedule;
  
  const daySchedule = schedule[dayName];
  if (!daySchedule || daySchedule.length === 0) {
    return [];
  }

  const availableSlots: string[] = [];
  
  // Generate slots for each available time period in the day
  daySchedule.forEach(period => {
    const startMinutes = parseTimeToMinutes(period.start);
    const endMinutes = parseTimeToMinutes(period.end);
    
    // Generate 30-minute intervals within this period
    for (let currentMinutes = startMinutes; currentMinutes + duration <= endMinutes; currentMinutes += 30) {
      availableSlots.push(minutesToTime(currentMinutes));
    }
  });
  
  return availableSlots.sort();
};

const isDateAvailable = (date: Date, schedule: WeeklySchedule): boolean => {
  const dayOfWeek = date.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek] as keyof WeeklySchedule;
  
  const daySchedule = schedule[dayName];
  return daySchedule && daySchedule.length > 0;
};

export function RequestReadingModal({ isOpen, onClose, reader, onRequestReading }: RequestReadingModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [readingTypes, setReadingTypes] = useState<ReadingType[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    readingType: "",
    description: "",
    duration: "",
    scheduledDate: undefined as Date | undefined,
    scheduledTime: "",
    timeZone: reader?.availability?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      setCategoriesError(null);
      
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        setCategories(data.categories || []);
        
        // Transform categories into reading types with duration/credit configurations
        const transformedReadingTypes: ReadingType[] = data.categories.map((category: Category) => {
          const defaults = readingTypeDefaults[category.id] || readingTypeDefaults.default;
          return {
            value: category.id,
            label: category.name,
            duration: defaults.duration,
            baseCredits: defaults.baseCredits
          };
        });
        
        setReadingTypes(transformedReadingTypes);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoriesError('Failed to load reading types. Please try again.');
        // Fallback to empty array if fetch fails
        setCategories([]);
        setReadingTypes([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Update available time slots when date changes
  useEffect(() => {
    if (formData.scheduledDate && reader?.availability?.schedule) {
      const slots = getAvailableTimeSlotsForDay(
        formData.scheduledDate, 
        reader.availability.schedule,
        formData.duration ? parseInt(formData.duration) : 30
      );
      setAvailableTimeSlots(slots);
      
      // Clear selected time if it's not available for the new date
      if (formData.scheduledTime && !slots.includes(formData.scheduledTime)) {
        setFormData(prev => ({ ...prev, scheduledTime: "" }));
      }
    } else {
      setAvailableTimeSlots([]);
    }
  }, [formData.scheduledDate, formData.duration, reader?.availability?.schedule]);

  const selectedType = readingTypes.find(type => type.value === formData.readingType);
  
  // Calculate credit cost based on type and duration
  const calculateCredits = () => {
    if (!selectedType || !formData.duration) return 0;
    const duration = parseInt(formData.duration);
    const baseRate = selectedType.baseCredits;
    return Math.round((duration / 30) * baseRate);
  };

  const creditCost = calculateCredits();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reader || !onRequestReading) return;

    setIsSubmitting(true);
    try {
      // Combine date and time for scheduled reading
      let scheduledFor: Date | null = null;
      if (formData.scheduledDate && formData.scheduledTime) {
        const [hours, minutes] = formData.scheduledTime.split(':').map(Number);
        scheduledFor = new Date(formData.scheduledDate);
        scheduledFor.setHours(hours, minutes, 0, 0);
      }

      // Create the reading request
      const readingRequest: ReadingRequest = {
        readerId: reader.id,
        topic: formData.readingType,
        duration: parseInt(formData.duration),
        creditCost: creditCost,
        description: formData.description,
        scheduledDate: scheduledFor || undefined,
        timeZone: formData.timeZone,
        status: 'pending'
      };

      await onRequestReading(readingRequest);

      // Reset form and close modal
      setFormData({
        readingType: "",
        description: "",
        duration: "",
        scheduledDate: undefined,
        scheduledTime: "",
        timeZone: reader?.availability?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      onClose();
    } catch (error) {
      console.error("Error submitting reading request:", error);
      alert("Failed to submit reading request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!reader) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Reading</DialogTitle>
        </DialogHeader>

        {/* Reader Summary */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={reader.profileImage} alt={reader.username} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              {reader.isOnline && (
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{reader.username}</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm">{reader.stats.averageRating?.toFixed(1)}</span>
                  <span className="ml-1 text-sm text-muted-foreground">({reader.reviews.length})</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <Badge variant={reader.isApproved ? "default" : "secondary"}>
                  {reader.isApproved ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </div>
          
          {reader.tagline && (
            <div className="pl-15">
              <p className="text-sm text-muted-foreground italic">
                &quot;{reader.tagline}&quot;
              </p>
            </div>
          )}

          {reader.attributes.abilities && reader.attributes.abilities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {reader.attributes.abilities.map((ability, index) => (
                <Badge key={index} variant="outline">
                  {ability}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reading Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Reading Type *</Label>
            {isLoadingCategories ? (
              <div className="flex items-center justify-center h-10 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading reading types...</span>
              </div>
            ) : categoriesError ? (
              <div className="p-3 border border-red-200 rounded-md bg-red-50">
                <p className="text-sm text-red-600">{categoriesError}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1 text-red-600 hover:text-red-700"
                  onClick={() => {
                    // Trigger a refetch by closing and reopening the modal
                    window.location.reload();
                  }}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <Select 
                value={formData.readingType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, readingType: value, duration: "" }))}
                disabled={readingTypes.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={readingTypes.length === 0 ? "No reading types available" : "Select reading type"} />
                </SelectTrigger>
                <SelectContent>
                  {readingTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Duration */}
          {selectedType && (
            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Select 
                value={formData.duration} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {selectedType.duration.map((duration) => (
                    <SelectItem key={duration} value={duration.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {duration} minutes
                        </div>
                        <span className="text-muted-foreground text-sm ml-4">
                          {Math.round((duration / 30) * selectedType.baseCredits)} credits
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">What would you like to explore? *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your situation and what guidance you're seeking..."
              className="min-h-20"
              required
            />
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <Label>Preferred Schedule (Optional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Picker */}
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduledDate ? format(formData.scheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.scheduledDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, scheduledDate: date }))}
                      disabled={(date) => {
                        // Disable past dates
                        if (date < new Date()) return true;
                        // Disable dates where reader is not available
                        if (reader?.availability?.schedule && !isDateAvailable(date, reader.availability.schedule)) {
                          return true;
                        }
                        return false;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker */}
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Select 
                  value={formData.scheduledTime} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, scheduledTime: value }))}
                  disabled={!formData.scheduledDate || availableTimeSlots.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formData.scheduledDate 
                        ? "Select date first" 
                        : availableTimeSlots.length === 0 
                        ? "No available times" 
                        : "Select time"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-60">
                      {availableTimeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {formatTimeTo12Hour(time)}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
                {formData.scheduledDate && availableTimeSlots.length === 0 && (
                  <p className="text-sm text-muted-foreground text-red-500">
                    No available time slots for this date. Please select another date.
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Time zone: {formData.timeZone}</span>
              {reader?.availability?.instantBooking && (
                <Badge variant="secondary" className="text-xs">
                  Instant Booking Available
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formData.scheduledDate && formData.scheduledTime 
                ? `Reading scheduled for ${format(formData.scheduledDate, "PPP")} at ${formatTimeTo12Hour(formData.scheduledTime)} (${formData.timeZone})`
                : "Leave blank for immediate/flexible scheduling."
              }
            </p>
          </div>

          {/* Credit Cost Display */}
          {creditCost > 0 && (
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="font-medium">Total Cost</span>
                </div>
                <div className="text-lg font-semibold text-primary">
                  {creditCost} Credits
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {formData.duration} minutes at {selectedType?.baseCredits} credits per 30 minutes
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || creditCost === 0 || isLoadingCategories || !!categoriesError}
            >
              {isSubmitting ? "Submitting..." : `Request Reading (${creditCost} Credits)`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}