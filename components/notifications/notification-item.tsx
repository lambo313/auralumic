import { useState } from "react";
import { format } from "date-fns";
import { useNotifications, Notification } from "@/context/notification-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Bell,
  Calendar,
  Check,
  MessageSquare,
  Star,
  X,
} from "lucide-react";

interface NotificationItemProps {
  notification: Notification;
}

const notificationIcons: Record<string, React.ReactNode> = {
  reading_request: <Calendar className="h-4 w-4" />,
  reading_accepted: <Check className="h-4 w-4" />,
  reading_declined: <X className="h-4 w-4" />,
  reading_completed: <Star className="h-4 w-4" />,
  new_message: <MessageSquare className="h-4 w-4" />,
  alert: <AlertCircle className="h-4 w-4" />,
  default: <Bell className="h-4 w-4" />,
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { markAsRead } = useNotifications();

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <Card
      className={cn(
        "flex items-start gap-4 p-4 transition-colors cursor-pointer relative",
        {
          "bg-muted": !notification.isRead,
          "hover:bg-muted/50": true,
        }
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div
        className={cn("rounded-full p-2", {
          "bg-primary text-primary-foreground": !notification.isRead,
          "bg-muted text-muted-foreground": notification.isRead,
        })}
      >
        {notificationIcons[notification.type] || notificationIcons.default}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">
          {notification.title}
        </p>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </div>
      {isHovered && !notification.isRead && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2"
          onClick={(e) => {
            e.stopPropagation();
            markAsRead(notification.id);
          }}
        >
          Mark as read
        </Button>
      )}
    </Card>
  );
}
