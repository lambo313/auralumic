"use client";

import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { withSafeRendering } from "@/components/ui/with-safe-rendering";
import { ReaderStatsDashboard } from "@/components/profile/reader-stats-dashboard";
import { readerService } from "@/services/reader-service";
import type { Reader } from "@/types";

function ReaderDashboardPage() {
  const { user: clerkUser, role } = useAuth();
  const [readerProfile, setReaderProfile] = useState<Reader | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReaderData() {
      if (!clerkUser || !role) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // If user's role is reader, try to fetch their reader profile
        if (role === 'reader') {
          try {
            console.log("Fetching reader profile for user:", clerkUser.id, "with role:", role);
            const readerData = await readerService.getReaderById(clerkUser.id);
            console.log("Reader profile fetched successfully:", readerData);
            setReaderProfile(readerData);
          } catch (readerError) {
            console.error("Reader profile fetch error:", readerError);
            console.log("Reader profile not found, user may not be approved yet");
            // This is fine - the user might be a reader but not have an approved profile yet
          }
        }
      } catch (err) {
        console.error("Error fetching reader data:", err);
        setError("Failed to load reader data");
      } finally {
        setLoading(false);
      }
    }

    fetchReaderData();
  }, [clerkUser, role]);

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

  if (error) {
    return (
      <main className="container py-6">
        <Card className="p-6">
          <p className="text-center text-red-500">
            {error}
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main className="container py-6">
      <div className="mb-6">
        <h1 className="page-title">Reader Dashboard</h1>
        <p className="page-description">
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