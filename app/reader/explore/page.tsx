"use client";

import { ClientConnect } from "@/components/clients";
import { withSafeRendering } from "@/components/ui/with-safe-rendering";

function ReaderExplorePage() {
  return (
    <main className="container py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Explore Clients</h1>
        <p className="text-muted-foreground">
          Discover clients seeking readings and suggest personalized sessions based on their current status and needs.
        </p>
      </div>

      <ClientConnect />
    </main>
  );
}

export default withSafeRendering(ReaderExplorePage);