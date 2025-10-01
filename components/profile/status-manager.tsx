"use client";

import { useState } from "react";
import { StatusPostForm } from "./status-post-form";
import { StatusCard } from "./status-card";
import { Status } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Clock, TrendingUp } from "lucide-react";

interface StatusManagerProps {
  userStatuses: Status[];
  userName: string;
  userAvatar?: string;
  onPostStatus: (statusData: {
    content: string;
    mood: string;
    category: string;
  }) => void;
  onAcceptSuggestion: (suggestionId: string) => void;
  isPostingStatus: boolean;
}

export function StatusManager({
  userStatuses,
  userName,
  userAvatar,
  onPostStatus,
  onAcceptSuggestion,
  isPostingStatus
}: StatusManagerProps) {
  const [showHistory, setShowHistory] = useState(false);

  // Sort statuses by creation date (newest first)
  const sortedStatuses = [...userStatuses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const activeStatus = sortedStatuses.find(s => s.isActive);
  const pastStatuses = sortedStatuses.filter(s => !s.isActive);

  // Calculate stats
  const totalSuggestions = userStatuses.reduce((acc, status) => acc + status.suggestedReadings.length, 0);
  const acceptedReadings = userStatuses.reduce(
    (acc, status) => acc + status.suggestedReadings.filter(s => s.isAccepted).length, 
    0
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Statuses</p>
                <p className="text-2xl font-bold">{userStatuses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Reading Suggestions</p>
                <p className="text-2xl font-bold">{totalSuggestions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Accepted Readings</p>
                <p className="text-2xl font-bold">{acceptedReadings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Post New Status Form */}
      {!activeStatus && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Share Your Current Situation</h2>
          <p className="text-sm text-muted-foreground">
            Let readers know what&apos;s on your mind to receive personalized reading suggestions.
          </p>
          <StatusPostForm onSubmit={onPostStatus} isSubmitting={isPostingStatus} />
        </div>
      )}

      {/* Current Active Status */}
      {activeStatus && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Current Status</h2>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Active
            </Badge>
          </div>
          <StatusCard
            status={activeStatus}
            userName={userName}
            userAvatar={userAvatar}
            onAcceptSuggestion={onAcceptSuggestion}
            showActions={true}
          />
          {!isPostingStatus && (
            <Card className="border-dashed">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  You have an active status. Post a new status to close the current one.
                </p>
                <StatusPostForm onSubmit={onPostStatus} isSubmitting={isPostingStatus} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Status History */}
      {pastStatuses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Status History ({pastStatuses.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Hide History" : "Show History"}
            </Button>
          </div>

          {showHistory && (
            <div className="space-y-4">
              {pastStatuses.slice(0, 5).map((status) => (
                <StatusCard
                  key={status.id}
                  status={status}
                  userName={userName}
                  userAvatar={userAvatar}
                  showActions={false}
                />
              ))}
              {pastStatuses.length > 5 && (
                <Card className="border-dashed">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Showing 5 most recent statuses. 
                      {pastStatuses.length - 5} more statuses in your history.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {userStatuses.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No statuses yet</h3>
            <p className="text-sm text-muted-foreground">
              Share your first status to start receiving personalized reading suggestions from our readers.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}