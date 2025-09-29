"use client"

import { useCallback, useState } from "react"

export function useErrorBoundary<E extends Error = Error>() {
  const [error, setError] = useState<E | null>(null)

  const handleError = useCallback((error: E) => {
    setError(error)
  }, [])

  const reset = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    handleError,
    reset,
  }
}
