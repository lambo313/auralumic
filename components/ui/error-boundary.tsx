"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  error: Error
  reset: () => void
}

export function ErrorBoundary({ error, reset, children, fallback }: ErrorBoundaryProps & { children: React.ReactNode; fallback?: React.ReactNode }) {
  useEffect(() => {
    // Log the error to an error reporting service
    if (error) {
      console.error("Error boundary caught error:", error)
    }
  }, [error])

  if (error) {
    if (fallback) {
      return fallback
    }

    return (
      <Card className="mx-auto max-w-lg mt-8">
        <CardHeader>
          <CardTitle className="text-destructive">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
          <Button onClick={reset} variant="outline">
            Try again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return children
}
