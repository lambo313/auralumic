import { useState, useCallback } from "react"
import { useTransition } from "react"

interface UseAsyncTransitionOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useAsyncTransition() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async <T,>(
    action: () => Promise<T>,
    options?: UseAsyncTransitionOptions
  ): Promise<T | undefined> => {
    try {
      setError(null)
      let result: T
      await new Promise<void>((resolve) => {
        startTransition(() => {
          action()
            .then((r) => {
              result = r
              options?.onSuccess?.()
              resolve()
            })
            .catch((e) => {
              const error = e instanceof Error ? e : new Error("An unexpected error occurred")
              setError(error)
              options?.onError?.(error)
              resolve()
            })
        })
      })
      return result!
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An unexpected error occurred")
      setError(error)
      options?.onError?.(error)
      return undefined
    }
  }, [startTransition])

  return {
    isPending,
    error,
    execute
  }
}
