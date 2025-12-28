/**
 * @file lib/middleware/security.ts
 * @description Security middleware for API routes
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import type { UserRole } from '@/app/types/auth'

// Extended request interface for authenticated requests
interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: UserRole
  }
  sessionId?: string
}

// Simple in-memory rate limiter (for development)
// In production, use Redis or a proper rate limiting service
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Rate limiter configurations
const rateLimitConfigs = {
  global: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  auth: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 requests per minute
  api: { maxRequests: 50, windowMs: 60 * 1000 }, // 50 requests per minute
}

/**
 * Simple in-memory rate limiter
 * @param key - Unique identifier (IP + endpoint type)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
function checkRateLimit(key: string, config: typeof rateLimitConfigs.global) {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return { success: true, remaining: config.maxRequests - 1, reset: now + config.windowMs }
  }

  if (entry.count >= config.maxRequests) {
    return { success: false, remaining: 0, reset: entry.resetTime }
  }

  entry.count++
  return { success: true, remaining: config.maxRequests - entry.count, reset: entry.resetTime }
}

/**
 * Rate limiting middleware
 * @param request - NextRequest object
 * @param type - Type of rate limiting ('global' | 'auth' | 'api')
 * @returns NextResponse if rate limited, undefined to continue
 */
export function rateLimit(
  request: NextRequest,
  type: 'global' | 'auth' | 'api' = 'global'
): NextResponse | undefined {
  try {
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1'

    const config = rateLimitConfigs[type]
    const key = `${type}:${ip}`
    const result = checkRateLimit(key, config)

    // Add rate limit headers
    const response = new NextResponse()
    response.headers.set('x-ratelimit-limit', config.maxRequests.toString())
    response.headers.set('x-ratelimit-remaining', result.remaining.toString())
    response.headers.set('x-ratelimit-reset', Math.floor(result.reset / 1000).toString())

    if (!result.success) {
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)
      response.headers.set('retry-after', retryAfter.toString())

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: `Too many requests. Try again in ${retryAfter} seconds.`,
          },
        },
        {
          status: 429,
          headers: response.headers,
        }
      )
    }

    return undefined
  } catch (error) {
    console.error('Rate limiting error:', error)
    // If rate limiting fails, allow the request to continue
    return undefined
  }
}

/**
 * Security headers middleware
 * @param response - NextResponse object
 * @returns Response with security headers
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  // Content Security Policy (strict)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; " +
    "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; " +
    "frame-src 'none'; " +
    "object-src 'none';"
  )

  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  return response
}

/**
 * Request sanitization middleware
 * @param request - NextRequest object
 * @returns Sanitized request or error response
 */
export function sanitizeRequest(request: NextRequest): NextResponse | undefined {
  try {
    // Check content type for POST/PUT requests
    const contentType = request.headers.get('content-type')
    const method = request.method

    if ((method === 'POST' || method === 'PUT') && contentType) {
      if (!contentType.includes('application/json')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_CONTENT_TYPE',
              message: 'Content-Type must be application/json',
            },
          },
          { status: 400 }
        )
      }
    }

    // Check request size (limit to 1MB for JSON payloads)
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
              message: 'Request payload too large (max 1MB)',
          },
        },
        { status: 413 }
      )
    }

    return undefined
  } catch (error) {
    console.error('Request sanitization error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SANITIZATION_ERROR',
          message: 'Request sanitization failed',
        },
      },
      { status: 400 }
    )
  }
}

/**
 * Request logging middleware
 * @param request - NextRequest object
 * @param response - NextResponse object
 * @param startTime - Request start time
 */
export function logRequest(
  request: NextRequest,
  response: NextResponse,
  startTime: number
): void {
  const duration = Date.now() - startTime
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  const logData = {
    method: request.method,
    url: request.url,
    status: response.status,
    duration: `${duration}ms`,
    ip,
    userAgent: userAgent.substring(0, 100), // Truncate long user agents
  }

  if (response.status >= 400) {
    console.error('API Error:', logData)
  } else if (duration > 5000) {
    console.warn('Slow API Request:', logData)
  } else {
    console.log('API Request:', logData)
  }
}

/**
 * Global error handler for API routes
 * @param error - Error object
 * @returns Standardized error response
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Default error response
  let status = 500
  let code = 'INTERNAL_ERROR'
  let message = 'An unexpected error occurred'

  if (error instanceof Error) {
    // Handle specific error types
    if (error.name === 'ValidationError') {
      status = 400
      code = 'VALIDATION_ERROR'
      message = error.message
    } else if (error.name === 'UnauthorizedError') {
      status = 401
      code = 'UNAUTHORIZED'
      message = 'Authentication required'
    } else if (error.name === 'ForbiddenError') {
      status = 403
      code = 'FORBIDDEN'
      message = 'Access denied'
    } else if (error.name === 'NotFoundError') {
      status = 404
      code = 'NOT_FOUND'
      message = 'Resource not found'
    } else if (error.message.includes('prisma')) {
      status = 500
      code = 'DATABASE_ERROR'
      message = 'Database operation failed'
    }
  }

  const response = NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  )

  return addSecurityHeaders(response)
}

/**
 * Combined middleware function
 * @param request - NextRequest object
 * @param options - Middleware options
 * @returns NextResponse if middleware fails, undefined to continue
 */
export async function securityMiddleware(
  request: NextRequest,
  options: {
    rateLimit?: 'global' | 'auth' | 'api'
    requireAuth?: boolean
    allowedRoles?: string[]
  } = {}
): Promise<NextResponse | undefined> {
  const startTime = Date.now()

  try {
    // 1. Sanitize request
    const sanitizeResult = sanitizeRequest(request)
    if (sanitizeResult) return sanitizeResult

    // 2. Apply rate limiting
    if (options.rateLimit) {
      const rateLimitResult = await rateLimit(request, options.rateLimit)
      if (rateLimitResult) return rateLimitResult
    }

    // 3. Authentication (if required)
    if (options.requireAuth) {
      // Import here to avoid circular dependencies
      const { authenticateRequest } = await import('./auth')
      const authResult = await authenticateRequest(request)

      if (!authResult.success) {
        const error = authResult.error!
        return NextResponse.json(
          { success: false, error: { code: error.code, message: error.message } },
          { status: error.status }
        )
      }

      const { user } = authResult

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'AUTH_ERROR',
              message: 'Authentication failed',
            },
          },
          { status: 401 }
        )
      }

      // Check role authorization
      if (options.allowedRoles && !options.allowedRoles.includes(user.role)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: 'Insufficient permissions for this action',
            },
          },
          { status: 403 }
        )
      }

      // Attach user to request
      ;(request as AuthenticatedRequest).user = user
      ;(request as AuthenticatedRequest).sessionId = authResult.sessionId
    }

    return undefined
  } catch (error) {
    return handleApiError(error)
  } finally {
    // Log request (will be called by the route handler)
  }
}
