/**
 * @file proxy.ts
 * @description Next.js proxy for authentication and ban checking
 * @author Team Kenya Dev
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/mentor',
  '/student',
  '/alumni',
]

// Routes that banned users can access
const bannedAllowedRoutes = [
  '/banned',
  '/api/auth/logout',
  '/api/auth/ban-status',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Check for authentication token
  const token = request.cookies.get('auth_token')
  
  if (!token) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // For dashboard routes, check ban status
  if (!bannedAllowedRoutes.some(route => pathname.startsWith(route))) {
    try {
      // Make internal API call to check ban status
      const response = await fetch(new URL('/api/auth/ban-status', request.url), {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.banned && pathname !== '/banned') {
          // Redirect banned users to banned page
          return NextResponse.redirect(new URL('/banned', request.url))
        }
      }
    } catch (error) {
      console.error('Failed to check ban status:', error)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth(?!/ban-status)).*)',
  ],
}