import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"

interface MessageProps {
  id: string
  content: string
  timestamp: Date
  sender: {
    id: string
    name: string
    avatarUrl?: string
  }
  isCurrentUser: boolean
  isSystemMessage?: boolean
}

export function Message({
  content,
  timestamp,
  sender,
  isCurrentUser,
  isSystemMessage,
}: MessageProps) {
  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <span className="text-sm text-muted-foreground bg-background px-3 py-1 rounded-full">
          {content}
        </span>
      </div>
    )
  }

  const messageClasses = isCurrentUser
    ? "bg-primary text-primary-foreground ml-12"
    : "bg-muted ml-2 mr-12"

  return (
    <div
      className={`flex items-start space-x-2 mb-4 ${
        isCurrentUser ? "flex-row-reverse" : ""
      }`}
    >
      <Avatar className="h-8 w-8 mt-1">
        <AvatarImage src={sender.avatarUrl} alt={sender.name} />
        <AvatarFallback>{sender.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm font-medium">{sender.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(timestamp)}
          </span>
        </div>
        <div
          className={`${messageClasses} px-3 py-2 rounded-lg max-w-[80%] break-words`}
        >
          {content}
        </div>
      </div>
    </div>
  )
}
