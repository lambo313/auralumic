import { useEffect, useState } from "react"
import { readerService } from "@/services/api"

interface ReaderDocument {
  id: string
  name: string
  url: string
  uploadDate: string
}

interface Reader {
  id: string
  name: string
  email: string
  avatarUrl?: string
  bio: string
  location: string
  languages: string[]
  applicationDate: string
  profileCompleteness: number
  attributes: {
    tools: string[]
    abilities: string[]
    style: string
  }
  documents: ReaderDocument[]
}

export function useReader(readerId: string) {
  const [reader, setReader] = useState<Reader | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadReader() {
      try {
        setIsLoading(true)
        const data = await readerService.getReaderById(readerId)
        setReader(data)
      } catch (error) {
        console.error("Error loading reader:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (readerId) {
      loadReader()
    }
  }, [readerId])

  return { reader, isLoading }
}
