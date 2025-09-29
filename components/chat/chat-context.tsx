import React, { createContext, useContext, useReducer } from "react"

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatarUrl?: string
  timestamp: Date
  isSystemMessage?: boolean
  readingId?: string
}

interface Chat {
  id: string
  participants: {
    id: string
    name: string
    avatarUrl?: string
  }[]
  messages: Message[]
  readingId?: string
  lastMessage?: Message
  unreadCount: number
}

interface ChatState {
  chats: Chat[]
  activeChat: string | null
  loading: boolean
  error: string | null
}

type ChatAction =
  | { type: "SET_CHATS"; payload: Chat[] }
  | { type: "SET_ACTIVE_CHAT"; payload: string }
  | { type: "ADD_MESSAGE"; payload: { chatId: string; message: Message } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "MARK_CHAT_AS_READ"; payload: string }
  | {
      type: "UPDATE_CHAT_PARTICIPANTS"
      payload: { chatId: string; participants: Chat["participants"] }
    }

const initialState: ChatState = {
  chats: [],
  activeChat: null,
  loading: false,
  error: null,
}

const ChatContext = createContext<
  | {
      state: ChatState
      dispatch: React.Dispatch<ChatAction>
      getChat: (chatId: string) => Chat | undefined
      getChatByReadingId: (readingId: string) => Chat | undefined
      sendMessage: (chatId: string, content: string, userId: string) => void
    }
  | undefined
>(undefined)

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_CHATS":
      return {
        ...state,
        chats: action.payload,
        loading: false,
        error: null,
      }
    case "SET_ACTIVE_CHAT":
      return {
        ...state,
        activeChat: action.payload,
      }
    case "ADD_MESSAGE":
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.payload.chatId
            ? {
                ...chat,
                messages: [...chat.messages, action.payload.message],
                lastMessage: action.payload.message,
                unreadCount:
                  state.activeChat === chat.id
                    ? 0
                    : chat.unreadCount + 1,
              }
            : chat
        ),
      }
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      }
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      }
    case "MARK_CHAT_AS_READ":
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.payload
            ? {
                ...chat,
                unreadCount: 0,
              }
            : chat
        ),
      }
    case "UPDATE_CHAT_PARTICIPANTS":
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.payload.chatId
            ? {
                ...chat,
                participants: action.payload.participants,
              }
            : chat
        ),
      }
    default:
      return state
  }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  const getChat = (chatId: string) => {
    return state.chats.find((chat) => chat.id === chatId)
  }

  const getChatByReadingId = (readingId: string) => {
    return state.chats.find((chat) => chat.readingId === readingId)
  }

  const sendMessage = (chatId: string, content: string, userId: string) => {
    const chat = getChat(chatId)
    if (!chat) return

    const sender = chat.participants.find((p) => p.id === userId)
    if (!sender) return

    const message: Message = {
      id: Date.now().toString(),
      content,
      senderId: userId,
      senderName: sender.name,
      senderAvatarUrl: sender.avatarUrl,
      timestamp: new Date(),
      readingId: chat.readingId,
    }

    dispatch({
      type: "ADD_MESSAGE",
      payload: { chatId, message },
    })
  }

  return (
    <ChatContext.Provider
      value={{ state, dispatch, getChat, getChatByReadingId, sendMessage }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}

export type { Chat, Message }
