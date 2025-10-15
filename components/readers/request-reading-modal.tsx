"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { ReadingRequest, CreateReadingPayload } from "@/types/readings";
import type { Reader, WeeklySchedule } from "@/types/index";
import { User, Clock, CreditCard, MessageCircle, Calendar as CalendarIcon, Star, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { readingService } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface RequestReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reader: Reader | null;
  onRequestReading?: (request: ReadingRequest) => Promise<void>; // Optional - kept for backward compatibility
  client: { credits: number };
  onCreditsUpdated?: (newBalance: number) => void;
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

const readingOptions = [
  {
    value: 'phone_call',
    label: 'Phone Call',
    description: 'Live voice call reading',
    multiplier: 1.0,
    icon: '📞'
  },
  {
    value: 'video_message',
    label: 'Video Message',
    description: 'Pre-recorded video reading',
    multiplier: 0.8,
    icon: '🎥'
  },
  {
    value: 'live_video',
    label: 'Live Video',
    description: 'Live video call reading',
    multiplier: 1.2,
    icon: '📹'
  }
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
export function RequestReadingModal({ isOpen, onClose, reader, onRequestReading, client, onCreditsUpdated }: RequestReadingModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [readingTypes, setReadingTypes] = useState<ReadingType[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    readingType: "",
    readingOption: "",
    description: "",
    duration: "",
    queueType: "", // 'instant', 'scheduled', or 'message' - determined by reading option and user choice
    scheduledDate: undefined as Date | undefined,
    scheduledTime: "",
    timeZone: reader?.availability?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<ReadingRequest | null>(null);

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

  // Auto-set queue type based on reading option and reader capabilities
  useEffect(() => {
    if (formData.readingOption) {
      if (formData.readingOption === 'video_message') {
        setFormData(prev => ({ ...prev, queueType: 'message' }));
      } else if (['phone_call', 'live_video'].includes(formData.readingOption)) {
        // If reader doesn't have instant booking, auto-select scheduled
        if (!reader?.availability?.instantBooking) {
          setFormData(prev => ({ ...prev, queueType: 'scheduled' }));
        }
        // If reader has instant booking but no queue type is selected, don't auto-select
        // Let user choose between instant and scheduled
      }
    }
  }, [formData.readingOption, reader?.availability?.instantBooking]);

  const selectedType = readingTypes.find(type => type.value === formData.readingType);
  const selectedOption = readingOptions.find(option => option.value === formData.readingOption);
  
  // Determine queue type based on reading option and user choice
  const getQueueType = (): 'instant_queue' | 'scheduled' | 'message_queue' => {
    if (formData.readingOption === 'video_message') {
      return 'message_queue';
    }
    
    // For phone/video calls
    if (formData.readingOption && ['phone_call', 'live_video'].includes(formData.readingOption)) {
      // If reader doesn't have instant booking, always use scheduled
      if (!reader?.availability?.instantBooking) {
        return 'scheduled';
      }
      
      // If reader has instant booking, respect user's choice
      if (formData.queueType === 'scheduled' || (formData.scheduledDate && formData.scheduledTime)) {
        return 'scheduled';
      }
      
      if (formData.queueType === 'instant') {
        return 'instant_queue';
      }
    }
    
    return 'instant_queue';
  };
  
  const queueType = getQueueType();
  
  // Validation logic
  const isPhoneOrVideo = formData.readingOption && ['phone_call', 'live_video'].includes(formData.readingOption);
  const hasInstantBooking = reader?.availability?.instantBooking;
  
  // For phone/video calls:
  // - If reader has instant booking enabled: queue type selection is required
  // - If reader doesn't have instant booking: automatically use scheduled
  const isQueueTypeRequired = isPhoneOrVideo && hasInstantBooking;
  const isQueueTypeValid = !isQueueTypeRequired || formData.queueType || (!hasInstantBooking && isPhoneOrVideo);
  
  const isSchedulingRequired = formData.queueType === 'scheduled' || (isPhoneOrVideo && !hasInstantBooking);
  const isSchedulingValid = !isSchedulingRequired || (formData.scheduledDate && formData.scheduledTime);
  
  // Calculate credit cost based on type, duration, and reading option
  const calculateCredits = () => {
    if (!selectedType || !formData.duration || !selectedOption) return 0;
    const duration = parseInt(formData.duration);
    const baseRate = selectedType.baseCredits;
    const baseCredits = Math.round((duration / 30) * baseRate);
    return Math.round(baseCredits * selectedOption.multiplier);
  };

  const creditCost = calculateCredits();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reader) return;

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
      description: formData.description.trim() || 'General', // Keep for our interface
      question: formData.description.trim() || 'General',     // Add for API compatibility  
      duration: parseInt(formData.duration),
      readingOption: {
        type: formData.readingOption as 'phone_call' | 'video_message' | 'live_video',
        basePrice: Math.round((parseInt(formData.duration) / 30) * selectedType!.baseCredits),
        timeSpan: {
          duration: parseInt(formData.duration),
          label: `${formData.duration} minutes`,
          multiplier: selectedOption!.multiplier
        },
        finalPrice: creditCost
      },
      creditCost: creditCost,
      scheduledDate: scheduledFor ? scheduledFor.toISOString() : undefined, // Convert to string for API
      timeZone: formData.timeZone,
      status: queueType as 'instant_queue' | 'scheduled' | 'message_queue'
    };

    // Show confirmation dialog
    setPendingRequest(readingRequest);
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    if (!pendingRequest) return;

    setIsSubmitting(true);
    try {
      // Convert ReadingRequest (UI state) to CreateReadingPayload (API format)
      // ReadingRequest includes UI-only fields like description, duration, creditCost
      // CreateReadingPayload only includes what the API expects
      const payload: CreateReadingPayload = {
        readerId: pendingRequest.readerId,
        topic: pendingRequest.topic,
        question: pendingRequest.question,
        readingOption: pendingRequest.readingOption,
        status: pendingRequest.status,
        // Only include scheduledDate and timeZone for scheduled readings
        ...(pendingRequest.status === 'scheduled' && pendingRequest.scheduledDate && {
          scheduledDate: pendingRequest.scheduledDate,
          timeZone: pendingRequest.timeZone
        })
      };
      
      console.log('Sending payload to API:', JSON.stringify(payload, null, 2));
      
      const response = await readingService.createReading(payload);
      
      if (!response || response.error) {
        throw new Error(response?.error || 'Failed to create reading request');
      }

      // Update credits if callback is provided and we have a new balance
      if (onCreditsUpdated && response.creditBalance !== undefined) {
        onCreditsUpdated(response.creditBalance);
      }

      // Show success toast
      const queueMessages = {
        instant_queue: "Your instant reading request has been added to the queue",
        scheduled: "Your reading has been scheduled",
        message_queue: "Your video message request has been submitted"
      };
      
      toast({
        title: "Reading Request Submitted!",
        description: `${queueMessages[queueType]}. You'll be notified when ${reader?.username} responds.`,
      });

      // Reset form and close modal
      setFormData({
        readingType: "",
        readingOption: "",
        description: "",
        duration: "",
        queueType: "",
        scheduledDate: undefined,
        scheduledTime: "",
        timeZone: reader?.availability?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      setShowConfirmation(false);
      setPendingRequest(null);
      onClose();

      // Navigate to client readings page (use setTimeout to ensure modal closes first)
      setTimeout(() => {
        router.push('/client/readings');
      }, 100);
    } catch (error) {
      console.error("Error submitting reading request:", error);
      toast({
        title: "Error",
        description: "Failed to submit reading request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setPendingRequest(null);
  };

  if (!reader) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Reading</DialogTitle>
          <h4 className="text-sm text-primary">credits available: {client.credits}</h4>
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
          {reader.attributes.tools && reader.attributes.tools.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {reader.attributes.tools.map((tool, index) => (
          <Badge key={index} variant="outline">
            {tool}
          </Badge>
              ))}
            </div>
          )}
          {reader.attributes.style && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
          {reader.attributes.style}
              </Badge>
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
                          {Math.round((duration / 30) * selectedType.baseCredits)} base credits
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reading Option */}
          {selectedType && formData.duration && (
            <div className="space-y-2">
              <Label htmlFor="readingOption">Reading Format *</Label>
              <Select 
                value={formData.readingOption} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  readingOption: value,
                  queueType: value === 'video_message' ? 'message' : ''
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reading format" />
                </SelectTrigger>
                <SelectContent>
                  {readingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{option.icon}</span>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">{option.description}</div>
                        </div>
                        <div className="ml-auto text-sm text-muted-foreground">
                          {option.multiplier === 1 ? 'Standard rate' : 
                           option.multiplier < 1 ? `${Math.round((1 - option.multiplier) * 100)}% discount` :
                           `${Math.round((option.multiplier - 1) * 100)}% premium`}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Queue Type Selection for Phone Call and Live Video */}
          {formData.readingOption && ['phone_call', 'live_video'].includes(formData.readingOption) && (
            <div className="space-y-2">
              <Label>Booking Type *</Label>
              {reader?.availability?.instantBooking ? (
                // Show both instant and scheduled options when instant booking is enabled
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={formData.queueType === 'instant' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      queueType: 'instant',
                      scheduledDate: undefined,
                      scheduledTime: ''
                    }))}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <div className="text-lg">⚡</div>
                    <div className="font-medium">Instant Reading</div>
                    <div className="text-xs text-muted-foreground text-center">
                      Get connected immediately when reader is available
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant={formData.queueType === 'scheduled' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, queueType: 'scheduled' }))}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <div className="text-lg">📅</div>
                    <div className="font-medium">Schedule Reading</div>
                    <div className="text-xs text-muted-foreground text-center">
                      Book for a specific date and time
                    </div>
                  </Button>
                </div>
              ) : (
                // Show only scheduled option when instant booking is disabled
                <div className="w-full">
                  <Button
                    type="button"
                    variant={formData.queueType === 'scheduled' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, queueType: 'scheduled' }))}
                    className="w-full h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <div className="text-lg">📅</div>
                    <div className="font-medium">Schedule Reading</div>
                    <div className="text-xs text-muted-foreground text-center">
                      Book for a specific date and time
                    </div>
                  </Button>
                  <div className="text-xs text-muted-foreground mt-2 text-center">
                    This reader requires scheduled appointments for phone and video calls
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Auto-set message queue for video messages */}
          {formData.readingOption === 'video_message' && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <div className="text-lg">🎥</div>
                <div>
                  <div className="font-medium">Video Message Request</div>
                  <div className="text-sm text-blue-600 dark:text-blue-300">
                    Your request will be added to the message queue. The reader will create a personalized video response for you.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">What would you like to explore?</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your situation and what guidance you're seeking... (Default: General)"
              className="min-h-20"
            />
          </div>

          {/* Scheduling - Required for scheduled queue type */}
          {(formData.queueType === 'scheduled' || 
            (['phone_call', 'live_video'].includes(formData.readingOption) && !reader?.availability?.instantBooking)) && (
            <div className="space-y-4">
              <Label>
                {formData.queueType === 'scheduled' ? 'Schedule' : 'Preferred Schedule (Optional)'}
                {formData.queueType === 'scheduled' && <span className="text-red-500"> *</span>}
              </Label>
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
                  <PopoverContent className="w-auto p-0 max-w-md" align="center">
                    <Calendar
                      mode="single"
                      selected={formData.scheduledDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, scheduledDate: date }))}
                      className="rounded-md border shadow-lg scale-100 p-4 [&_button]:p-2 [&_th]:p-2 [&_td]:p-1"
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
          )}

          {/* Credit Cost Display */}
          {creditCost > 0 && selectedOption && (
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
              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                <p>
                  {formData.duration} minutes at {selectedType?.baseCredits} credits per 30 minutes
                </p>
                <p>
                  {selectedOption.label} format: {selectedOption.multiplier}x multiplier
                  {selectedOption.multiplier !== 1 && (
                    <span className="ml-2">
                      ({Math.round((parseInt(formData.duration) / 30) * selectedType!.baseCredits)} base × {selectedOption.multiplier})
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                isSubmitting || 
                creditCost === 0 || 
                isLoadingCategories || 
                !!categoriesError || 
                !formData.readingOption ||
                !isQueueTypeValid ||
                !isSchedulingValid
              }
            >
              {isSubmitting ? "Submitting..." : `Request Reading (${creditCost} Credits)`}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Confirmation Dialog */}
      {showConfirmation && pendingRequest && (
        <Dialog open={showConfirmation} onOpenChange={handleCancelConfirmation}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Reading Request</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={reader.profileImage} alt={reader.username} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{reader.username}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedType?.label} Reading
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Format:</span>
                  <span className="text-sm">{selectedOption?.icon} {selectedOption?.label}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Type:</span>
                  <span className="text-sm flex items-center gap-1">
                    {queueType === 'instant_queue' && (
                      <>
                        <span className="text-orange-600">⚡</span>
                        <span className="text-orange-600 font-medium">Instant Reading</span>
                      </>
                    )}
                    {queueType === 'scheduled' && (
                      <>
                        <span className="text-blue-600">📅</span>
                        <span className="text-blue-600 font-medium">Scheduled Reading</span>
                      </>
                    )}
                    {queueType === 'message_queue' && (
                      <>
                        <span className="text-purple-600">🔴</span>
                        <span className="text-purple-600 font-medium">Pre-Recorded Video</span>
                      </>
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Duration:</span>
                  <span className="text-sm">{formData.duration} minutes</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Description:</span>
                  <span className="text-sm text-right max-w-[60%] break-words" title={formData.description.trim() || 'General'}>
                    {(formData.description.trim() || 'General').length > 50 
                      ? `${(formData.description.trim() || 'General').substring(0, 50)}...`
                      : formData.description.trim() || 'General'
                    }
                  </span>
                </div>

                {pendingRequest.scheduledDate && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Scheduled:</span>
                    <span className="text-sm text-right">
                      {format(pendingRequest.scheduledDate, "PPP")} at {formatTimeTo12Hour(formData.scheduledTime)}
                    </span>
                  </div>
                )}

                {/* Queue-specific messaging */}
                {queueType === 'instant_queue' && (
                  <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                    <div className="flex items-start gap-2 text-orange-800 dark:text-orange-200">
                      <span className="text-base mt-0.5">⚡</span>
                      <div className="text-sm">
                        <div className="font-medium">Instant Reading Request</div>
                        <div className="text-orange-600 dark:text-orange-300 mt-1">
                          You&apos;ll be added to the instant queue. {reader.username} will connect with you as soon as they&apos;re available.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {queueType === 'scheduled' && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-start gap-2 text-blue-800 dark:text-blue-200">
                      <span className="text-base mt-0.5">📅</span>
                      <div className="text-sm">
                        <div className="font-medium">Scheduled Reading</div>
                        <div className="text-blue-600 dark:text-blue-300 mt-1">
                          {pendingRequest.scheduledDate 
                            ? `Your reading is scheduled for the selected date and time.`
                            : `${reader.username} will contact you to confirm a suitable time.`
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {queueType === 'message_queue' && (
                  <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                    <div className="flex items-start gap-2 text-purple-800 dark:text-purple-200">
                      <span className="text-base mt-0.5">🎥</span>
                      <div className="text-sm">
                        <div className="font-medium">Video Message Request</div>
                        <div className="text-purple-600 dark:text-purple-300 mt-1">
                          {reader.username} will create a personalized video response for you within their usual response time.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Cost:</span>
                    <span className="text-lg font-semibold text-primary">
                      {creditCost} Credits
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your remaining balance: {client.credits - creditCost} credits
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancelConfirmation}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting || client.credits < creditCost}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    `Confirm & Submit`
                  )}
                </Button>
              </div>

              {client.credits < creditCost && (
                <div className="text-sm text-red-600 text-center">
                  Insufficient credits. You need {creditCost - client.credits} more credits.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}