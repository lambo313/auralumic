import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge, type BadgeProps } from "@/components/ui/badge"

interface ReaderFilterProps {
  specialties: string[]
  languages: string[]
  selectedSpecialties: string[]
  selectedLanguages: string[]
  minRating: number
  searchQuery: string
  onSpecialtiesChange: (specialties: string[]) => void
  onLanguagesChange: (languages: string[]) => void
  onMinRatingChange: (rating: number) => void
  onSearchQueryChange: (query: string) => void
}

export function ReaderFilter({
  specialties,
  languages,
  selectedSpecialties,
  selectedLanguages,
  minRating,
  searchQuery,
  onSpecialtiesChange,
  onLanguagesChange,
  onMinRatingChange,
  onSearchQueryChange,
}: ReaderFilterProps) {
  return (
    <div className="space-y-6 p-4 bg-card rounded-lg border">
      <div className="space-y-2">
        <Label htmlFor="search">Search Readers</Label>
        <Input
          id="search"
          placeholder="Search by name or keywords..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Specialties</Label>
        <div className="flex flex-wrap gap-2">
          {specialties.map((specialty) => (
            <Badge
              key={specialty}
              variant={
                selectedSpecialties.includes(specialty) ? "default" : "outline"
              }
              className="cursor-pointer hover:opacity-80"
              onClick={() => {
                const newSpecialties = selectedSpecialties.includes(specialty)
                  ? selectedSpecialties.filter((s) => s !== specialty)
                  : [...selectedSpecialties, specialty]
                onSpecialtiesChange(newSpecialties)
              }}
            >
              {specialty}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Languages</Label>
        <div className="flex flex-wrap gap-2">
          {languages.map((language) => (
            <Badge
              key={language}
              variant={
                selectedLanguages.includes(language) ? "default" : "outline"
              }
              className="cursor-pointer hover:opacity-80"
              onClick={() => {
                const newLanguages = selectedLanguages.includes(language)
                  ? selectedLanguages.filter((l) => l !== language)
                  : [...selectedLanguages, language]
                onLanguagesChange(newLanguages)
              }}
            >
              {language}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="min-rating">Minimum Rating</Label>
        <Select
          value={minRating.toString()}
          onValueChange={(value: string) => onMinRatingChange(Number(value))}
        >
          <SelectTrigger id="min-rating">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[0, 1, 2, 3, 4, 5].map((rating) => (
              <SelectItem key={rating} value={rating.toString()}>
                {rating === 0 ? "Any rating" : `${rating} stars or higher`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
