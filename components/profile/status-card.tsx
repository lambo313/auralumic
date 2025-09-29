"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Status, SuggestedReading } from "@/types";
import { MessageCircle, Clock, User, Heart, Star, CheckCircle, XCircle, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface StatusCardProps {
  status: Status;
  userName: string;
  userAvatar?: string;
  onAcceptSuggestion?: (suggestionId: string) => void;
  onViewDetails?: (statusId: string) => void;
  showActions?: boolean;
}

export function StatusCard({ 
  status, 
  userName, 
  userAvatar, 
  onAcceptSuggestion, 
  onViewDetails,
  showActions = true 
}: StatusCardProps) {
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);

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

  const acceptedSuggestion = status.suggestedReadings.find(s => s.isAccepted);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">{userName}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(status.createdAt))} ago</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getCategoryColor(status.category)}>
              {status.category || 'General'}
            </Badge>
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              status.isActive ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {status.isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {status.isActive ? 'Open' : 'Closed'}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Content */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            {getMoodIcon(status.mood)}
            <span className="text-sm font-medium capitalize">
              {status.mood || 'Seeking guidance'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pl-6">
            {status.content}
          </p>
        </div>

        {/* Suggested Readings */}
        {status.suggestedReadings.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Reading Suggestions ({status.suggestedReadings.length})
              </h4>
              {acceptedSuggestion && (
                <Badge variant="default" className="text-xs">
                  Reading Accepted
                </Badge>
              )}
            </div>
            
            <div className="space-y-3">
              {status.suggestedReadings.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`border rounded-lg p-3 ${
                    suggestion.isAccepted 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-muted hover:border-border'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={suggestion.readerAvatarUrl} alt={suggestion.readerName} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{suggestion.readerName}</p>
                        <p className="text-xs text-muted-foreground">{suggestion.suggestedType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{suggestion.estimatedDuration}min</span>
                      {suggestion.suggestedPrice && (
                        <>
                          <span>•</span>
                          <span>{suggestion.suggestedPrice} credits</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    <h5 className="text-sm font-medium">{suggestion.title}</h5>
                    <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                    
                    {suggestion.message && (
                      <div className="text-xs italic text-muted-foreground bg-muted/30 p-2 rounded">
                        "{suggestion.message}"
                      </div>
                    )}
                  </div>

                  {showActions && !acceptedSuggestion && status.isActive && (
                    <div className="mt-3 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedSuggestion(
                          expandedSuggestion === suggestion.id ? null : suggestion.id
                        )}
                        className="h-7 px-3 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onAcceptSuggestion?.(suggestion.id)}
                        className="h-7 px-3 text-xs"
                      >
                        Accept Reading
                      </Button>
                    </div>
                  )}

                  {suggestion.isAccepted && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>This reading was accepted</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && onViewDetails && (
          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(status.id)}
              className="h-7 px-3 text-xs"
            >
              View Full Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}