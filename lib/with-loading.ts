export async function withLoading<T>(
  action: () => Promise<T>,
  setLoading: (isLoading: boolean) => void,
  onError?: (error: Error) => void
): Promise<T | undefined> {
  try {
    setLoading(true)
    return await action()
  } catch (err) {
    const error = err instanceof Error ? err : new Error("An unexpected error occurred")
    onError?.(error)
    return undefined
  } finally {
    setLoading(false)
  }
}
