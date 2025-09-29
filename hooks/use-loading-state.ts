import { useState, useCallback } from "react"

export function useLoadingState() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const withLoading = useCallback(async <T,>(
    callback: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void
      onError?: (error: Error) => void
    }
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await callback()
      options?.onSuccess?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An unexpected error occurred")
      setError(error)
      options?.onError?.(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isLoading, error, withLoading }
}
