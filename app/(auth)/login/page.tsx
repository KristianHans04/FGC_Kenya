/**
 * @file app/(auth)/login/page.tsx
 * @description Login page with robust split layout, constrained form, and 60/30/10 color rule
 * @author Team Kenya Dev
 */

'use client'

import { useState, useEffect } from 'react'
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
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // Don't render the login form if already authenticated
  if (isAuthenticated) {
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
      const redirectUrl = await verifyOTP(email, otp)
      setSuccess(SUCCESS_MESSAGES.AUTHENTICATION.LOGIN_SUCCESS)
      setTimeout(() => {
        router.push(redirectUrl || '/dashboard')
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
    <div className="min-h-screen w-full flex bg-background overflow-hidden">
      {/* 
        Left Panel - Brand Visuals (60% of screen on desktop)
        Dominant Color: Kenya Black/Dark Theme
      */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 relative bg-kenya-black flex-col justify-between p-12 text-white overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-kenya-green/20 via-kenya-black to-kenya-red/20"></div>
          <div className="absolute inset-0 african-pattern opacity-10 mix-blend-overlay"></div>
          {/* Animated Blobs */}
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-kenya-green/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-kenya-red/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <Image
              src="/images/FGC_Logo.svg"
              alt="FIRST Global Team Kenya"
              width={180}
              height={60}
              className="h-16 w-auto brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
              priority
            />
          </Link>
        </div>

        <div className="relative z-10 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl font-bold font-heading mb-6 leading-tight tracking-tight">
              Inspiring the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">STEM</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed max-w-lg">
              Join Team Kenya's journey in the <i>FIRST</i> Global Challenge. 
              Together, we are building a brighter future through robotics, innovation, and collaboration.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 text-sm text-gray-500 font-medium">
          &copy; {new Date().getFullYear()} FIRST Global Team Kenya
        </div>
      </div>

      {/* 
        Right Panel - Login Form (40% of screen on desktop)
        Secondary Color: White/Light Gray (Surface)
        Accent Color: Kenya Green (Buttons)
      */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-background relative">
        {/* Mobile Background (Visible only on small screens) */}
        <div className="absolute inset-0 z-0 lg:hidden">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
        </div>

        {/* Constrained Form Container */}
        <div className="w-full max-w-[400px] space-y-8 relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/images/FGC_Logo.svg"
                alt="FIRST Global Team Kenya"
                width={150}
                height={50}
                className="h-12 w-auto mx-auto"
                priority
              />
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold font-heading text-foreground tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-2 text-muted-foreground">
              Please enter your details to sign in
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
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
                        className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-background focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none"
                        placeholder="name@example.com"
                        disabled={isLoading}
                      />
                    </div>
                    {emailError && (
                      <p className="text-xs text-red-500 font-medium ml-1">{emailError}</p>
                    )}
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center space-x-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800"
                    >
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{error}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white bg-kenya-green hover:bg-green-700 shadow-lg shadow-green-900/20 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none font-semibold tracking-wide"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Sending Code...
                      </>
                    ) : (
                      <>
                        Continue with Email
                        <ArrowRight className="ml-2 h-5 w-5" />
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
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 ring-4 ring-primary/5">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Verification Code</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter the 6-digit code sent to <br />
                    <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleOTPSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="block w-full text-center py-4 border border-border rounded-xl bg-background focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none text-3xl font-mono tracking-[0.5em] placeholder:tracking-normal font-bold"
                      placeholder="000000"
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center space-x-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800"
                    >
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{error}</span>
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center space-x-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800"
                    >
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{success}</span>
                    </motion.div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleBackToEmail}
                      className="flex-1 py-3.5 px-4 border border-border rounded-xl hover:bg-muted/50 transition-colors text-sm font-medium"
                      disabled={isLoading}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || otp.length !== 6}
                      className="flex-[2] flex items-center justify-center py-3.5 px-4 rounded-xl text-white bg-kenya-green hover:bg-green-700 shadow-lg shadow-green-900/20 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none font-semibold tracking-wide"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5 mr-2" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify & Login
                          <Shield className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6 text-center">
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

          <div className="pt-6 border-t border-border/50 text-center lg:text-left">
            <p className="text-sm text-muted-foreground">
              New to Team Kenya?{' '}
              <Link href="/join" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                Apply to join
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}