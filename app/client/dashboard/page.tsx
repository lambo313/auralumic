"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { withSafeRendering } from "@/components/ui/with-safe-rendering";
import { ClientStatsDashboard } from "@/components/profile/client-stats-dashboard";

function ClientDashboardPage() {
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

  return (
    <main className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Client Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your readings and account activity
        </p>
      </div>
      <Separator />
      <ClientStatsDashboard user={user} />
    </main>
  );
}

export default withSafeRendering(ClientDashboardPage);