'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ReaderList } from './reader-list';
import { useReaderFilter } from './use-reader-filter';
import { useReaders } from '@/hooks/use-readers';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import attributes from '@/data/attributes.json';
import type { Reader } from '@/types/index';

export function ReaderConnect({ onSelectReader }: { onSelectReader?: (readerId: string) => void }) {
  const router = useRouter();
  const {
    searchQuery,
    setSearchQuery,
    selectedSpecialties,
    setSelectedSpecialties,
    filterReaders
  } = useReaderFilter();

  // Fetch readers from the database
  const { readers, loading, error, refetch } = useReaders();

  // Combine all attributes for filtering
  const allSpecialties = [
    ...attributes.Abilities.map(a => a.name),
    ...attributes.Tools.map(t => t.name),
    ...attributes.Styles.map(s => s.name)
  ];

  const filteredReaders = filterReaders(readers);

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(
      selectedSpecialties.includes(specialty)
        ? selectedSpecialties.filter(s => s !== specialty)
        : [...selectedSpecialties, specialty]
    );
  };

  // Handler for reader card click: navigate to /reader/profile/[id]
  const handleSelectReader = (readerId: string) => {
    if (onSelectReader) {
      onSelectReader(readerId);
    } else {
      // Always navigate to reader profile page regardless of current user role
      router.push(`/reader/profile/${readerId}`);
    }
  };

  return (
    <div className="grid gap-6">
      {/* Search */}
      <div className="flex items-center space-x-2">
        <Input
          type="search"
          placeholder="Search by name or specialty..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        {error && (
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="text-xs"
          >
            Retry
          </Button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-2">
            Failed to load readers: {error}
          </p>
          <Button variant="outline" onClick={refetch}>
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Loading readers...</p>
        </div>
      )}

      {/* Filters - only show when not loading and no error */}
      {!loading && !error && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Filter by Specialty</h3>
            {selectedSpecialties.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSpecialties([])}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
          <ScrollArea className="h-20">
            <div className="flex flex-wrap gap-2 p-2">
              {allSpecialties.map((specialty) => (
                <Badge
                  key={specialty}
                  variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform hover:bg-ring hover:text-primary-foreground"
                  onClick={() => toggleSpecialty(specialty)}
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Reader List - only show when not loading and no error */}
      {!loading && !error && (
        <ReaderList
          readers={filteredReaders}
          onSelectReader={handleSelectReader}
        />
      )}

      {/* Empty State */}
      {!loading && !error && filteredReaders.length === 0 && readers.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No readers found matching your filters.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecialties([]);
            }}
            className="mt-2"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* No Data State */}
      {!loading && !error && readers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No approved readers available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
