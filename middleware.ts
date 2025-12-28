/**
 * @file middleware.ts
 * @description Next.js middleware for route protection and authentication
 * @author Team Kenya Dev
 */

import { NextResponse, type NextRequest } from 'next/server'
import { verifyAccessToken, validateSession } from '@/app/lib/auth/jwt'
import prisma from '@/app/lib/db'
import type { UserRole } from '@/app/types/auth'

/**
 * Routes that require authentication
 */
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/join',
  '/profile',
  '/settings',
]

/**
 * Routes that should redirect authenticated users (auth pages)
 */
const authRoutes = [
  '/login',
]

/**
 * Admin-only routes
 */
const adminRoutes = [
  '/admin',
]

/**
 * Check if user is authenticated and get user info
 */
async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('access_token')?.value

    if (!token) {
      return null
    }

    // Verify JWT token
    const payload = verifyAccessToken(token)
    if (!payload) {
      return null
    }

    // Validate session is still active
    const sessionValidation = await validateSession(payload.sessionId)
    if (!sessionValidation || !sessionValidation.isValid) {
      return null
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, isActive: true },
    })

    if (!user || !user.isActive) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
    }
  } catch (error) {
    console.error('Middleware auth error:', error)
    return null
  }
}

/**
 * Check if path matches any of the given patterns
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route.endsWith('/*')) {
      return pathname.startsWith(route.slice(0, -2))
    }
    return pathname === route
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Get authenticated user
  const user = await getAuthenticatedUser(request)

  // Handle auth routes - redirect authenticated users to dashboard
  if (matchesRoute(pathname, authRoutes)) {
    if (user) {
      // Redirect based on role
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    // Allow unauthenticated users to access auth pages
    return NextResponse.next()
  }

  // Handle protected routes
  if (matchesRoute(pathname, protectedRoutes)) {
    if (!user) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check admin routes
    if (matchesRoute(pathname, adminRoutes)) {
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        // Redirect non-admin users to their dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Allow authenticated users to access their routes
    return NextResponse.next()
  }

  // Allow all other routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}