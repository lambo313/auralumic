"use client"

import React from "react"
import { Transition } from "@/components/ui/transition"
import { LoadingState } from "@/components/ui/loading-state"
import { useAsyncTransition } from "@/hooks/use-async-transition"
import { useErrorBoundary } from "@/hooks/use-error-boundary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface WithSafeRenderingProps {
  fallback?: React.ReactNode
  loadingText?: string
  transitionAnimation?: "fade" | "slide" | "scale" | "none"
}

export function withSafeRendering<P extends object>(
  Component: React.ComponentType<P>,
  options: WithSafeRenderingProps = {}
) {
  return function SafeComponent(props: P) {
    const { isPending } = useAsyncTransition()
    const { error, reset } = useErrorBoundary()

    if (error) {
      if (options.fallback) {
        return options.fallback
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

    return (
      <Transition animation={options.transitionAnimation || "fade"}>
        {isPending ? (
          <LoadingState text={options.loadingText} />
        ) : (
          <Component {...props} />
        )}
      </Transition>
    )
  }
}
