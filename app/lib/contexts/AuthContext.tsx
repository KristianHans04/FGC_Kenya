/**
 * @file app/lib/contexts/AuthContext.tsx
 * @description Authentication context provider for React components
 * @author Team Kenya Dev
 */

'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { AuthContextType, SafeUser } from '@/app/types/auth'

/**
 * Auth context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: ReactNode
}

/**
 * Auth provider component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SafeUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  /**
   * Check authentication status
   */
  const checkAuthStatus = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.user) {
          setUser(data.data.user)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Request OTP for login
   */
  const login = async (email: string): Promise<void> => {
    const response = await fetch('/api/auth/request-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to send OTP')
    }
  }

  /**
   * Verify OTP and complete login
   */
  const verifyOTP = async (email: string, code: string): Promise<void> => {
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, code }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Invalid OTP')
    }

    const data = await response.json()
    setUser(data.data.user)
  }

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
    }
  }

  /**
   * Refresh authentication session
   */
  const refreshSession = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          refreshToken: localStorage.getItem('refresh_token'),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.data.user)
      } else {
        // Refresh failed, logout
        await logout()
      }
    } catch (error) {
      console.error('Session refresh error:', error)
      await logout()
    }
  }

  const hasRole = (role: any): boolean => !!user?.role && user.role === role
  const hasAnyRole = (roles: any[]): boolean => !!user?.role && roles.includes(user.role)
  const isSuperAdmin = (): boolean => user?.role === 'SUPER_ADMIN'
  const isAdmin = (): boolean => user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const isMentor = (): boolean => user?.role === 'MENTOR'
  const isStudent = (): boolean => user?.role === 'STUDENT'
  const isAlumni = (): boolean => user?.role === 'ALUMNI'

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isAdmin,
    isMentor,
    isStudent,
    isAlumni,
    login,
    verifyOTP,
    logout,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// HOC removed - use AuthGuard component from app/components/auth/AuthGuard.tsx instead
