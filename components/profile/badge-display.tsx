import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface BadgeData {
  id: string
  name: string
  description: string
  icon?: string
  type: "achievement" | "milestone" | "skill"
}

interface BadgeDisplayProps {
  badges: BadgeData[]
}

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  const getBadgeVariant = (type: BadgeData["type"]) => {
    switch (type) {
      case "achievement":
        return "default"
      case "milestone":
        return "secondary"
      case "skill":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <TooltipProvider>
        {badges.map((badge) => (
          <Tooltip key={badge.id}>
            <TooltipTrigger>
              <Badge variant={getBadgeVariant(badge.type)} className="cursor-help">
                {badge.icon && (
                  <span className="mr-1" aria-hidden="true">
                    {badge.icon}
                  </span>
                )}
                {badge.name}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{badge.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  )
}
