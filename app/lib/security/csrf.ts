/**
 * @file lib/security/csrf.ts
 * @description CSRF protection utilities
 * @author Team Kenya Dev
 */

import { NextRequest } from 'next/server'

/**
 * Generate a CSRF token
 */
export async function generateCSRFToken(): Promise<string> {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify CSRF token from request
 */
export function verifyCSRFToken(request: NextRequest, sessionToken: string): boolean {
  // Get token from header or body
  const headerToken = request.headers.get('X-CSRF-Token')
  const bodyToken = request.headers.get('content-type')?.includes('json')
    ? null // Will be extracted from body in route handler
    : null
  
  const token = headerToken || bodyToken
  
  if (!token || !sessionToken) {
    return false
  }
  
  // Timing-safe comparison
  return timingSafeEqual(token, sessionToken)
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * CSRF middleware configuration
 */
export const CSRF_CONFIG = {
  cookieName: 'csrf_token',
  headerName: 'X-CSRF-Token',
  excludedPaths: [
    '/api/auth/request-otp', // Public endpoints that don't need CSRF
    '/api/health',
  ],
  methods: ['POST', 'PUT', 'DELETE', 'PATCH'] // Methods that require CSRF
}