"use client";

import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { withSafeRendering } from "@/components/ui/with-safe-rendering";
import { ReaderStatsDashboard } from "@/components/profile/reader-stats-dashboard";
import { userService } from "@/services/api";
import { readerService } from "@/services/reader-service";
import type { User, Reader } from "@/types";

function ReaderDashboardPage() {
  const { user: clerkUser, role } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [readerProfile, setReaderProfile] = useState<Reader | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      if (!clerkUser) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const userData = await userService.getCurrentUser();
        setUser(userData);
        
        // If user is a reader, try to fetch their reader profile
        if (userData.role === 'reader') {
          try {
            const readerData = await readerService.getReaderById(userData.id);
            setReaderProfile(readerData);
          } catch (readerError) {
            console.log("Reader profile not found, user may not be approved yet");
            // This is fine - the user might be a reader but not have an approved profile yet
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [clerkUser]);

  if (!clerkUser) {
    return (
      <main className="container py-6">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            Please sign in to view your dashboard
          </p>
        </Card>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="container py-6">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            Loading dashboard...
          </p>
        </Card>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="container py-6">
        <Card className="p-6">
          <p className="text-center text-red-500">
            {error || "Failed to load user data"}
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reader Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your readings and performance
        </p>
      </div>
      <Separator />
      <div className="mt-6">
        {readerProfile ? (
          <ReaderStatsDashboard user={readerProfile} />
        ) : (
          <Card className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Reader Profile Pending</h3>
              <p className="text-muted-foreground mb-4">
                Your reader application is being reviewed or you haven&apos;t applied to become a reader yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Once approved, your reader statistics and performance data will appear here.
              </p>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}

export default withSafeRendering(ReaderDashboardPage);