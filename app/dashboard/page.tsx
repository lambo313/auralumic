"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { withSafeRendering } from "@/components/ui/with-safe-rendering";
import { ClientStatsDashboard } from "../../components/profile/client-stats-dashboard";
import { ReaderStatsDashboard } from "../../components/profile/reader-stats-dashboard";

function DashboardPage() {
  const { user, role } = useAuth();

  if (!user) {
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

  // This component will redirect users to role-specific dashboards
  // The layout component handles the redirection logic
  return (
    <main className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Redirecting...</h1>
        <p className="text-sm text-muted-foreground">
          Taking you to your dashboard...
        </p>
      </div>
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </main>
  );
}

export default withSafeRendering(DashboardPage);
