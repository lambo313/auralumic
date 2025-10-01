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
  status: "OPEN" | "RESOLVED" | "CLOSED";
  createdAt: Date;
  resolution?: string;
}

export function DisputeResolver() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState("");
  const { toast } = useToast();

  const loadDisputes = useCallback(async () => {
    try {
      const data = await adminService.getDisputes();
      if (Array.isArray(data)) {
        setDisputes(data);
      } else {
        console.error("Invalid response format:", data);
        toast({
          title: "Error",
          description: "Failed to load disputes - invalid response format",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading disputes:", error);
      toast({
        title: "Error",
        description: "Failed to load disputes. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  const handleResolve = async (disputeId: string) => {
    if (!resolution.trim()) {
      toast({
        title: "Error",
        description: "Please provide a resolution",
        variant: "destructive",
      });
      return;
    }

    try {
      await adminService.resolveDispute(disputeId, resolution);
      toast({
        title: "Success",
        description: "Dispute resolved successfully",
      });
      setResolution("");
      setSelectedDispute(null);
      loadDisputes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve dispute",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[600px]">
        {disputes.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No open disputes
          </p>
        ) : (
          disputes.map((dispute) => (
            <Card key={dispute.id} className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">
                  Reading #{dispute.readingId}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold">Reason:</p>
                    <p className="text-muted-foreground">{dispute.reason}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </div>
                    <Button
                      onClick={() => setSelectedDispute(dispute)}
                      variant="outline"
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </ScrollArea>

      {selectedDispute && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resolve Dispute</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter resolution..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDispute(null)}
                >
                  Cancel
                </Button>
                <Button onClick={() => handleResolve(selectedDispute.id)}>
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
