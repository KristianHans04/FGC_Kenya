/**
 * @file app/components/auth/AuthGuard.tsx
 * @description Client-side authentication guard component for protected routes
 * @author Team Kenya Dev
 */

'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
  requireAuth?: boolean
}

/**
 * AuthGuard component for protecting routes
 * This runs on the client side to avoid middleware performance issues
 */
export default function AuthGuard({
  children,
  allowedRoles = [],
  redirectTo = '/login',
  requireAuth = true
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip during loading
    if (isLoading) return

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      // Save current path for redirect after login
      const url = new URL(redirectTo, window.location.origin)
      url.searchParams.set('redirect', pathname)
      router.push(url.toString())
      return
    }

    // Check role-based access
    if (isAuthenticated && allowedRoles.length > 0 && user) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect based on user role
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname, allowedRoles, redirectTo, requireAuth])

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

  // If authentication is required but user is not authenticated, don't render
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // If role check fails, don't render
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return null
  }

  // Render the protected content
  return <>{children}</>
}

/**
 * Pre-configured AuthGuard for admin routes
 */
export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard
      allowedRoles={['ADMIN', 'SUPER_ADMIN']}
      redirectTo="/login"
    >
      {children}
    </AuthGuard>
  )
}

/**
 * Pre-configured AuthGuard for user routes
 */
export function UserAuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard
      allowedRoles={['USER', 'ADMIN', 'SUPER_ADMIN']}
      redirectTo="/login"
    >
      {children}
    </AuthGuard>
  )
}

/**
 * Pre-configured AuthGuard for any authenticated user
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      {children}
    </AuthGuard>
  )
}