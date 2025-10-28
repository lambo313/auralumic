"use client";

import React, { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useCredits } from "@/hooks/use-credits";
import { useRouter } from "next/navigation";

import { User } from "@/types";

interface ClientStatsDashboardProps {
  user: User;
}

type PendingReview = {
  id: string;
  title: string;
  topic?: string | null;
  readerUsername?: string | null;
  createdAt?: string | null;
};

export function ClientStatsDashboard({ user }: ClientStatsDashboardProps) {
  const { credits } = useCredits();
  const router = useRouter();

  // Placeholder for favorites (kept as-is for later enhancement)
  const favoriteReaders: { id: string; name: string }[] = [];
  const subscriptionStatus = user?.subscriptionId ? "Active" : "Inactive";

  // Pending reviews: archived readings that do not yet have a review
  const [pendingReviews, setPendingReviews] = useState<PendingReview[] | null>(null);
  const [loadingPending, setLoadingPending] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function loadPendingReviews() {
      setLoadingPending(true);
      try {
        // Practical assumption: backend exposes an endpoint that returns readings
        // that are archived and missing a review for the current authenticated client.
        // The returned shape should be: [{ id, title }]
        const res = await fetch("/api/client/pending-reviews");
        if (!res.ok) {
          console.warn("Failed to load pending reviews", await res.text());
          if (mounted) setPendingReviews([]);
          return;
        }
        const data = (await res.json()) as PendingReview[];
        if (mounted) setPendingReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching pending reviews", err);
        if (mounted) setPendingReviews([]);
      } finally {
        if (mounted) setLoadingPending(false);
      }
    }

    loadPendingReviews();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-y-2 gap-x-4">
        <div>
          <h2 className="text-lg font-semibold">Client Account Overview</h2>
          <p className="text-sm text-muted-foreground">Quick summary of your credits, subscription and reviews.</p>
        </div>
        <div className="gap-4 flex">
          <Button variant="ghost" size="sm" onClick={() => router.push('/client/credits')}>Add Credits</Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/client/subscription')}>{subscriptionStatus === 'Active' ? 'Manage' : 'Start Subscription'}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4  dark:bg-slate-900/50 rounded-lg shadow-aura border">
          <div className="text-sm text-muted-foreground">Available Credits</div>
          <div className="mt-2 text-2xl font-bold">{credits ?? user?.credits ?? 0}</div>
        </div>
        <div className="p-4  dark:bg-slate-900/50 rounded-lg shadow-aura border">
          <div className="text-sm text-muted-foreground">Subscription</div>
          <div className="mt-2 text-2xl font-bold">{subscriptionStatus}</div>
        </div>
        <div className="p-4  dark:bg-slate-900/50 rounded-lg shadow-aura border">
          <div className="text-sm text-muted-foreground">Pending Reviews</div>
          <div className="mt-2 text-2xl font-bold">{(pendingReviews && pendingReviews.length) ?? 0}</div>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="mb-6">
        <h3 className="font-semibold mb-3">Favorite Readers</h3>
        {favoriteReaders.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {favoriteReaders.map((reader: { id: string; name: string }) => (
              <div key={reader.id} className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">{reader.name}</div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No favorite readers yet.</p>
        )}
      </div>

      <Separator className="my-4" />

      <div>
        <h3 className="font-semibold mb-3">Pending Reviews</h3>
        {loadingPending ? (
          <div className="text-sm text-muted-foreground">Loading pending reviews…</div>
        ) : pendingReviews && pendingReviews.length > 0 ? (
          <div className="space-y-3">
            {pendingReviews.map((review) => (
              <div key={review.id} className="flex items-center justify-between p-3  dark:bg-slate-900/50 rounded-lg border shadow-aura">
                <div>
                  {/* <div className="font-medium">{review.title}</div> */}
                  <div className="text-sm text-muted-foreground">Reader: {review.readerUsername ?? review.readerUsername}</div>
                  <div className="text-sm text-muted-foreground">
                    {review.topic ? <span className="mr-2">Topic: {review.topic}</span> : null}

                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => router.push(`/client/readings?status=archived&readingId=${encodeURIComponent(review.id)}`)}>Complete Review</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No pending reviews.</p>
        )}
      </div>
    </Card>
  );
}
