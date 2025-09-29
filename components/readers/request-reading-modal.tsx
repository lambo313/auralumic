"use client";

import { useState } from "react";
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
import { ReadingRequest } from "@/types/readings";
import type { Reader } from "@/types/index";
import { User, Clock, CreditCard, MessageCircle, Calendar as CalendarIcon, Star } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RequestReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reader: Reader | null;
  onRequestReading?: (request: ReadingRequest) => Promise<void>;
}

const readingTypes = [
  { value: "tarot", label: "Tarot Reading", duration: [15, 30, 45, 60], baseCredits: 25 },
  { value: "astrology", label: "Astrology Reading", duration: [30, 45, 60, 90], baseCredits: 35 },
  { value: "numerology", label: "Numerology Reading", duration: [20, 30, 45], baseCredits: 20 },
  { value: "oracle", label: "Oracle Card Reading", duration: [15, 30, 45], baseCredits: 20 },
  { value: "palmistry", label: "Palm Reading", duration: [20, 30, 45], baseCredits: 25 },
  { value: "mediumship", label: "Mediumship Session", duration: [30, 45, 60], baseCredits: 40 },
  { value: "energy", label: "Energy Reading", duration: [30, 45, 60], baseCredits: 30 },
  { value: "chakra", label: "Chakra Alignment", duration: [45, 60, 90], baseCredits: 35 }
];

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
];

export function RequestReadingModal({ isOpen, onClose, reader, onRequestReading }: RequestReadingModalProps) {
  const [formData, setFormData] = useState({
    readingType: "",
    topic: "",
    description: "",
    duration: "",
    scheduledDate: undefined as Date | undefined,
    scheduledTime: "",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        topic: formData.topic,
        duration: parseInt(formData.duration),
        creditCost: creditCost,
        description: formData.description,
        scheduledDate: scheduledFor,
        timeZone: formData.timeZone,
        status: 'pending'
      };

      await onRequestReading(readingRequest);

      // Reset form and close modal
      setFormData({
        readingType: "",
        topic: "",
        description: "",
        duration: "",
        scheduledDate: undefined,
        scheduledTime: "",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
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
                <AvatarImage src={reader.avatarUrl} alt={reader.username} />
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
                  <span className="ml-1 text-sm">{reader.rating?.toFixed(1)}</span>
                  <span className="ml-1 text-sm text-muted-foreground">({reader.reviewCount})</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <Badge variant={reader.isVerified ? "default" : "secondary"}>
                  {reader.isVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </div>
          
          {reader.tagline && (
            <div className="pl-15">
              <p className="text-sm text-muted-foreground italic">
                "{reader.tagline}"
              </p>
            </div>
          )}

          {reader.specialties && reader.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {reader.specialties.map((specialty, index) => (
                <Badge key={index} variant="outline">
                  {specialty}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reading Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Reading Type *</Label>
            <Select 
              value={formData.readingType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, readingType: value, duration: "" }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reading type" />
              </SelectTrigger>
              <SelectContent>
                {readingTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">Reading Topic *</Label>
            <Input
              id="topic"
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="e.g., Love & Relationships, Career Path, Spiritual Guidance"
              required
            />
          </div>

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
                      disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
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
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Time zone: {formData.timeZone}. Leave blank for immediate/flexible scheduling.
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
            <Button type="submit" disabled={isSubmitting || creditCost === 0}>
              {isSubmitting ? "Submitting..." : `Request Reading (${creditCost} Credits)`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}