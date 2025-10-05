"use client";

import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { withSafeRendering } from "@/components/ui/with-safe-rendering";
import { ClientStatsDashboard } from "@/components/profile/client-stats-dashboard";
import { userService } from "@/services/api";
import type { User } from "@/types";

function ClientDashboardPage() {
  const { user: clerkUser, role } = useAuth();
  const [user, setUser] = useState<User | null>(null);
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
        <h1 className="page-title">Client Dashboard</h1>
        <p className="page-description">
          Overview of your readings and account activity
        </p>
      </div>
      <Separator />
      <div className="mt-6">
        <ClientStatsDashboard user={user} />
      </div>
    </main>
  );
}

export default withSafeRendering(ClientDashboardPage);