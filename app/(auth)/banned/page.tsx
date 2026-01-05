'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  AlertTriangle, 
  Calendar, 
  User, 
  MessageCircle, 
  LogOut,
  Heart,
  Coffee,
  Smile
} from 'lucide-react'

interface BanDetails {
  bannedAt: string
  bannedBy: {
    email: string
    firstName?: string
    lastName?: string
  }
  reason: string
  expiresAt?: string
}

const inspirationalQuotes = [
  "Every setback is a setup for a comeback.",
  "Sometimes you win, sometimes you learn.",
  "The road to success is always under construction.",
  "Mistakes are proof that you're trying.",
  "A smooth sea never made a skilled sailor.",
  "Fall seven times, stand up eight.",
  "Your current situation is not your final destination.",
  "Every expert was once a beginner.",
  "The comeback is always stronger than the setback.",
  "Growth begins at the end of your comfort zone."
]

export default function BannedPage() {
  const router = useRouter()
  const [banDetails, setBanDetails] = useState<BanDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [quote, setQuote] = useState(inspirationalQuotes[0])

  useEffect(() => {
    // Set random quote on client side only
    setQuote(inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)])
    fetchBanDetails()
  }, [])

  const fetchBanDetails = async () => {
    try {
      const response = await fetch('/api/auth/ban-status', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.banned && data.details) {
          setBanDetails(data.details)
        } else {
          // User not actually banned, redirect to dashboard
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.error('Failed to fetch ban details:', error)
      // Use mock data for development
      setBanDetails({
        bannedAt: new Date().toISOString(),
        bannedBy: {
          email: 'admin@fgckenya.com',
          firstName: 'System',
          lastName: 'Administrator'
        },
        reason: 'Violation of community guidelines'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      router.push('/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="animate-pulse">
          <Shield className="h-16 w-16 text-muted-foreground" />
        </div>
      </div>
    )
  }

  const bannerName = banDetails?.bannedBy.firstName && banDetails?.bannedBy.lastName
    ? `${banDetails.bannedBy.firstName} ${banDetails.bannedBy.lastName}`
    : banDetails?.bannedBy.email

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/20 to-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 p-8 text-center border-b border-border">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-500/20 mb-4"
            >
              <Shield className="h-12 w-12 text-orange-600 dark:text-orange-400" />
            </motion.div>
            
            <h1 className="text-3xl font-bold mb-2">Account Temporarily Restricted</h1>
            <p className="text-muted-foreground">We need to talk about your account status</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Friendly message */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <Coffee className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Hey there!</p>
                  <p className="text-sm text-muted-foreground">
                    Sometimes we all need a little timeout to reflect and come back stronger. 
                    Think of this as a coffee break for your account!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Ban details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Restricted on:</span>
                <span className="font-medium">
                  {banDetails && new Date(banDetails.bannedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Restricted by:</span>
                <span className="font-medium">{bannerName}</span>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">Reason:</span>
                <span className="font-medium flex-1">{banDetails?.reason || 'No reason provided'}</span>
              </div>

              {banDetails?.expiresAt && (
                <div className="flex items-center gap-3 text-sm">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Good news! Access returns:</span>
                  <span className="font-medium">
                    {new Date(banDetails.expiresAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Inspirational quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 text-center"
            >
              <Smile className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="text-lg font-medium italic">"{quote}"</p>
              <p className="text-sm text-muted-foreground mt-2">Stay positive!</p>
            </motion.div>

            {/* Support message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-muted/50 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1">Think this was a mistake?</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    We're humans too, and sometimes we make errors. If you believe this restriction 
                    was applied incorrectly, please reach out to our support team. We're here to help!
                  </p>
                  <Link
                    href="mailto:support@fgckenya.com?subject=Account Restriction Appeal"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contact Support Team
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-3 pt-4"
            >
              <button
                onClick={handleLogout}
                className="flex-1 btn-outline flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
              <Link
                href="/"
                className="flex-1 btn-primary text-center"
              >
                Visit Homepage
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Footer message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-muted-foreground mt-6"
        >
          Remember: Every champion has faced challenges. This is just part of your journey!
        </motion.p>
      </motion.div>
    </div>
  )
}