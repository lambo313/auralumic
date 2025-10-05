'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ReaderList } from './reader-list';
import { useReaderFilter } from './use-reader-filter';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import attributes from '@/data/attributes.json';
import type { Reader } from '@/types/index';
import { mockReaders } from './mock-reader-data';

export function ReaderConnect({ onSelectReader }: { onSelectReader?: (readerId: string) => void }) {
  const router = useRouter();
  const {
    searchQuery,
    setSearchQuery,
    selectedSpecialties,
    setSelectedSpecialties,
    filterReaders
  } = useReaderFilter();

  // Combine all attributes for filtering
  const allSpecialties = [
    ...attributes.Abilities.map(a => a.name),
    ...attributes.Tools.map(t => t.name),
    ...attributes.Styles.map(s => s.name)
  ];

  // Use centralized mockReaders
  const [readers] = useState<Reader[]>(mockReaders);

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
      </div>

      {/* Filters */}
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

      {/* Reader List */}
      <ReaderList
        readers={filteredReaders}
        onSelectReader={handleSelectReader}
      />
    </div>
  );
}
