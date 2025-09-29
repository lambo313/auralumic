"use client"

import { ReactNode } from "react"
import { useFormStatus } from "react-dom"
import { LoadingSpinner } from "./loading-spinner"

interface FormSubmitButtonProps {
  children: ReactNode
  loadingText?: string
  className?: string
}

export function FormSubmitButton({ 
  children, 
  loadingText = "Processing...",
  className = ""
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center ${className}`}
    >
      {pending ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}
