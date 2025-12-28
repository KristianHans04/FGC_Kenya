/**
 * @file app/login/page.tsx
 * @description Login page with OTP authentication
 * @author Team Kenya Dev
 */

'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Mail, Shield, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/app/lib/contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { login, verifyOTP, isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/dashboard')
    return null
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      await login(email)
      setSuccess('OTP sent to your email address')
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await verifyOTP(email, otp)
      setSuccess('Login successful! Redirecting...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setStep('email')
    setOtp('')
    setError('')
    setSuccess('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kenya-green/5 via-background to-kenya-black/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center justify-center space-x-2 mb-6" aria-hidden="true">
            <div className="h-1 w-8 bg-kenya-black"></div>
            <div className="h-1 w-8 bg-kenya-red"></div>
            <div className="h-1 w-8 bg-kenya-green"></div>
          </div>

          <h1 className="text-3xl font-bold font-heading mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to your FIRST Global Team Kenya account
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card/80 backdrop-blur-sm border shadow-xl rounded-2xl p-8"
        >
          {step === 'email' ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Enter your email</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  We'll send you a secure login code
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    placeholder="your.email@example.com"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
                  >
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
                  </motion.div>
                )}

                 <button
                   type="submit"
                   disabled={isLoading || !email.trim()}
                   className="w-auto px-6 py-2 mx-auto block btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Login Code
                      <Mail className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Enter your code</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium mb-2 text-center">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background text-center text-2xl font-mono tracking-widest"
                    placeholder="000000"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
                  >
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
                  </motion.div>
                )}

                 <div className="flex justify-center space-x-3">
                   <button
                     type="button"
                     onClick={handleBackToEmail}
                     className="px-6 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                     disabled={isLoading}
                   >
                     <ArrowLeft className="h-4 w-4 mr-2" />
                     Back
                   </button>
                   <button
                     type="submit"
                     disabled={isLoading || otp.length !== 6}
                     className="px-6 py-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Code
                        <Shield className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?{' '}
                  <button
                    onClick={handleEmailSubmit}
                    className="text-primary hover:text-primary/80 font-medium"
                    disabled={isLoading}
                  >
                    Send again
                  </button>
                </p>
              </div>
            </>
          )}

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              New to Team Kenya?{' '}
              <Link href="/join" className="text-primary hover:text-primary/80 font-medium">
                Apply to join
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}