import { useState, useEffect } from "react"
import { api } from "@/services/api"

interface UseCreditsReturn {
  credits: number
  loading: boolean
  error: Error | null
  purchaseCredits: (packageId: string) => Promise<void>
  refreshBalance: () => Promise<void>
}

export function useCredits(): UseCreditsReturn {
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refreshBalance = async () => {
    try {
      setLoading(true)
      setError(null)
      const { credits } = await api.credits.getBalance()
      setCredits(credits)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch credits"))
    } finally {
      setLoading(false)
    }
  }

  const purchaseCredits = async (packageId: string) => {
    try {
      setLoading(true)
      setError(null)
      await api.credits.purchaseCredits(packageId)
      await refreshBalance() // Refresh balance after purchase
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to purchase credits"))
      throw err // Re-throw to handle in UI
    } finally {
      setLoading(false)
    }
  }

  // Load initial balance
  useEffect(() => {
    refreshBalance()
  }, [])

  return {
    credits,
    loading,
    error,
    purchaseCredits,
    refreshBalance,
  }
}
