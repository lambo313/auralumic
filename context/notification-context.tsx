"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { notificationService } from '@/services/api';
import { pusherClient } from '@/lib/pusher';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';

import type { Notification as NotificationType, NotificationData } from '@/types';

export type Notification = NotificationType;

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data?.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(current => 
        Array.isArray(current) 
          ? current.map(notification => 
              notification.id === id 
                ? { ...notification, isRead: true }
                : notification
            )
          : []
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(current => 
        Array.isArray(current) 
          ? current.map(notification => ({
              ...notification,
              isRead: true
            }))
          : []
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    refreshNotifications();
    
    // Set up real-time updates with Pusher
    const channel = pusherClient.subscribe(`user-${user.id}`);
    
    channel.bind('notification', (notification: Notification) => {
      setNotifications(current => Array.isArray(current) ? [notification, ...current] : [notification]);
      
      // Show toast for new notifications
      toast({
        title: notification.title,
        description: notification.message,
        duration: 5000,
      });
    });

    return () => {
      pusherClient.unsubscribe(`user-${user.id}`);
    };
  }, [user]);
  // Calculate unread count from the guaranteed array
  const unreadCount = Array.isArray(notifications) 
    ? notifications.filter(n => !n.isRead).length 
    : 0;

  // Show loading state
  if (isLoading) {
    return null;
  }

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead,
        refreshNotifications,
        isLoading
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
