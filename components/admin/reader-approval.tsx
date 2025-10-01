"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import type { Reader } from "@/types";
import { api } from "@/services/api";

export function ReaderApproval() {
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPendingReaders() {
      try {
        const pendingReaders = await api.readers.getPendingApprovals();
        setReaders(pendingReaders);
      } catch (error) {
        console.error("Error loading pending readers:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPendingReaders();
  }, []);

  const handleApprove = async (readerId: string) => {
    try {
      await api.readers.approve(readerId);
      setReaders((prev) => prev.filter((r) => r.id !== readerId));
    } catch (error) {
      console.error("Error approving reader:", error);
    }
  };

  const handleReject = async (readerId: string) => {
    try {
      await api.readers.reject(readerId);
      setReaders((prev) => prev.filter((r) => r.id !== readerId));
    } catch (error) {
      console.error("Error rejecting reader:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {readers.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No pending approvals
          </p>
        ) : (
          readers.map((reader) => (
            <Card key={reader.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{reader.username}</h3>
                    <p className="text-sm text-muted-foreground">
                      {reader.location}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(reader.id)}
                      className="text-destructive hover:underline"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(reader.id)}
                      className="text-primary hover:underline"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
