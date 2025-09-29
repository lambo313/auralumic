import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { RequestReadingModal } from '@/components/readers/request-reading-modal';
import { useLoadingState } from '@/hooks/use-loading-state';
import { cn } from '@/lib/utils';
import type { Reader } from '@/types/index';
import type { ReadingRequest } from '@/types/readings';
import { useState } from 'react';

interface ReaderCardProps {
  reader: Reader;
  showRequestReading?: boolean;
  onRequestReading?: (request: ReadingRequest) => Promise<void>;
  onSelectReader?: () => void;
}

export function ReaderCard({ reader, showRequestReading = true, onRequestReading, onSelectReader }: ReaderCardProps) {
  const { isLoading, withLoading } = useLoadingState();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRequestReading = () => {
    setIsModalOpen(true);
  };

  const handleModalRequestReading = async (request: ReadingRequest) => {
    if (onRequestReading) {
      await withLoading(() => onRequestReading(request));
    }
    setIsModalOpen(false);
  };

  return (
    <Card
      className="flex flex-col group transition-all duration-300 hover:shadow-lg "
    >
      <CardHeader className="flex flex-row gap-4 space-y-0 cursor-pointer"
      onClick={onSelectReader}
      >
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={reader.profileImage} alt={`${reader.username}'s avatar`} className="transition-transform group-hover:scale-105" />
            <AvatarFallback>{(reader.username?.[0] || "U").toUpperCase()}</AvatarFallback>
          </Avatar>
          {reader.isOnline && (
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold hover:underline">
            {reader.username}
          </span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 text-yellow-400"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-1">{reader.stats.averageRating?.toFixed(1)}</span>
              <span className="ml-1 text-muted-foreground">({reader.reviews.length})</span>
            </div>
            <span>•</span>
            <span>{reader.isApproved ? "Verified" : "Unverified"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 my-[-0.5rem]">
        {reader.tagline && (
          <p className="text-sm">{reader.tagline}</p>
        )}
        {reader.badges && reader.badges.length > 0 && (
          <div className="flex gap-2">
            {reader.badges.map((badge, idx) => (
              <span
                key={badge + idx}
                className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs"
                title={badge}
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      {showRequestReading && (
        <CardFooter className="flex flex-col gap-2 items-start">
          {reader.attributes?.abilities && reader.attributes.abilities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {reader.attributes.abilities.map((ability, index) => (
              <Badge key={index} variant="secondary">
                {ability}
              </Badge>
            ))}
          </div>
          )}
          <Button
            className="w-full transition-transform active:scale-95 disabled:transform-none hover:scale-105"
            disabled={isLoading || reader.status !== "available"}
            onClick={handleRequestReading}
          >
            {isLoading ? (
              <LoadingState size="sm" />
            ) : reader.status === "available" ? (
              "Request Reading"
            ) : (
              reader.status
                ? reader.status.charAt(0).toUpperCase() + reader.status.slice(1)
                : "Unavailable"
            )}
          </Button>
        </CardFooter>
      )}
      
      <RequestReadingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reader={reader}
        onRequestReading={handleModalRequestReading}
      />
    </Card>
  );
}
