import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  max?: number
  readonly?: boolean
  className?: string
}

export function StarRating({
  value,
  onChange,
  max = 5,
  readonly = false,
  className,
  ...props
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null)

  return (
    <div
      className={cn("flex items-center space-x-1", className)}
      {...props}
    >
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1
        const isFilled = hoverValue !== null ? starValue <= hoverValue : starValue <= value

        return (
          <Star
            key={index}
            className={cn(
              "h-5 w-5 cursor-pointer transition-colors",
              isFilled ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-300",
              readonly && "cursor-default"
            )}
            onMouseEnter={() => !readonly && setHoverValue(starValue)}
            onMouseLeave={() => !readonly && setHoverValue(null)}
            onClick={() => !readonly && onChange(starValue)}
          />
        )
      })}
    </div>
  )
}
