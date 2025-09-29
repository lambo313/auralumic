import { useNotifications } from "@/context/notification-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { NotificationItem } from "./notification-item";
import { Badge } from "@/components/ui/badge";

export function NotificationCenter() {
  const { notifications, unreadCount, markAllAsRead, isLoading } = useNotifications();
  const hasNotifications = Array.isArray(notifications) && notifications.length > 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Notifications</SheetTitle>
          {hasNotifications && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
            >
              Mark all as read
            </Button>
          )}
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-5rem)] pb-8">
          <div className="space-y-4 py-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-4">
                Loading notifications...
              </p>
            ) : !Array.isArray(notifications) || notifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No notifications
              </p>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
