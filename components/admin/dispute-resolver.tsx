"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { adminService } from "@/services/api";

interface Dispute {
  id: string;
  readingId: string;
  clientId: string;
  readerId: string;
  reason: string;
  status: string;
  createdAt: string;
  resolution?: string;
}

export function DisputeResolver() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getDisputes();
      if (!Array.isArray(data)) {
        throw new Error("Invalid disputes response");
      }
      const normalized = data.map((d: any) => ({ ...d, createdAt: String(d.createdAt) }));
      setDisputes(normalized);
    } catch (err) {
      console.error("Error loading disputes:", err);
      toast({ title: "Error", description: "Failed to load disputes.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  async function handleResolve(disputeId: string) {
    if (!resolution.trim()) {
      toast({ title: "Error", description: "Please provide a resolution", variant: "destructive" });
      return;
    }

    try {
      setResolvingId(disputeId);
      await adminService.resolveDispute(disputeId, resolution);
      toast({ title: "Success", description: "Dispute resolved successfully" });
      setDisputes((prev) => prev.filter((d) => d.id !== disputeId));
      setResolution("");
      setSelectedDispute(null);
    } catch (err) {
      console.error("Error resolving dispute:", err);
      toast({ title: "Error", description: "Failed to resolve dispute", variant: "destructive" });
    } finally {
      setResolvingId(null);
      // reload to ensure server state is reflected
      loadDisputes();
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <ScrollArea className="">
        {disputes.length === 0 ? (
          <p className="text-center text-muted-foreground">No open disputes</p>
        ) : (
          disputes.map((dispute) => {
            const isOpen = String(dispute.status).toUpperCase() === "OPEN";
            return (
              <Card key={dispute.id} className="mb-4">
                <CardHeader>
                  <CardTitle className="text-lg">Reading #{dispute.readingId}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold">Reason:</p>
                      <p className="text-muted-foreground">{dispute.reason}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {new Date(dispute.createdAt).toLocaleString()}
                      </div>
                      <Button onClick={() => setSelectedDispute(dispute)} variant="outline" disabled={!isOpen}>
                        Resolve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </ScrollArea>

      {selectedDispute && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resolve Dispute</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea placeholder="Enter resolution..." value={resolution} onChange={(e) => setResolution(e.target.value)} rows={4} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDispute(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleResolve(selectedDispute.id)} disabled={!!resolvingId}>
                  Submit Resolution
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
