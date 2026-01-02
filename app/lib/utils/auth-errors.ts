/**
 * @file app/lib/utils/auth-errors.ts
 * @description Comprehensive auth error handling utilities
 * @author Team Kenya Dev
 */

export interface AuthError {
  code: string
  message: string
  details?: any
  retryable?: boolean
  redirectTo?: string
}

/**
 * Map of auth error codes to user-friendly messages
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  'NETWORK_ERROR': 'Connection issue. Please check your internet and try again.',
  'TIMEOUT': 'Request took too long. Please try again.',
  
  // Authentication errors
  'INVALID_CREDENTIALS': 'Invalid email or password.',
  'INVALID_OTP': 'Invalid or expired code. Please request a new one.',
  'OTP_EXPIRED': 'Your verification code has expired. Please request a new one.',
  'SESSION_EXPIRED': 'Your session has expired. Please log in again.',
  'UNAUTHORIZED': 'You need to log in to access this page.',
  
  // Rate limiting
  'RATE_LIMITED': 'Too many attempts. Please wait a moment and try again.',
  'TOO_MANY_REQUESTS': 'Too many requests. Please slow down.',
  
  // Account status
  'ACCOUNT_BANNED': 'Your account has been suspended. Please contact support.',
  'ACCOUNT_INACTIVE': 'Your account is inactive. Please contact support.',
  'EMAIL_NOT_VERIFIED': 'Please verify your email address first.',
  
  // Server errors
  'SERVER_ERROR': 'Something went wrong on our end. Please try again later.',
  'DATABASE_ERROR': 'Database connection issue. Please try again.',
  
  // Validation errors
  'VALIDATION_ERROR': 'Please check your input and try again.',
  'INVALID_EMAIL': 'Please enter a valid email address.',
  'INVALID_INPUT': 'Invalid input. Please check and try again.',
}

/**
 * Parse and format auth errors for display
 */
export function parseAuthError(error: any): AuthError {
  // Handle different error formats
  if (typeof error === 'string') {
    return {
      code: 'UNKNOWN',
      message: error,
      retryable: true
    }
  }
  
  // Handle error objects from API
  if (error?.error) {
    const code = error.error.code || 'UNKNOWN'
    const message = AUTH_ERROR_MESSAGES[code] || error.error.message || 'An unexpected error occurred'
    
    return {
      code,
      message,
      details: error.error.details,
      retryable: !['ACCOUNT_BANNED', 'ACCOUNT_INACTIVE'].includes(code),
      redirectTo: error.error.redirectTo
    }
  }
  
  // Handle JavaScript Error objects
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: AUTH_ERROR_MESSAGES.NETWORK_ERROR,
        retryable: true
      }
    }
    
    return {
      code: 'UNKNOWN',
      message: error.message,
      retryable: true
    }
  }
  
  // Default error
  return {
    code: 'UNKNOWN',
    message: 'An unexpected error occurred. Please try again.',
    retryable: true
  }
}

/**
 * Log auth errors for debugging (development only)
 */
export function logAuthError(context: string, error: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔐 Auth Error: ${context}`)
    console.error('Error:', error)
    console.error('Parsed:', parseAuthError(error))
    console.trace('Stack trace:')
    console.groupEnd()
  } else {
    // In production, send to error tracking service
    console.error(`Auth error in ${context}:`, error)
  }
}

/**
 * Handle auth redirect errors
 */
export function handleAuthRedirect(
  redirectUrl: string,
  router: any,
  fallbackUrl: string = '/dashboard'
): void {
  console.log(`Attempting redirect to: ${redirectUrl}`)
  
  // Validate URL
  if (!redirectUrl || !redirectUrl.startsWith('/')) {
    console.warn('Invalid redirect URL, using fallback:', fallbackUrl)
    redirectUrl = fallbackUrl
  }
  
  // Try Next.js router first
  if (router?.push) {
    try {
      const result = router.push(redirectUrl)
      // Check if push returns a Promise
      if (result && typeof result.catch === 'function') {
        result.catch((err: Error) => {
          console.error('Router push failed:', err)
          // Final fallback: window.location
          if (typeof window !== 'undefined') {
            window.location.href = redirectUrl
          }
        })
      }
    } catch (err) {
      console.error('Router push error:', err)
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl
      }
    }
  } else if (typeof window !== 'undefined') {
    // No router available, use window.location
    window.location.href = redirectUrl
  } else {
    console.error('No redirect method available')
  }
}

/**
 * Retry failed auth operations with exponential backoff
 */
export async function retryAuthOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Don't retry certain errors
      const parsed = parseAuthError(error)
      if (!parsed.retryable) {
        throw error
      }
      
      // Exponential backoff
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i)
        console.log(`Retrying auth operation in ${delay}ms (attempt ${i + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}