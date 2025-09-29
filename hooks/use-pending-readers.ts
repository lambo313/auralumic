import { useState, useEffect } from "react"
import { readerService } from "@/services/api"

interface Reader {
  id: string
  name: string
  email: string
  avatarUrl?: string
  bio: string
  applicationDate: Date
  attributes: {
    tools: string[]
    abilities: string[]
    style: string
  }
  profileCompleteness: number
}

export function usePendingReaders() {
  const [pendingReaders, setPendingReaders] = useState<Reader[]>([])
  const [incompleteReaders, setIncompleteReaders] = useState<Reader[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReaders()
  }, [])

  const loadReaders = async () => {
    try {
      setIsLoading(true)
      const response = await readerService.getPendingApprovals()
      
      // Split readers into pending and incomplete based on profile completeness
      const pending: Reader[] = []
      const incomplete: Reader[] = []
      
      response.forEach((reader: Reader) => {
        if (reader.profileCompleteness >= 80) {
          pending.push(reader)
        } else {
          incomplete.push(reader)
        }
      })

      setPendingReaders(pending)
      setIncompleteReaders(incomplete)
    } catch (error) {
      console.error("Error loading pending readers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const approveReader = async (readerId: string) => {
    await readerService.approve(readerId)
    await loadReaders()
  }

  const rejectReader = async (readerId: string) => {
    await readerService.reject(readerId)
    await loadReaders()
  }

  return {
    pendingReaders,
    incompleteReaders,
    approveReader,
    rejectReader,
    isLoading,
  }
}
