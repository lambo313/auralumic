'use client';

import { MainLayout } from "@/components/layout/main-layout";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/hooks/use-auth";
import { NotificationProvider, useNotifications } from "@/context/notification-context";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isLoaded } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Auto-redirect users to their role-specific dashboards
  useEffect(() => {
    if (!isLoaded) return; // Wait for auth to load
    
    // Only redirect if we're on the root dashboard page to avoid unnecessary redirects
    if (pathname === "/dashboard") {
      // Don't redirect if role is still being determined (null)
      if (role === null) {
        setIsRedirecting(true); // Show loading state while role is being fetched
        return;
      }
      
      setIsRedirecting(true);
      
      // Redirect to role-specific dashboards
      if (role === "admin") {
        router.replace("/admin/dashboard");
        return;
      }
      
      if (role === "reader") {
        router.replace("/reader/dashboard");
        return;
      }
      
      if (role === "client") {
        router.replace("/client/dashboard");
        return;
      }
      
      // If role is empty string or unknown, default to client
      router.replace("/client/dashboard");
    } else {
      setIsRedirecting(false);
    }
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <NotificationProvider>
        <DashboardLayoutInner>{children}</DashboardLayoutInner>
      </NotificationProvider>
    </AuthGuard>
  );
}
