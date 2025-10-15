"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useReaderStatus, type ReaderStatus } from "@/hooks/use-reader-status";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReaderStatusToggleProps {
  variant?: "full" | "compact";
  className?: string;
}

const statusConfig = {
  available: {
    label: "Available",
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    darkBg: "dark:bg-green-900/20",
    darkText: "dark:text-green-300",
    borderColor: "border-green-200 dark:border-green-800"
  },
  busy: {
    label: "Busy",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    darkBg: "dark:bg-yellow-900/20",
    darkText: "dark:text-yellow-300",
    borderColor: "border-yellow-200 dark:border-yellow-800"
  },
  offline: {
    label: "Offline",
    color: "bg-gray-500",
    textColor: "text-gray-700",
    bgColor: "bg-gray-50",
    darkBg: "dark:bg-gray-900/20",
    darkText: "dark:text-gray-300",
    borderColor: "border-gray-200 dark:border-gray-800"
  }
};

export function ReaderStatusToggle({ variant = "full", className }: ReaderStatusToggleProps) {
  const { status, loading, updateStatus } = useReaderStatus();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ReaderStatus | null>(null);

  const handleStatusChange = (newStatus: ReaderStatus) => {
    if (newStatus === status) return;
    
    setPendingStatus(newStatus);
    setShowDialog(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;

    try {
      await updateStatus(pendingStatus);
      toast({
        title: "Status Updated",
        description: `Your status has been changed to ${statusConfig[pendingStatus].label.toLowerCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowDialog(false);
      setPendingStatus(null);
    }
  };

  const cancelStatusChange = () => {
    setShowDialog(false);
    setPendingStatus(null);
  };

  const currentConfig = statusConfig[status];

  if (variant === "compact") {
    return (
      <>
        <div className={cn("flex items-center gap-2", className)}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatusChange(status === 'available' ? 'busy' : 'available')}
            disabled={loading}
            className={cn(
              "h-8 px-3 transition-all duration-200",
              currentConfig.bgColor,
              currentConfig.darkBg,
              currentConfig.borderColor,
              "border hover:scale-105"
            )}
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Circle className={cn("h-3 w-3 mr-1", currentConfig.color)} />
            )}
            <span className={cn("text-xs font-medium", currentConfig.textColor, currentConfig.darkText)}>
              {currentConfig.label}
            </span>
          </Button>
        </div>

        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change Status</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to change your status to {pendingStatus && statusConfig[pendingStatus].label.toLowerCase()}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelStatusChange}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmStatusChange}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <div className={cn("flex flex-col gap-2", className)}>
        <div className="text-sm font-medium text-muted-foreground">Status</div>
        <div className="flex gap-2">
          {Object.entries(statusConfig).map(([statusKey, config]) => (
            <Button
              key={statusKey}
              variant={status === statusKey ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange(statusKey as ReaderStatus)}
              disabled={loading}
              className={cn(
                "transition-all duration-200",
                status === statusKey && config.bgColor,
                status === statusKey && config.darkBg,
                status === statusKey && config.borderColor,
                status === statusKey && "border"
              )}
            >
              {loading && status === statusKey ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Circle className={cn("h-3 w-3 mr-1", config.color)} />
              )}
              <span className={cn(
                "text-xs font-medium",
                status === statusKey ? config.textColor + " " + config.darkText : ""
              )}>
                {config.label}
              </span>
            </Button>
          ))}
        </div>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change your status to {pendingStatus && statusConfig[pendingStatus].label.toLowerCase()}?
              {pendingStatus === 'offline' && " This will make you unavailable for new reading requests."}
              {pendingStatus === 'busy' && " This will show you as busy to clients."}
              {pendingStatus === 'available' && " This will make you available for new reading requests."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelStatusChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Change to {pendingStatus && statusConfig[pendingStatus].label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}