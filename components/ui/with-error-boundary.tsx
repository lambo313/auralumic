"use client"

import React from "react"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundaryComponent extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">{this.state.error?.message}</p>
          <button
            className="mt-2 text-sm underline"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundaryComponent fallback={fallback}>
        <Component {...props} />
      </ErrorBoundaryComponent>
    )
  }
}
