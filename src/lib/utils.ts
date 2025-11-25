import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AxiosError } from "axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * API Error Response format
 * Matches the format from api/src/shared/types/ApiResponse.ts
 */
interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]> | Array<{ path: (string | number)[]; message: string }>
}

/**
 * Extracts a user-friendly error message from an axios error or generic error
 *
 * Handles the API error format:
 * - { message: string } - Simple errors
 * - { message: string, errors?: Record<string, string[]> } - Validation errors (422)
 * - { message: string, errors?: Array<{ path, message }> } - ZodError format (if not transformed)
 *
 * @param error - The error object (can be axios error, Error, or unknown)
 * @param defaultMessage - Default message to show if error message cannot be extracted
 * @returns A user-friendly error message string
 *
 * @example
 * ```typescript
 * try {
 *   await api.updateParty(data)
 * } catch (error) {
 *   const message = extractErrorMessage(error, 'No se pudo actualizar la información')
 *   toast({ description: message, variant: 'destructive' })
 * }
 * ```
 */
export function extractErrorMessage(error: unknown, defaultMessage = 'Ha ocurrido un error. Por favor, intenta de nuevo.'): string {
  // Handle axios errors
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>

    // Check for validation errors in response data
    if (axiosError.response?.data) {
      const data = axiosError.response.data

      // If there are validation errors, format them nicely
      if (data.errors) {
        const errorMessages: string[] = []

        // Handle Record<string, string[]> format (transformed validation errors)
        if (!Array.isArray(data.errors) && typeof data.errors === 'object') {
          const errorsRecord = data.errors as Record<string, string[]>
          Object.entries(errorsRecord).forEach(([field, messages]) => {
            // Remove "body." prefix from field names for better UX
            const fieldName = field.replace(/^(body|query|params)\./, '')
            messages.forEach(msg => {
              errorMessages.push(`${fieldName}: ${msg}`)
            })
          })
        }
        // Handle Array format (ZodError format - array of { path, message })
        else if (Array.isArray(data.errors)) {
          data.errors.forEach((err: unknown) => {
            if (err && typeof err === 'object' && 'message' in err && 'path' in err) {
              const zodError = err as { path: (string | number)[]; message: string }
              // Build field name from path array, skip "body", "query", "params"
              const pathParts = zodError.path.filter(p => p !== 'body' && p !== 'query' && p !== 'params')
              const fieldName = pathParts.length > 0 ? pathParts.join('.') : 'campo'
              errorMessages.push(`${fieldName}: ${zodError.message}`)
            } else if (typeof err === 'string') {
              errorMessages.push(err)
            }
          })
        }

        if (errorMessages.length > 0) {
          return errorMessages.join('. ')
        }
      }

      // Fallback to message field if no errors object
      if (data.message) {
        return data.message
      }
    }

    // Fallback to status text for axios errors
    if (axiosError.response?.statusText) {
      return axiosError.response.statusText
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message || defaultMessage
  }

  // Fallback to default message
  return defaultMessage
}
