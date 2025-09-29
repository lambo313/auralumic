"use client";

import { ClientCard } from "./client-card";
import { ClientStatusSummary } from "@/types";

interface ClientListProps {
  clients: ClientStatusSummary[];
  onSuggestReading: (clientId: string, statusId: string) => void;
}

export function ClientList({ clients, onSuggestReading }: ClientListProps) {
  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-sm">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No clients found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria to find clients seeking guidance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          onSuggestReading={onSuggestReading}
        />
      ))}
    </div>
  );
}