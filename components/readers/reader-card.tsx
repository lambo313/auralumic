import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { RequestReadingModal } from '@/components/readers/request-reading-modal';
import { ReaderStatusBadge } from '@/components/readers/reader-status-badge';
import { useLoadingState } from '@/hooks/use-loading-state';
import { useCredits } from '@/hooks/use-credits';
import { cn } from '@/lib/utils';
import { 
  Languages
} from 'lucide-react';
import type { Reader } from '@/types/index';
import type { ReadingRequest } from '@/types/readings';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface ReaderCardProps {
  reader: Reader;
  showRequestReading?: boolean;
  onRequestReading?: (request: ReadingRequest) => Promise<void>;
  onSelectReader?: () => void;
}

export function ReaderCard({ reader, showRequestReading = true, onRequestReading, onSelectReader }: ReaderCardProps) {
  const { isLoading, withLoading } = useLoadingState();
  const { credits, refreshBalance } = useCredits();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRequestReading = () => {
    setIsModalOpen(true);
  };

  const shouldReduceMotion = useReducedMotion();

  return (
      <Card
        className="flex flex-col group transition-all duration-300 hover:shadow-aura-lg"
      >
      <CardHeader className="flex flex-row gap-4 space-y-0 cursor-pointer"
      onClick={onSelectReader}
      >
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={reader.profileImage} alt={`${reader.username}'s avatar`} className="transition-transform group-hover:scale-105" />
            <AvatarFallback>{(reader.username?.[0] || "U").toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white ${
            reader.status === 'available' && reader.isOnline
              ? 'bg-green-500'
              : reader.status === 'busy' && reader.isOnline
              ? 'bg-yellow-500' 
              : 'bg-gray-400'
          }`} />
          {/* Status dot with subtle blurred glow applied directly to the dot */}
          {/* <div className="absolute bottom-0 right-0 h-8 w-8">
            {
              // keep the original conditional classes for the dot, but make it a motion element
            }
            <motion.span
              aria-hidden
              // center the dot inside the 8x8 container
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-3 w-3 rounded-full ring-2 ring-white ${
                reader.status === 'available' && reader.isOnline
                  ? 'bg-green-500'
                  : reader.status === 'busy' && reader.isOnline
                  ? 'bg-yellow-500'
                  : 'bg-gray-400'
              }`}
              initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
              // animate={reader.isOnline ? (shouldReduceMotion ? { opacity: 1, scale: 1 } : { scale: [1, 1, 1], opacity: [1, 1, 1] }) : { scale: 1, opacity: 1 }}
              // transition={shouldReduceMotion ? undefined : { repeat: Infinity, repeatType: 'loop', duration: 1.0, ease: 'easeOut' }}
            />
          </div> */}
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold hover:underline">
              {reader.username}
            </span>
            {/* Instant booking badge (only show when reader is online) */}
            {reader.availability?.instantBooking && reader.isOnline && (
              <div className="relative inline-flex">
                {/* subtle pulsing glow behind the instant-badge - animated via transform+opacity for good perf */}
                <motion.span
                  aria-hidden
                  initial={shouldReduceMotion ? { opacity: 0.95, scale: 1 } : { opacity: 0.85, scale: 1 }}
                  animate={shouldReduceMotion ? { opacity: 0.95 } : { scale: [1, 1.12, 1], opacity: [0.85, 0.28, 0.85] }}
                  transition={shouldReduceMotion ? undefined : { repeat: Infinity, repeatType: 'loop', duration: 1.25, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    inset: '0px',
                    borderRadius: 8,
                    zIndex: 0,
                    pointerEvents: 'none',
                    background: 'transparent',
                    boxShadow: '0 0 10px rgba(249,115,22,0.85), 0 0 22px rgba(249,115,22,0.35)'
                  }}
                />
                <Badge variant="secondary" className="relative z-10 text-xs bg-orange-50 dark:bg-orange-950/20 border border-orange-800 dark:border-orange-400 shadow-aura-md">
                  <span className="text-orange-600">⚡</span>
                  {/* <span className="text-orange-800 dark:text-orange-200 font-medium">Instant Reading</span> */}
                </Badge>
              </div>
            )}
          </div>
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
      <CardContent className="space-y-4 flex-1 mt-[-0.5rem]">
        {reader.languages && (
            <div className="flex flex-wrap gap-2 mb-[-0.5rem]">
                  {reader.languages.map((language) => (
                    <Badge key={language} variant="secondary">
                      {language}
                    </Badge>
                  ))}
                </div>
          )}
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
          {/* Combine abilities, tools and style into a single attributes list and render once */}
          {(() => {
            const attrs: string[] = [
              ...(reader.attributes?.abilities || []),
              ...(reader.attributes?.tools || [])
            ];
            if (reader.attributes?.style) attrs.push(reader.attributes.style);
            return attrs.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-2">
                {attrs.map((attr, idx) => (
                  <Badge key={`${attr}-${idx}`} variant="secondary">
                    {attr}
                  </Badge>
                ))}
              </div>
            ) : null;
          })()}
          <Button
            className="w-full transition-transform active:scale-95 disabled:transform-none hover:scale-105"
            disabled={isLoading}
            onClick={handleRequestReading}
          >
            {isLoading ? (
              <LoadingState size="sm" />
            ) : (
              "Request Reading"
            )}
          </Button>
        </CardFooter>
      )}
      
      <RequestReadingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        client={{ credits }}
        reader={reader}
        onCreditsUpdated={(newBalance) => {
          // Refresh the credits from the server to ensure accuracy
          refreshBalance();
        }}
      />
    </Card>
  );
}
