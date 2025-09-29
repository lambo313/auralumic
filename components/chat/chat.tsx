import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDate } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useEffect, useRef } from "react"

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatarUrl?: string
  timestamp: Date
  isSystemMessage?: boolean
}

interface ChatProps {
  messages: Message[]
  participants: {
    id: string
    name: string
    avatarUrl?: string
  }[]
  currentUserId: string
  isLoading?: boolean
  onSendMessage: (content: string) => void
}

export function Chat({
  messages,
  participants,
  currentUserId,
  isLoading,
  onSendMessage,
}: ChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const input = inputRef.current
    if (!input) return

    const content = input.value.trim()
    if (content && !isLoading) {
      onSendMessage(content)
      input.value = ""
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const getSender = (senderId: string) => {
    return participants.find((p) => p.id === senderId)
  }

  const renderMessage = (message: Message) => {
    const sender = getSender(message.senderId)
    const isCurrentUser = message.senderId === currentUserId
    const messageClasses = isCurrentUser
      ? "bg-primary text-primary-foreground ml-12"
      : "bg-muted ml-2 mr-12"

    if (message.isSystemMessage) {
      return (
        <div key={message.id} className="flex justify-center my-4">
          <span className="text-sm text-muted-foreground bg-background px-3 py-1 rounded-full">
            {message.content}
          </span>
        </div>
      )
    }

    return (
      <div
        key={message.id}
        className={`flex items-start space-x-2 mb-4 ${
          isCurrentUser ? "flex-row-reverse" : ""
        }`}
      >
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={sender?.avatarUrl} alt={sender?.name || ''} />
          <AvatarFallback>{sender?.name?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium">{sender?.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(message.timestamp)}
            </span>
          </div>
          <div
            className={`${messageClasses} px-3 py-2 rounded-lg max-w-[80%] break-words`}
          >
            {message.content}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Chat</CardTitle>
        <CardDescription>
          {participants
            .filter((p) => p.id !== currentUserId)
            .map((p) => p.name)
            .join(", ")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => renderMessage(message))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input
            ref={inputRef}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
