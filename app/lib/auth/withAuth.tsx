/**
 * @file app/lib/auth/withAuth.tsx
 * @description Higher-order component for protecting routes with authentication
 * @author Team Kenya Dev
 */

'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface WithAuthOptions {
  allowedRoles?: string[]
  redirectTo?: string
}

/**
 * HOC for protecting routes with authentication
 * @param Component - Component to wrap
 * @param options - Auth options (allowedRoles, redirectTo)
 * @returns Protected component
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  return function ProtectedRoute(props: P) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const { allowedRoles = [], redirectTo = '/login' } = options

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          // Redirect to login with return URL
          const loginUrl = new URL(redirectTo, window.location.origin)
          loginUrl.searchParams.set('redirect', pathname)
          router.push(loginUrl.toString())
        } else if (allowedRoles.length > 0 && user) {
          // Check role-based access
          if (!allowedRoles.includes(user.role)) {
            // Redirect based on user role
            if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
              router.push('/admin')
            } else {
              router.push('/dashboard')
            }
          }
        }
      }
    }, [isLoading, isAuthenticated, user, router, pathname, allowedRoles, redirectTo])

    // Show loading state
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    }

    // User not authenticated
    if (!isAuthenticated) {
      return null
    }

    // User doesn't have required role
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      return null
    }

    // Render the protected component
    return <Component {...props} />
  }
}

/**
 * HOC specifically for admin routes
 */
export function withAdminAuth<P extends object>(Component: React.ComponentType<P>) {
  return withAuth(Component, {
    allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    redirectTo: '/login',
  })
}

/**
 * HOC specifically for user routes
 */
export function withUserAuth<P extends object>(Component: React.ComponentType<P>) {
  return withAuth(Component, {
    allowedRoles: ['USER', 'ADMIN', 'SUPER_ADMIN'],
    redirectTo: '/login',
  })
}