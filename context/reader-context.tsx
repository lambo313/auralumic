import { createContext, useContext, useState } from "react"

type ReaderStatus = "online" | "offline" | "busy"
type ReaderType = "psychic" | "tarot" | "astrology" | "all"

interface Reader {
  id: string
  displayName: string
  bio?: string
  type: ReaderType
  status: ReaderStatus
  rating: number
  totalReadings: number
  availableCredits: number
  attributes: string[]
  badges: string[]
}

interface ReaderContextType {
  reader: Reader | null
  setReader: (reader: Reader | null) => void
  updateStatus: (status: ReaderStatus) => void
  updateCredits: (newAmount: number) => void
}

const ReaderContext = createContext<ReaderContextType | undefined>(undefined)

export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [reader, setReader] = useState<Reader | null>(null)

  const updateStatus = (status: ReaderStatus) => {
    if (reader) {
      setReader({ ...reader, status })
    }
  }

  const updateCredits = (newAmount: number) => {
    if (reader) {
      setReader({ ...reader, availableCredits: newAmount })
    }
  }

  return (
    <ReaderContext.Provider
      value={{
        reader,
        setReader,
        updateStatus,
        updateCredits,
      }}
    >
      {children}
    </ReaderContext.Provider>
  )
}

export function useReader() {
  const context = useContext(ReaderContext)
  if (context === undefined) {
    throw new Error("useReader must be used within a ReaderProvider")
  }
  return context
}
