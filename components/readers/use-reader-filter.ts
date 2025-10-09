import { useState, useCallback } from "react"

interface UseReaderFilterOptions {
  initialSpecialties?: string[]
  initialLanguages?: string[]
  initialMinRating?: number
  initialSearchQuery?: string
}

import type { Reader } from '@/types/index';

export function useReaderFilter({
  initialSpecialties = [],
  initialLanguages = [],
  initialMinRating = 0,
  initialSearchQuery = "",
}: UseReaderFilterOptions = {}) {
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    initialSpecialties
  )
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    initialLanguages
  )
  const [minRating, setMinRating] = useState(initialMinRating)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)

  const filterReaders = useCallback(
    (readers: Reader[]) => {
      return readers.filter((reader) => {
        // Filter by search query
        if (
          searchQuery &&
          !(reader.username?.toLowerCase().includes(searchQuery.toLowerCase())) &&
          !(reader.attributes?.tools?.some((tool) =>
            tool.toLowerCase().includes(searchQuery.toLowerCase())
          ) || reader.attributes?.abilities?.some((ability) =>
            ability.toLowerCase().includes(searchQuery.toLowerCase())
          ))
        ) {
          return false
        }

        // Filter by specialties (using tools and abilities)
        if (
          selectedSpecialties.length > 0 &&
          (!reader.attributes?.tools && !reader.attributes?.abilities || 
           !selectedSpecialties.every((specialty) =>
            [...(reader.attributes?.tools || []), ...(reader.attributes?.abilities || [])].includes(specialty)
          ))
        ) {
          return false
        }

        // Filter by languages
        if (
          selectedLanguages.length > 0 &&
          (!reader.languages ||
           !selectedLanguages.every((language) =>
            reader.languages!.includes(language)
          ))
        ) {
          return false
        }

        // Filter by rating
        if ((reader.stats?.averageRating ?? 0) < minRating) {
          return false
        }

        return true
      })
    },
    [searchQuery, selectedSpecialties, selectedLanguages, minRating]
  )

  return {
    selectedSpecialties,
    setSelectedSpecialties,
    selectedLanguages,
    setSelectedLanguages,
    minRating,
    setMinRating,
    searchQuery,
    setSearchQuery,
    filterReaders,
  }
}
