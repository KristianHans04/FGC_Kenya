/**
 * @file app/(auth)/login/page.tsx
 * @description Login page with modern UI and OTP verification
 * @author Team Kenya Dev
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Mail, Shield, ArrowLeft, AlertCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import { VALIDATION, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/app/lib/constants'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [emailError, setEmailError] = useState('')
  const { login, verifyOTP, isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/dashboard')
    return null
  }

  const validateEmail = (): boolean => {
    if (!email) {
      setEmailError(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD)
      return false
    }
    if (!VALIDATION.EMAIL.test(email)) {
      setEmailError(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL)
      return false
    }
    setEmailError('')
    return true
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail()) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      await login(email)
      setSuccess(SUCCESS_MESSAGES.AUTHENTICATION.OTP_SENT)
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.NETWORK.SERVER_ERROR)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!VALIDATION.OTP.test(otp)) {
      setError(ERROR_MESSAGES.VALIDATION.INVALID_OTP)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await verifyOTP(email, otp)
      setSuccess(SUCCESS_MESSAGES.AUTHENTICATION.LOGIN_SUCCESS)
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.AUTHENTICATION.INVALID_CREDENTIALS)
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
    <div className="min-h-screen w-full flex items-center justify-center bg-background py-12 px-4">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card/80 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden border border-border/50"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-kenya-green via-kenya-black to-kenya-red p-1">
            <div className="bg-card p-8 text-center">
              <Link href="/" className="inline-block mb-6">
                <Image
                  src="/images/FGC_Logo.svg"
                  alt="FIRST Global Team Kenya"
                  width={150}
                  height={50}
                  className="h-12 w-auto mx-auto"
                  priority
                />
              </Link>
              <h1 className="text-2xl font-bold font-heading text-foreground mb-2">
                Welcome Back
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in to access your account
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === 'email' ? (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleEmailSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email Address
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            setEmailError('')
                          }}
                          className="block w-full pl-10 pr-3 py-2.5 border border-border rounded-lg bg-background focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none text-sm"
                          placeholder="name@example.com"
                          disabled={isLoading}
                        />
                      </div>
                      {emailError && (
                        <p className="text-xs text-red-600">{emailError}</p>
                      )}
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800"
                      >
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || !email.trim()}
                      className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-white bg-kenya-green hover:bg-green-700 shadow-lg shadow-green-900/20 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none font-medium text-sm"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Sending Code...
                        </>
                      ) : (
                        <>
                          Send Login Code
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-4 ring-4 ring-primary/5">
                      <Shield className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">Enter Verification Code</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      We sent a 6-digit code to
                    </p>
                    <p className="text-sm font-medium text-foreground">{email}</p>
                  </div>

                  <form onSubmit={handleOTPSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="block w-full text-center py-3 border border-border rounded-lg bg-background focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none text-2xl font-mono tracking-[0.5em] placeholder:tracking-normal"
                        placeholder="000000"
                        disabled={isLoading}
                        autoFocus
                      />
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800"
                      >
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800"
                      >
                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{success}</span>
                      </motion.div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={handleBackToEmail}
                        className="flex-1 py-3 px-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium flex items-center justify-center"
                        disabled={isLoading}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || otp.length !== 6}
                        className="flex-[2] flex items-center justify-center py-3 px-4 rounded-lg text-white bg-kenya-green hover:bg-green-700 shadow-lg shadow-green-900/20 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none font-medium text-sm"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify & Login
                            <Shield className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="mt-4 text-center">
                    <button
                      onClick={handleEmailSubmit}
                      className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                      disabled={isLoading}
                    >
                      Resend Code
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-5 border-t border-border/50 text-center">
              <p className="text-sm text-muted-foreground">
                New to Team Kenya?{' '}
                <Link href="/signup" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}