/**
 * @file app/components/ImpersonationHeader.tsx
 * @description Sticky header shown when impersonating a user
 * @author Team Kenya Dev
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, AlertTriangle, UserX } from 'lucide-react'

export default function ImpersonationHeader() {
  const router = useRouter()
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [originalEmail, setOriginalEmail] = useState<string | null>(null)
  const [stopping, setStopping] = useState(false)

  useEffect(() => {
    // Check cookies to see if we're impersonating
    const checkImpersonation = () => {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = decodeURIComponent(value || '')
        return acc
      }, {} as Record<string, string>)

      setIsImpersonating(cookies.impersonating === 'true')
      setOriginalEmail(cookies.original_email || null)
    }

    checkImpersonation()

    // Check on focus (in case cookies changed in another tab)
    window.addEventListener('focus', checkImpersonation)
    
    return () => {
      window.removeEventListener('focus', checkImpersonation)
    }
  }, [])

  const handleStopImpersonation = async () => {
    if (stopping) return
    
    setStopping(true)
    try {
      // Use any userId for the route parameter (it's not used in DELETE)
      const response = await fetch('/api/admin/users/current/impersonate', {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        // Clear impersonation cookies
        document.cookie = 'impersonating=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie = 'original_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        
        // Redirect to login (since we can't restore the original session securely)
        // The user will need to log back in as their original account
        router.push('/login?message=Impersonation ended. Please log in again.')
        router.refresh()
      } else {
        console.error('Failed to stop impersonation')
        setStopping(false)
      }
    } catch (error) {
      console.error('Error stopping impersonation:', error)
      setStopping(false)
    }
  }

  if (!isImpersonating) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-500 dark:bg-yellow-600 text-white shadow-lg animate-in slide-in-from-top duration-300">
      <div className="max-w-screen-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-yellow-600 dark:bg-yellow-700 px-3 py-1 rounded-full">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-semibold text-sm">IMPERSONATION MODE</span>
            </div>
            <div className="text-sm">
              <span>You are currently impersonating a user. </span>
              {originalEmail && (
                <span className="font-medium">
                  Your real account: <span className="underline">{originalEmail}</span>
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={handleStopImpersonation}
            disabled={stopping}
            className="flex items-center gap-2 bg-white dark:bg-gray-900 text-yellow-600 dark:text-yellow-400 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {stopping ? (
              <>
                <div className="h-4 w-4 border-2 border-yellow-600 dark:border-yellow-400 border-t-transparent rounded-full animate-spin" />
                Stopping...
              </>
            ) : (
              <>
                <UserX className="h-4 w-4" />
                Stop Impersonating
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Warning bar */}
      <div className="bg-yellow-600 dark:bg-yellow-700 px-4 py-1 text-xs text-center">
        ⚠️ All actions taken in this mode will be performed as the impersonated user. Be careful!
      </div>
    </div>
  )
}