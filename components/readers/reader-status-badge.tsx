"use client";

import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReaderStatusBadgeProps {
  status: 'available' | 'busy' | 'offline' | 'pending' | 'approved' | 'rejected' | 'suspended';
  isOnline: boolean;
  variant?: "default" | "dot" | "compact";
  className?: string;
}

const statusConfig = {
  available: {
    label: "Available",
    color: "bg-green-500",
    bgColor: "bg-green-100 text-green-800",
    darkBg: "dark:bg-green-900 dark:text-green-300"
  },
  busy: {
    label: "Busy",
    color: "bg-yellow-500",
    bgColor: "bg-yellow-100 text-yellow-800",
    darkBg: "dark:bg-yellow-900 dark:text-yellow-300"
  },
  offline: {
    label: "Offline",
    color: "bg-gray-500",
    bgColor: "bg-gray-100 text-gray-800",
    darkBg: "dark:bg-gray-900 dark:text-gray-300"
  },
  pending: {
    label: "Pending",
    color: "bg-orange-500",
    bgColor: "bg-orange-100 text-orange-800",
    darkBg: "dark:bg-orange-900 dark:text-orange-300"
  },
  approved: {
    label: "Approved",
    color: "bg-blue-500",
    bgColor: "bg-blue-100 text-blue-800",
    darkBg: "dark:bg-blue-900 dark:text-blue-300"
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-500",
    bgColor: "bg-red-100 text-red-800",
    darkBg: "dark:bg-red-900 dark:text-red-300"
  },
  suspended: {
    label: "Suspended",
    color: "bg-red-600",
    bgColor: "bg-red-100 text-red-800",
    darkBg: "dark:bg-red-900 dark:text-red-300"
  }
};

export function ReaderStatusBadge({ status, isOnline, variant = "default", className }: ReaderStatusBadgeProps) {
  // For availability status, show based on isOnline and status
  let displayStatus = status;
  if (['available', 'busy'].includes(status) && !isOnline) {
    displayStatus = 'offline';
  }

  const config = statusConfig[displayStatus];

  if (variant === "dot") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Circle className={cn("h-2 w-2", config.color, isOnline && ['available', 'busy'].includes(status) ? "animate-pulse" : "")} />
        <span className="text-xs text-muted-foreground">{config.label}</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        config.bgColor,
        config.darkBg,
        className
      )}>
        <Circle className={cn("h-2 w-2", config.color, isOnline && ['available', 'busy'].includes(status) ? "animate-pulse" : "")} />
        {config.label}
      </div>
    );
  }

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "flex items-center gap-1",
        config.bgColor,
        config.darkBg,
        className
      )}
    >
      <Circle className={cn("h-2 w-2", config.color, isOnline && ['available', 'busy'].includes(status) ? "animate-pulse" : "")} />
      {config.label}
    </Badge>
  );
}