import { z } from "zod"
import { toast } from "@/components/ui/use-toast"

export type ValidationResult = {
  success: boolean
  errors?: Record<string, string[]>
}

export function handleValidationError<T>(error: z.ZodError<T>): ValidationResult {
  const errors: Record<string, string[]> = {}
  
  error.issues.forEach((issue) => {
    const path = issue.path.join(".")
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(issue.message)
  })

  // Show toast for first error
  if (error.issues.length > 0) {
    toast({
      title: "Validation Error",
      description: error.issues[0].message,
      variant: "destructive"
    })
  }

  return {
    success: false,
    errors
  }
}

export type FormValidationResult<T> = {
  success: boolean;
  data?: T;
  error?: z.ZodError<T>;
}

export function validateForm<T>(schema: z.Schema<T>, data: unknown): FormValidationResult<T> {
  try {
    const result = schema.safeParse(data)
    if (result.success) {
      return {
        success: true,
        data: result.data
      }
    } else {
      return {
        success: false,
        error: result.error as z.ZodError<T>
      }
    }
  } catch (error) {
    console.error("Form validation error:", error)
    const genericError = new z.ZodError([{
      code: z.ZodIssueCode.custom,
      path: [],
      message: "An unexpected error occurred during validation"
    }])
    return {
      success: false,
      error: genericError as z.ZodError<T>
    }
  }
}
