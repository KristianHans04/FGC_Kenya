/**
 * @file components/auth/RoleGuards.tsx
 * @description Role-based authentication guard components
 * @author Team Kenya Dev
 */

'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import { Role } from '@/app/types/auth'
import LoadingSpinner from '@/app/components/LoadingSpinner'

interface RoleGuardProps {
  children: ReactNode
  roles?: Role[]
  cohort?: string
  redirectTo?: string
  fallback?: ReactNode
}

/**
 * Base role guard component
 */
function RoleGuard({
  children,
  roles,
  cohort,
  redirectTo = '/login',
  fallback
}: RoleGuardProps) {
  const { user, isLoading, isAuthenticated, hasRole, hasAnyRole } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the attempted path for redirect after login
      sessionStorage.setItem('redirectAfterLogin', pathname)
      router.push(redirectTo)
    } else if (!isLoading && isAuthenticated && roles && user) {
      // Check if user has required role
      const hasRequiredRole = cohort 
        ? roles.some(role => hasRole(role, cohort))
        : hasAnyRole(roles)
      
      if (!hasRequiredRole) {
        // User doesn't have required role
        router.push('/unauthorized')
      }
    }
  }, [isLoading, isAuthenticated, user, roles, cohort, router, pathname, redirectTo, hasRole, hasAnyRole])

  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Check role if specified
  if (roles && user) {
    const hasRequiredRole = cohort 
      ? roles.some(role => hasRole(role, cohort))
      : hasAnyRole(roles)
    
    if (!hasRequiredRole) {
      return null
    }
  }

  // All checks passed
  return <>{children}</>
}

/**
 * Super Admin only guard
 */
export function SuperAdminGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard roles={[Role.SUPER_ADMIN]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * Admin or Super Admin guard
 */
export function AdminGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard roles={[Role.ADMIN, Role.SUPER_ADMIN]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * Mentor guard (optionally for specific cohort)
 */
export function MentorGuard({ 
  children, 
  cohort,
  fallback 
}: { 
  children: ReactNode
  cohort?: string
  fallback?: ReactNode 
}) {
  return (
    <RoleGuard roles={[Role.MENTOR]} cohort={cohort} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * Student guard (optionally for specific cohort)
 */
export function StudentGuard({ 
  children, 
  cohort,
  fallback 
}: { 
  children: ReactNode
  cohort?: string
  fallback?: ReactNode 
}) {
  return (
    <RoleGuard roles={[Role.STUDENT]} cohort={cohort} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * Alumni guard
 */
export function AlumniGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard roles={[Role.ALUMNI]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * Cohort member guard (mentor or student)
 */
export function CohortMemberGuard({ 
  children, 
  cohort,
  fallback 
}: { 
  children: ReactNode
  cohort: string
  fallback?: ReactNode 
}) {
  return (
    <RoleGuard roles={[Role.MENTOR, Role.STUDENT]} cohort={cohort} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

/**
 * Any authenticated user guard
 */
export function AuthenticatedGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', pathname)
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router, pathname])

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

/**
 * Permission-based guard
 */
export function PermissionGuard({ 
  children, 
  permission,
  fallback 
}: { 
  children: ReactNode
  permission: string
  fallback?: ReactNode 
}) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkPermission = async () => {
      if (!isLoading && !isAuthenticated) {
        sessionStorage.setItem('redirectAfterLogin', pathname)
        router.push('/login')
      } else if (!isLoading && isAuthenticated && user) {
        // Check if user has permission
        const { hasPermission } = await import('@/app/types/auth')
        const hasRequiredPermission = user.currentRole && 
          hasPermission(user.currentRole, permission)
        
        if (!hasRequiredPermission) {
          router.push('/unauthorized')
        }
      }
    }
    
    checkPermission()
  }, [isLoading, isAuthenticated, user, permission, router, pathname])

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return <>{children}</>
}

/**
 * Dynamic role guard - checks at runtime
 */
export function DynamicRoleGuard({ 
  children, 
  allowedRoles,
  cohort,
  fallback,
  unauthorizedFallback 
}: { 
  children: ReactNode
  allowedRoles: Role[] | ((user: any) => boolean)
  cohort?: string
  fallback?: ReactNode
  unauthorizedFallback?: ReactNode
}) {
  const { user, isLoading, isAuthenticated, hasRole, hasAnyRole } = useAuth()

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return unauthorizedFallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Not Authenticated</h2>
          <p className="text-muted-foreground">Please log in to access this content.</p>
        </div>
      </div>
    )
  }

  // Check authorization
  let isAuthorized = false
  
  if (typeof allowedRoles === 'function') {
    isAuthorized = allowedRoles(user)
  } else {
    isAuthorized = cohort 
      ? allowedRoles.some(role => hasRole(role, cohort))
      : hasAnyRole(allowedRoles)
  }

  if (!isAuthorized) {
    return unauthorizedFallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Unauthorized</h2>
          <p className="text-muted-foreground">You don't have permission to access this content.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}