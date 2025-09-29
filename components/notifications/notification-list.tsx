'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistance } from 'date-fns';
import type { Notification } from '@/types';

interface NotificationListProps {
  notifications?: Notification[];
}

function NotificationIcon({ type }: { type: Notification['type'] }) {
  const iconMap: Record<Notification['type'], React.ReactElement> = {
    reading_accepted: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    ),
    reading_declined: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18"/>
        <path d="m6 6 12 12"/>
      </svg>
    ),
    reading_completed: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <path d="m9 11 3 3L22 4"/>
      </svg>
    ),
    review_request: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    new_comment: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    post_liked: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    dispute_filed: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/>
        <path d="M11 12 5.12 2.2"/>
        <path d="m13 12 5.88-9.8"/>
        <path d="M8 7h8"/>
      </svg>
    ),
  };

  return (
    <div className={`rounded-full p-2 ${!iconMap[type] ? 'bg-muted' : getTypeColor(type)}`}>
      {iconMap[type] || (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      )}
    </div>
  );
}

function getTypeColor(type: Notification['type']): string {
  switch (type) {
    case 'reading_accepted':
      return 'bg-green-500/20 text-green-500';
    case 'reading_declined':
      return 'bg-red-500/20 text-red-500';
    case 'reading_completed':
      return 'bg-blue-500/20 text-blue-500';
    case 'review_request':
      return 'bg-purple-500/20 text-purple-500';
    case 'new_comment':
      return 'bg-orange-500/20 text-orange-500';
    case 'post_liked':
      return 'bg-pink-500/20 text-pink-500';
    case 'dispute_filed':
      return 'bg-red-600/20 text-red-600';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function NotificationCard({ notification }: { notification: Notification }) {
  const actionMap: Record<Notification['type'], string> = {
    reading_accepted: 'View Reading',
    reading_declined: 'Find Another Reader',
    reading_completed: 'Leave Review',
    review_request: 'View Review',
    new_comment: 'View Comment',
    post_liked: 'View Post',
    dispute_filed: 'View Dispute',
  };

  const getActionUrl = (notification: Notification): string => {
    const { type, relatedId } = notification;
    
    if (relatedId) {
      switch (type) {
        case 'reading_accepted':
        case 'reading_declined':
        case 'reading_completed':
          return `/dashboard/readings/${relatedId}`;
        case 'review_request':
          return `/dashboard/readings/${relatedId}#review`;
        case 'new_comment':
          return `/dashboard/posts/${relatedId}`;
        case 'post_liked':
          return `/dashboard/posts/${relatedId}`;
        case 'dispute_filed':
          return `/dashboard/disputes/${relatedId}`;
      }
    }

    switch (type) {
      case 'reading_accepted':
      case 'reading_declined':
      case 'reading_completed':
        return '/dashboard/readings';
      default:
        return '/dashboard';
    }
  };

  return (
    <Card className={notification.isRead ? undefined : 'border-primary bg-primary/5'}>
      <CardContent className="flex items-start gap-4 p-4">
        <NotificationIcon type={notification.type} />
        <div className="flex-1 space-y-1">
          <p className="font-medium leading-none">{notification.title}</p>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistance(new Date(notification.createdAt), new Date(), { addSuffix: true })}
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <a href={getActionUrl(notification)}>{actionMap[notification.type]}</a>
        </Button>
      </CardContent>
    </Card>
  );
}

export function NotificationList({ notifications }: NotificationListProps) {
  if (!notifications || notifications.length === 0) {
    return (
      <Card className="">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No notifications yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
