import { type Chat, type Message } from "./chat-context"

export const mockChats: Chat[] = [
  {
    id: "1",
    participants: [
      {
        id: "client1",
        name: "John Smith",
        avatarUrl: "/assets/users/john.jpg",
      },
      {
        id: "reader1",
        name: "Emma Thompson",
        avatarUrl: "/assets/readers/emma.jpg",
      },
    ],
    messages: [
      {
        id: "1",
        content: "Hello! I'm interested in a tarot reading about my career path.",
        senderId: "client1",
        senderName: "John Smith",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: "2",
        content:
          "Hi John! I'd be happy to help you explore your career path with a tarot reading.",
        senderId: "reader1",
        senderName: "Emma Thompson",
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
      },
    ],
    readingId: "reading1",
    unreadCount: 0,
    lastMessage: {
      id: "2",
      content:
        "Hi John! I'd be happy to help you explore your career path with a tarot reading.",
      senderId: "reader1",
      senderName: "Emma Thompson",
      timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
    },
  },
  {
    id: "2",
    participants: [
      {
        id: "client1",
        name: "John Smith",
        avatarUrl: "/assets/users/john.jpg",
      },
      {
        id: "reader2",
        name: "Marcus Chen",
        avatarUrl: "/assets/readers/marcus.jpg",
      },
    ],
    messages: [
      {
        id: "3",
        content: "I'm here for my past life reading session.",
        senderId: "client1",
        senderName: "John Smith",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "4",
        content: "Welcome! Let's begin our journey into your past life.",
        senderId: "reader2",
        senderName: "Marcus Chen",
        timestamp: new Date(Date.now() - 1.9 * 60 * 60 * 1000),
      },
    ],
    readingId: "reading2",
    unreadCount: 1,
    lastMessage: {
      id: "4",
      content: "Welcome! Let's begin our journey into your past life.",
      senderId: "reader2",
      senderName: "Marcus Chen",
      timestamp: new Date(Date.now() - 1.9 * 60 * 60 * 1000),
    },
  },
]

export const mockSystemMessages: Message[] = [
  {
    id: "system1",
    content: "Reading session has started",
    senderId: "system",
    senderName: "System",
    timestamp: new Date(),
    isSystemMessage: true,
  },
  {
    id: "system2",
    content: "15 minutes remaining in the session",
    senderId: "system",
    senderName: "System",
    timestamp: new Date(),
    isSystemMessage: true,
  },
  {
    id: "system3",
    content: "Reading session has ended",
    senderId: "system",
    senderName: "System",
    timestamp: new Date(),
    isSystemMessage: true,
  },
]
