"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Clock, User, Heart, Star } from "lucide-react";
import { ClientStatusSummary } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface ClientCardProps {
  client: ClientStatusSummary;
  onSuggestReading: (clientId: string, statusId: string) => void;
  onSelectClient?: () => void;
}

export function ClientCard({ client, onSuggestReading, onSelectClient }: ClientCardProps) {
  const router = useRouter();
  const { currentStatus } = client;

  const handleClientClick = () => {
    if (onSelectClient) {
      onSelectClient();
    } else {
      router.push(`/client/profile/${client.id}`);
    }
  };
  
  const getMoodIcon = (mood?: string) => {
    switch (mood?.toLowerCase()) {
      case 'hopeful':
        return <Heart className="h-4 w-4 text-green-500" />;
      case 'confused':
        return <MessageCircle className="h-4 w-4 text-yellow-500" />;
      case 'seeking guidance':
        return <Star className="h-4 w-4 text-blue-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'love':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'career':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'spiritual':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'general':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="hover:shadow-aura-md transition-shadow duration-200">
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors duration-200"
        onClick={handleClientClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={client.avatarUrl} alt={client.name} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-semibold text-base">{client.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Active {formatDistanceToNow(client.lastActive)} ago</span>
              </div>
            </div>
          </div>
          {currentStatus && (
            <Badge 
              variant="outline" 
              className={getCategoryColor(currentStatus.category)}
            >
              {currentStatus.category || 'General'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {currentStatus ? (
          <div className="space-y-3">
            {/* Status Content */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                {getMoodIcon(currentStatus.mood)}
                <span className="text-sm font-medium capitalize">
                  {currentStatus.mood || 'Seeking guidance'}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatDistanceToNow(new Date(currentStatus.createdAt))} ago
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentStatus.content}
              </p>
            </div>

            {/* Status Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{currentStatus.suggestedReadings.length} suggestions</span>
                <span>•</span>
                <span className={currentStatus.isActive ? "text-green-600" : "text-orange-600"}>
                  {currentStatus.isActive ? "Open" : "Closed"}
                </span>
              </div>
              
              {currentStatus.isActive && (
                <Button
                  size="sm"
                  onClick={() => onSuggestReading(client.id, currentStatus.id)}
                  className="h-7 px-3 text-xs"
                >
                  Suggest Reading
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No current status posted
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {client.totalStatuses} previous statuses
            </p>
          </div>
        )}

        {/* Client Stats */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Member since {new Date(client.joinDate).getFullYear()}</span>
            <span>{client.totalStatuses} total posts</span>
          </div>
          {client.preferredCategories && client.preferredCategories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {client.preferredCategories.slice(0, 3).map((category) => (
                <Badge key={category} variant="secondary" className="text-xs px-2 py-0">
                  {category}
                </Badge>
              ))}
              {client.preferredCategories.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0">
                  +{client.preferredCategories.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}