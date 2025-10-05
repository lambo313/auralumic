'use client';

import { useNotifications } from '@/context/notification-context';
import { NotificationList } from '@/components/notifications/notification-list';
import { Button } from '@/components/ui/button';

export default function ReaderNotificationsPage() {
  const { notifications, markAllAsRead, isLoading } = useNotifications();

  return (
    <main className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-description">
            Stay updated on your reading requests and client interactions
          </p>
        </div>
        {!isLoading && Array.isArray(notifications) && notifications.some(n => !n.isRead) && (
          <Button
            variant="outline"
            onClick={() => markAllAsRead()}
          >
            Mark all as read
          </Button>
        )}
      </div>

      <NotificationList notifications={notifications} />
    </main>
  );
}