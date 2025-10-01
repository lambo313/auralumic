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
import { ClientStatusSummary, SuggestedReading } from "@/types";
import { User, Clock, CreditCard, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SuggestReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientStatusSummary | null;
  statusId: string;
}

const readingTypes = [
  { value: "tarot", label: "Tarot Reading", duration: [15, 30, 45, 60] },
  { value: "astrology", label: "Astrology Reading", duration: [30, 45, 60, 90] },
  { value: "numerology", label: "Numerology Reading", duration: [20, 30, 45] },
  { value: "oracle", label: "Oracle Card Reading", duration: [15, 30, 45] },
  { value: "palmistry", label: "Palm Reading", duration: [20, 30, 45] },
  { value: "mediumship", label: "Mediumship Session", duration: [30, 45, 60] },
  { value: "energy", label: "Energy Reading", duration: [30, 45, 60] },
  { value: "chakra", label: "Chakra Alignment", duration: [45, 60, 90] }
];

export function SuggestReadingModal({ isOpen, onClose, client, statusId }: SuggestReadingModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    readingType: "",
    duration: "",
    price: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedType = readingTypes.find(type => type.value === formData.readingType);
  const currentStatus = client?.currentStatus;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !statusId) return;

    setIsSubmitting(true);
    try {
      // Create the suggested reading
      const newSuggestedReading: SuggestedReading = {
        id: `suggestion-${Date.now()}`,
        statusId,
        readerId: "current-reader", // This would come from auth context
        readerName: "Current Reader", // This would come from auth context  
        title: formData.title,
        description: formData.description,
        suggestedType: formData.readingType,
        estimatedDuration: parseInt(formData.duration),
        suggestedPrice: formData.price ? parseInt(formData.price) : undefined,
        message: formData.message,
        isAccepted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Here you would typically send this to your API
      console.log("Suggested Reading:", newSuggestedReading);

      // Reset form and close modal
      setFormData({
        title: "",
        description: "",
        readingType: "",
        duration: "",
        price: "",
        message: ""
      });
      onClose();

      // Show success message (you could use a toast here)
      alert("Reading suggestion sent successfully!");
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      alert("Failed to send suggestion. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'love':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'career':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'spiritual':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'general':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!client || !currentStatus) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Suggest a Reading</DialogTitle>
        </DialogHeader>

        {/* Client Status Summary */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={client.avatarUrl} alt={client.name} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{client.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getCategoryColor(currentStatus.category)}>
                  {currentStatus.category || 'General'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Posted {formatDistanceToNow(new Date(currentStatus.createdAt))} ago
                </span>
              </div>
            </div>
          </div>
          <div className="pl-13">
            <p className="text-sm text-muted-foreground italic">
              &quot;{currentStatus.content}&quot;
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reading Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Reading Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Love & Relationship Clarity Reading"
              required
            />
          </div>

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
              <Label htmlFor="duration">Duration (minutes) *</Label>
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
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {duration} minutes
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Reading Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this reading will cover and how it will help the client..."
              className="min-h-20"
              required
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Suggested Price (Credits)</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                min="1"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="Optional"
                className="pl-10"
              />
            </div>
          </div>

          {/* Personal Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Personal Message</Label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Add a personal note to the client about why this reading would be perfect for them..."
                className="min-h-20 pl-10"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Suggestion"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}