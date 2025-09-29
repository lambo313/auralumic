"use client"

import { ComponentType, Suspense } from "react"
import { LoadingSpinner } from "./loading-spinner"

interface WithLoadingProps {
  isLoading?: boolean
}

export function withLoading<P extends WithLoadingProps>(
  WrappedComponent: ComponentType<P>
) {
  return function WithLoadingComponent(props: P) {
    if (props.isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[100px]">
          <LoadingSpinner />
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }
}

interface AsyncComponentProps {
  fallback?: React.ReactNode
}

export function withAsync<P extends object>(
  WrappedComponent: ComponentType<P>,
  { fallback = <LoadingSpinner /> }: AsyncComponentProps = {}
) {
  return function AsyncComponent(props: P) {
    return (
      <Suspense fallback={fallback}>
        <WrappedComponent {...props} />
      </Suspense>
    )
  }
}
