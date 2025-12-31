/**
 * @file middleware.ts
 * @description Next.js middleware for route protection and role-based access control
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Define protected routes and their required roles
const PROTECTED_ROUTES = {
  '/admin': ['ADMIN', 'SUPER_ADMIN'],
  '/dashboard': ['USER', 'ADMIN', 'SUPER_ADMIN'],
  '/dashboard/applications': ['USER', 'ADMIN', 'SUPER_ADMIN'],
  '/dashboard/settings': ['USER', 'ADMIN', 'SUPER_ADMIN'],
  '/admin/users': ['ADMIN', 'SUPER_ADMIN'],
  '/admin/applications': ['ADMIN', 'SUPER_ADMIN'],
  '/admin/emails': ['ADMIN', 'SUPER_ADMIN'],
  '/admin/events': ['ADMIN', 'SUPER_ADMIN'],
} as const

// Public routes that authenticated users shouldn't access
const AUTH_ROUTES = ['/login', '/signup', '/auth/login', '/auth/signup']

// API routes that require authentication
const PROTECTED_API_ROUTES = {
  '/api/admin': ['ADMIN', 'SUPER_ADMIN'],
  '/api/applications': ['USER', 'ADMIN', 'SUPER_ADMIN'],
  '/api/user': ['USER', 'ADMIN', 'SUPER_ADMIN'],
} as const

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get token from cookies
  const token = request.cookies.get('auth_token')?.value
  
  // Handle authentication routes
  if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
        const { payload } = await jwtVerify(token, secret)
        
        // If user is authenticated, redirect away from auth pages
        const userRole = payload.role as string
        if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
          return NextResponse.redirect(new URL('/admin', request.url))
        } else {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch (error) {
        // Token invalid, allow access to auth pages
        console.error('Token verification failed:', error)
      }
    }
    // Allow access to auth pages if not authenticated
    return NextResponse.next()
  }
  
  // Check if route is protected
  const isProtectedRoute = Object.keys(PROTECTED_ROUTES).some(route => 
    pathname.startsWith(route)
  )
  
  const isProtectedApiRoute = Object.keys(PROTECTED_API_ROUTES).some(route => 
    pathname.startsWith(route)
  )
  
  if (isProtectedRoute || isProtectedApiRoute) {
    // If no token, redirect to login
    if (!token) {
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    try {
      // Verify JWT token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
      const { payload } = await jwtVerify(token, secret)
      
      const userRole = payload.role as string
      const userId = payload.sub as string
      
      // Check role-based access for protected routes
      if (isProtectedRoute) {
        const matchedRoute = Object.keys(PROTECTED_ROUTES).find(route =>
          pathname.startsWith(route)
        ) as keyof typeof PROTECTED_ROUTES
        
        const requiredRoles = PROTECTED_ROUTES[matchedRoute]
        
        if (!requiredRoles.includes(userRole as any)) {
          // User doesn't have required role, redirect to appropriate dashboard
          if (userRole === 'USER') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
          } else if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
            // Admin trying to access user route or insufficient permissions
            if (pathname.startsWith('/dashboard') && !pathname.startsWith('/admin')) {
              return NextResponse.redirect(new URL('/admin', request.url))
            }
            // For other unauthorized routes, show 403
            return NextResponse.redirect(new URL('/403', request.url))
          }
        }
      }
      
      // Check role-based access for API routes
      if (isProtectedApiRoute) {
        const matchedRoute = Object.keys(PROTECTED_API_ROUTES).find(route =>
          pathname.startsWith(route)
        ) as keyof typeof PROTECTED_API_ROUTES
        
        const requiredRoles = PROTECTED_API_ROUTES[matchedRoute]
        
        if (!requiredRoles.includes(userRole as any)) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          )
        }
      }
      
      // Add user info to headers for API routes
      if (pathname.startsWith('/api')) {
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-user-id', userId)
        requestHeaders.set('x-user-role', userRole)
        
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      }
      
      // Allow access
      return NextResponse.next()
    } catch (error) {
      console.error('Token verification error:', error)
      
      // Token is invalid, redirect to login
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { error: 'Invalid authentication' },
          { status: 401 }
        )
      }
      
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // Allow all other routes
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth routes (authentication endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|api/auth/request-otp|api/auth/verify-otp).*)',
  ],
}