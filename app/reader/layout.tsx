'use client';

import { MainLayout } from "@/components/layout/main-layout";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/hooks/use-auth";
import { NotificationProvider, useNotifications } from "@/context/notification-context";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

function ReaderLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isLoaded } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect non-reader users away from reader routes
  useEffect(() => {
    if (!isLoaded) return; // Wait for auth to load
    
    // Don't redirect if role is still being determined (null)
    if (role === null) {
      setIsRedirecting(false);
      return;
    }
    
    if (role === "admin") {
      setIsRedirecting(true);
      router.replace("/admin/dashboard");
      return;
    }
    
    if (role === "client") {
      setIsRedirecting(true);
      router.replace("/client/dashboard");
      return;
    }
    
    // At this point, role should be "reader" or we allow access
    setIsRedirecting(false);
  }, [role, isLoaded, router, pathname]);

  // Show loading state while auth is loading or redirecting
  if (!isLoaded || isRedirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout notifications={unreadCount}>
      {children}
    </MainLayout>
  );
}

export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <NotificationProvider>
        <ReaderLayoutInner>{children}</ReaderLayoutInner>
      </NotificationProvider>
    </AuthGuard>
  );
}