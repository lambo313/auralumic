import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { type Chat } from "./chat-context"

interface ChatListProps {
  chats: Chat[]
  currentUserId: string
  activeChat: string | null
  onSelectChat: (chatId: string) => void
}

export function ChatList({
  chats,
  currentUserId,
  activeChat,
  onSelectChat,
}: ChatListProps) {
  const getOtherParticipants = (chat: Chat) => {
    return chat.participants.filter((p) => p.id !== currentUserId)
  }

  if (!chats.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No active chats</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chats</CardTitle>
        <CardDescription>Your active conversations</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {chats.map((chat) => {
            const otherParticipants = getOtherParticipants(chat)
            const isActive = chat.id === activeChat

            return (
              <div
                key={chat.id}
                className={`flex items-center space-x-4 p-4 cursor-pointer hover:bg-accent ${
                  isActive ? "bg-accent" : ""
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex -space-x-2">
                  {otherParticipants.map((participant) => (
                    <Avatar key={participant.id} className="border-2 border-background">
                      <AvatarImage src={participant.avatarUrl} alt={participant.name} />
                      <AvatarFallback>{participant.name[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium truncate">
                      {otherParticipants.map((p) => p.name).join(", ")}
                    </h4>
                    {chat.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(chat.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  {chat.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage.content}
                    </p>
                  )}
                </div>
                {chat.unreadCount > 0 && (
                  <Badge variant="default" className="ml-2">
                    {chat.unreadCount}
                  </Badge>
                )}
              </div>
            )
          })}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
