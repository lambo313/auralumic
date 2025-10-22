"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Reading } from "@/types/readings";
import type { Reader } from "@/types/index";
import { User, Clock, CreditCard, Calendar as CalendarIcon, Star, Loader2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface ReadingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reading: Reading;
  userRole: "reader" | "client";
  currentCredits: number;
  onCreditsUpdated?: (newBalance: number) => void;
  onReadingUpdated?: () => void;
}

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

const durationOptions = [15, 30, 45, 60, 90, 120];

export function ReadingDetailsModal({
  isOpen,
  onClose,
  reading,
  userRole,
  currentCredits,
  onCreditsUpdated,
  onReadingUpdated
}: ReadingDetailsModalProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [reader, setReader] = useState<Reader | null>(null);
  const [loadingReader, setLoadingReader] = useState(true);
  const [readerLink, setReaderLink] = useState<string>("");
  
  const [editedData, setEditedData] = useState({
    question: reading.question || "",
    duration: reading.readingOption.timeSpan.duration,
    readingOption: reading.readingOption.type,
    scheduledDate: reading.scheduledDate ? new Date(reading.scheduledDate) : undefined,
  });

  // Fetch reader data
  useEffect(() => {
    const fetchReader = async () => {
      if (!reading.readerId) return;
      
      try {
        setLoadingReader(true);
        const response = await fetch(`/api/readers/${reading.readerId}`);
        if (response.ok) {
          const data = await response.json();
          setReader(data);
        }
      } catch (error) {
        console.error("Error fetching reader:", error);
      } finally {
        setLoadingReader(false);
      }
    };

    if (isOpen) {
      fetchReader();
    }
  }, [isOpen, reading.readerId]);

  const isPending = ['instant_queue', 'scheduled', 'message_queue'].includes(reading.status);
  const canEdit = userRole === "client" && isPending;

  // Debug logging
  useEffect(() => {
    console.log('ReadingDetailsModal - userRole:', userRole);
    console.log('ReadingDetailsModal - reading.status:', reading.status);
    console.log('ReadingDetailsModal - isPending:', isPending);
    console.log('ReadingDetailsModal - canEdit:', canEdit);
  }, [userRole, reading.status, isPending, canEdit]);

  const selectedOption = readingOptions.find(opt => opt.value === editedData.readingOption);
  
  // Calculate credit cost based on edited values
  const calculateNewCredits = () => {
    if (!selectedOption) return reading.credits;
    
    // Base credits calculation (assuming 25 credits per 30 minutes as default)
    const baseCreditsPerHalfHour = 25;
    const baseCredits = Math.round((editedData.duration / 30) * baseCreditsPerHalfHour);
    return Math.round(baseCredits * selectedOption.multiplier);
  };

  const newCreditCost = calculateNewCredits();
  const creditDifference = newCreditCost - reading.credits;
  const hasChanges = 
    editedData.question !== (reading.question || "") ||
    editedData.duration !== reading.readingOption.timeSpan.duration ||
    editedData.readingOption !== reading.readingOption.type ||
    (editedData.scheduledDate?.getTime() !== (reading.scheduledDate ? new Date(reading.scheduledDate).getTime() : undefined));

  const handleUpdate = async () => {
    if (!hasChanges) {
      toast({
        title: "No changes detected",
        description: "Please make changes before updating.",
        variant: "destructive"
      });
      return;
    }

    // Check if user has enough credits for increased cost
    if (creditDifference > 0 && currentCredits < creditDifference) {
      toast({
        title: "Insufficient credits",
        description: `You need ${creditDifference} more credits to make this change.`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/readings/${reading.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: editedData.question,
          readingOption: {
            type: editedData.readingOption,
            basePrice: Math.round((editedData.duration / 30) * 25),
            timeSpan: {
              duration: editedData.duration,
              label: `${editedData.duration} minutes`,
              multiplier: selectedOption!.multiplier
            },
            finalPrice: newCreditCost
          },
          scheduledDate: editedData.scheduledDate?.toISOString(),
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update reading");
      }

      const data = await response.json();

      // Update credits if changed
      if (creditDifference !== 0 && onCreditsUpdated && data.creditBalance !== undefined) {
        onCreditsUpdated(data.creditBalance);
      }

      toast({
        title: "Reading updated",
        description: creditDifference > 0 
          ? `${creditDifference} credits deducted for changes`
          : creditDifference < 0
          ? `${Math.abs(creditDifference)} credits refunded`
          : "Reading updated successfully"
      });

      setIsEditing(false);
      onReadingUpdated?.();
      onClose();
    } catch (error) {
      console.error("Error updating reading:", error);
      toast({
        title: "Error",
        description: "Failed to update reading. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setShowCancelDialog(false);
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/readings/${reading.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to cancel reading");
      }

      const data = await response.json();

      // Update credits with refund
      if (onCreditsUpdated && data.creditBalance !== undefined) {
        onCreditsUpdated(data.creditBalance);
      }

      toast({
        title: "Reading cancelled",
        description: `${reading.credits} credits have been refunded to your account.`
      });

      onReadingUpdated?.();
      onClose();
    } catch (error) {
      console.error("Error cancelling reading:", error);
      toast({
        title: "Error",
        description: "Failed to cancel reading. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mark as complete handler for reader
  const handleMarkComplete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/readings/${reading.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      if (!response.ok) {
        throw new Error("Failed to mark as complete");
      }
      toast({
        title: "Reading Completed",
        description: "The reading has been marked as complete and archived.",
      });
      onReadingUpdated?.();
      onClose();
    } catch (error) {
      console.error("Error marking as complete:", error);
      toast({
        title: "Error",
        description: "Failed to mark as complete. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaderAction = async () => {
    setIsSubmitting(true);
    try {
      // Use snake_case for status
      const updatedStatus = reading.status === "message_queue" ? "archived" : "in_progress";
      // If starting a reading, include readingLink if provided
      const body: { status: string; readingLink?: string } = { status: updatedStatus };
      if (updatedStatus === "in_progress" && readerLink) {
        body.readingLink = readerLink;
      }
      const response = await fetch(`/api/readings/${reading.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to update reading");
      }

      toast({
        title: updatedStatus === "in_progress" ? "Reading Started" : "Reading Submitted",
        description: updatedStatus === "in_progress"
          ? "The reading has been marked as in progress."
          : "The reading has been submitted and archived.",
      });

      onReadingUpdated?.();
      onClose();
    } catch (error) {
      console.error("Error updating reading:", error);
      toast({
        title: "Error",
        description: "Failed to update reading. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'instant_queue':
        return { label: 'Instant Queue', color: 'bg-orange-500', icon: '⚡' };
      case 'scheduled':
        return { label: 'Scheduled', color: 'bg-blue-500', icon: '📅' };
      case 'message_queue':
        return { label: 'Message Queue', color: 'bg-purple-500', icon: '🎥' };
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-blue-500', icon: '🔄' };
      case 'completed':
        return { label: 'Completed', color: 'bg-green-500', icon: '✅' };
      case 'disputed':
        return { label: 'Disputed', color: 'bg-yellow-500', icon: '⚠️' };
      case 'refunded':
        return { label: 'Refunded', color: 'bg-gray-500', icon: '↩️' };
      default:
        return { label: status, color: 'bg-gray-500', icon: '❓' };
    }
  };

  const statusInfo = getStatusInfo(reading.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mt-4">
          <DialogTitle className="flex items-center justify-between">
            <span>Reading Details</span>
            <Badge className="bg-muted/30 text-muted-foreground border-color-muted">
              {statusInfo.icon} {statusInfo.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Reader/Client Info */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              {loadingReader ? (
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ) : (
                <>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={reader?.profileImage} alt={reader?.username} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{reader?.username || "Unknown Reader"}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {reader?.stats && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span>{reader.stats.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                      {reader?.isOnline && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Online
                        </Badge>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reader Link Input for Reader Role */}
          {userRole === "reader" && (reading.status === "instant_queue" || reading.status === "scheduled" || reading.status === "message_queue") && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Provide Link</Label>
              <Textarea
                value={readerLink}
                onChange={(e) => setReaderLink(e.target.value)}
                placeholder="Enter the link to the call, pre-recorded video, or live video."
                className="mt-1 min-h-20"
              />
            </div>
          )}

          {/* Display readingLink when status is inProgress */}
          {reading.status === "in_progress" && reading.readingLink && (
            <div className="bg-muted/30 rounded-lg p-4">
              <Label className="text-sm font-medium text-muted-foreground">Reading Link</Label>
              <a
                href={reading.readingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {reading.readingLink}
              </a>
            </div>
          )}

          {/* Reading Information */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Topic</Label>
              <p className="text-base font-medium mt-1">{reading.topic}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Question/Description</Label>
              {userRole === "client" && isEditing ? (
                <Textarea
                  value={editedData.question}
                  onChange={(e) => setEditedData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Describe your situation..."
                  className="mt-1 min-h-20"
                />
              ) : (
                <p className="text-sm mt-1">{reading.question || "No description provided"}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                {userRole === "client" && isEditing ? (
                  <Select
                    value={editedData.duration.toString()}
                    onValueChange={(value) => setEditedData(prev => ({ ...prev, duration: parseInt(value) }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((duration) => (
                        <SelectItem key={duration} value={duration.toString()}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {duration} minutes
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm mt-1 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {reading.readingOption.timeSpan.duration} minutes
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Reading Format</Label>
                {userRole === "client" && isEditing ? (
                  <Select
                    value={editedData.readingOption}
                    onValueChange={(value) => setEditedData(prev => ({ 
                      ...prev, 
                      readingOption: value as 'phone_call' | 'video_message' | 'live_video'
                    }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {readingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm mt-1 flex items-center gap-2">
                    <span>{readingOptions.find(opt => opt.value === reading.readingOption.type)?.icon}</span>
                    {readingOptions.find(opt => opt.value === reading.readingOption.type)?.label}
                  </p>
                )}
              </div>
            </div>

            {reading.scheduledDate && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Scheduled For</Label>
                <p className="text-sm mt-1 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(new Date(reading.scheduledDate), "PPP 'at' p")}
                </p>
              </div>
            )}

            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="font-medium">Credit Cost</span>
                </div>
                <div className="text-right">
                  {isEditing && hasChanges ? (
                    <>
                      <div className="text-lg font-semibold text-primary">
                        {newCreditCost} Credits
                      </div>
                      {creditDifference !== 0 && (
                        <div className={cn(
                          "text-sm",
                          creditDifference > 0 ? "text-red-600" : "text-green-600"
                        )}>
                          {creditDifference > 0 ? '+' : ''}{creditDifference} credits
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-lg font-semibold text-primary">
                      {reading.credits} Credits
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isEditing && creditDifference > 0 && (
              <AlertDialog>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You will be charged an additional {creditDifference} credits for these changes.
                    Your remaining balance will be {currentCredits - creditDifference} credits.
                  </AlertDescription>
                </Alert>
              </AlertDialog>
            )}

            {isEditing && creditDifference < 0 && (
              <AlertDialog>
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    You will receive a refund of {Math.abs(creditDifference)} credits for these changes.
                    Your new balance will be {currentCredits + Math.abs(creditDifference)} credits.
                  </AlertDescription>
                </Alert>
              </AlertDialog>
            )}

            <div className="text-xs text-muted-foreground space-y-1 pt-2">
              <p>Created: {format(new Date(reading.createdAt), "PPP 'at' p")}</p>
              <p>Last updated: {format(new Date(reading.updatedAt), "PPP 'at' p")}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {userRole === "reader" && (
            <>
              {reading.status === "instant_queue" || reading.status === "scheduled" ? (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={isSubmitting}
                  >
                    Cancel Reading
                  </Button>
                  <div className="flex-1" />
                  <Button
                    onClick={handleReaderAction}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting Reading...
                      </>
                    ) : (
                      "Start Reading"
                    )}
                  </Button>
                </>
              ) : reading.status === "message_queue" ? (
                <Button
                  onClick={handleReaderAction}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Reading...
                    </>
                  ) : (
                    "Submit Reading"
                  )}
                </Button>
              ) : reading.status === "in_progress" ? (
                <Button
                  onClick={handleMarkComplete}
                  disabled={isSubmitting}
                  variant="default"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Marking as Complete...
                    </>
                  ) : (
                    "Mark as Complete"
                  )}
                </Button>
              ) : (
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              )}
            </>
          )}

          {userRole === "client" && !isEditing && (
            <>
              {canEdit ? (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={isSubmitting}
                  >
                    Cancel Reading
                  </Button>
                  <div className="flex-1" />
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Details
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              )}
            </>
          )}

          {userRole === "client" && isEditing && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditedData({
                    question: reading.question || "",
                    duration: reading.readingOption.timeSpan.duration,
                    readingOption: reading.readingOption.type,
                    scheduledDate: reading.scheduledDate ? new Date(reading.scheduledDate) : undefined,
                  });
                }}
                disabled={isSubmitting}
              >
                Cancel Edit
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={isSubmitting || !hasChanges || (creditDifference > 0 && currentCredits < creditDifference)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  `Update Reading${creditDifference !== 0 ? ` (${creditDifference > 0 ? '+' : ''}${creditDifference} credits)` : ''}`
                )}
              </Button>
            </>
          )}
        </DialogFooter>

        {/* Cancel Reading Confirmation Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Reading?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will cancel the reading. The client will be refunded {reading.credits} credits. Please confirm if you want to proceed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Keep Reading</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleCancel}
                disabled={isSubmitting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Reading"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
