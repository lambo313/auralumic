"use client";

import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('client' | 'reader' | 'admin')[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { user, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/sign-in');
        return;
      }

      if (allowedRoles && !allowedRoles.includes(role || 'client')) {
        router.push('/');
        return;
      }

      // Check onboarding status
      async function checkOnboardingStatus() {
        try {
          const response = await fetch('/api/users/me');
          const data = await response.json();
          
          // Check both Clerk metadata and database status
          if (!user?.publicMetadata?.hasCompletedOnboarding && !data.hasCompletedOnboarding) {
            router.push('/onboarding');
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
        }
      }
      
      checkOnboardingStatus();
    }
  }, [isLoaded, isSignedIn, router, role, user?.publicMetadata?.hasCompletedOnboarding, allowedRoles, user?.id]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
