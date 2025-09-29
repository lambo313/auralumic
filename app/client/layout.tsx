'use client';

import { MainLayout } from "@/components/layout/main-layout";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/hooks/use-auth";
import { NotificationProvider, useNotifications } from "@/context/notification-context";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

function ClientLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isLoaded } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect non-client users away from client routes
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
    
    if (role === "reader") {
      setIsRedirecting(true);
      router.replace("/reader/dashboard");
      return;
    }
    
    // At this point, role should be "client" or we allow access
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

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <NotificationProvider>
        <ClientLayoutInner>{children}</ClientLayoutInner>
      </NotificationProvider>
    </AuthGuard>
  );
}