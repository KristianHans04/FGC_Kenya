'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Mail, Shield, ArrowLeft, AlertCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import { VALIDATION, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/app/lib/constants'
import OTPVerification from '@/app/components/auth/OTPVerification'
import { getDashboardRoute } from '@/app/lib/constants/navigation'
import { handleAuthRedirect, logAuthError } from '@/app/lib/utils/auth-errors'
import { OTP_CONFIG } from '@/app/lib/auth/otp'

export default function LoginPage() {
  
  useEffect(() => {
    document.title = 'Login | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Sign in to your FIRST Global Team Kenya account')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Sign in to your FIRST Global Team Kenya account'
      document.head.appendChild(meta)
    }
  }, [])

  // Initialize state with default values, load from sessionStorage in useEffect
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [emailError, setEmailError] = useState('')
  const [otpSentAt, setOtpSentAt] = useState<number | undefined>(undefined)
  const [isHydrated, setIsHydrated] = useState(false)
  const { login, verifyOTP, isAuthenticated, user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Load state from sessionStorage after hydration
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('otp_email')
    const storedStep = sessionStorage.getItem('otp_step') as 'email' | 'otp'
    const storedOtpSentAt = sessionStorage.getItem('otp_sent_at')
    
    if (storedEmail) setEmail(storedEmail)
    if (storedStep) setStep(storedStep)
    if (storedOtpSentAt) setOtpSentAt(parseInt(storedOtpSentAt, 10))
    
    setIsHydrated(true)
  }, [])

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (email) {
        sessionStorage.setItem('otp_email', email)
      } else {
        sessionStorage.removeItem('otp_email')
      }
      
      if (step === 'otp') {
        sessionStorage.setItem('otp_step', step)
      } else {
        sessionStorage.removeItem('otp_step')
      }
      
      if (otpSentAt) {
        sessionStorage.setItem('otp_sent_at', otpSentAt.toString())
      } else {
        sessionStorage.removeItem('otp_sent_at')
      }
    }
  }, [email, step, otpSentAt])

  // Check if OTP is still valid on mount
  useEffect(() => {
    if (step === 'otp' && otpSentAt) {
      const now = Math.floor(Date.now() / 1000)
      const elapsed = now - otpSentAt
      
      // If OTP has expired, reset to email step
      if (elapsed > OTP_CONFIG.EXPIRY_SECONDS) {
        setStep('email')
        setOtpSentAt(undefined)
        // Don't show error on email page - it's confusing
        sessionStorage.removeItem('otp_step')
        sessionStorage.removeItem('otp_sent_at')
      }
    }
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      const dashboardRoute = getDashboardRoute(user.role || 'USER')
      console.log('Redirecting to:', dashboardRoute, 'User role:', user.role)
      router.replace(dashboardRoute)
    }
  }, [isAuthenticated, user, router, authLoading])

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }
  
  // Don't show authenticated state on login page - this might be stale
  // Let the useEffect handle the redirect
  
  // Wait for hydration before showing the form
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  const validateEmail = (email: string) => {
    const emailRegex = VALIDATION.EMAIL
    return emailRegex.test(email)
  }

  const handleEmailSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError('')
    setSuccess('')
    setEmailError('')

    if (!email.trim()) {
      setEmailError('Email is required')
      return
    }

    if (!validateEmail(email)) {
      setEmailError(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL)
      return
    }

    // Check if we already have an active OTP session (even from another tab)
    const storedOtpSentAt = sessionStorage.getItem('otp_sent_at')
    const storedEmail = sessionStorage.getItem('otp_email')
    
    if (storedOtpSentAt && storedEmail === email) {
      const now = Math.floor(Date.now() / 1000)
      const sentAt = parseInt(storedOtpSentAt, 10)
      const elapsed = now - sentAt
      
      // If OTP is still valid, go back to OTP step
      if (elapsed < OTP_CONFIG.EXPIRY_SECONDS) {
        setOtpSentAt(sentAt)
        setStep('otp')
        setSuccess('Your verification code is still active')
        return
      } else {
        // Clear expired session data
        sessionStorage.removeItem('otp_sent_at')
        sessionStorage.removeItem('otp_step')
      }
    }

    setIsLoading(true)

    try {
      const result = await login(email)
      if (result.success && result.data?.otpSentAt) {
        setSuccess(SUCCESS_MESSAGES.AUTHENTICATION.OTP_SENT)
        setOtpSentAt(result.data.otpSentAt)
        setStep('otp')
      } else {
        // Make rate limiting message more user-friendly
        let errorMessage = result.error?.message || ERROR_MESSAGES.AUTHENTICATION.INVALID_CREDENTIALS
        
        // Check if it's a rate limiting error and make it clearer
        if (errorMessage.includes('Please wait')) {
          const match = errorMessage.match(/(\d+) seconds/)
          if (match) {
            errorMessage = `Too soon! Please wait ${match[1]} seconds before requesting a new code.`
          }
        } else if (errorMessage.includes('Too many OTP requests')) {
          errorMessage = 'Too many attempts. Please try again in an hour for security reasons.'
        }
        
        setError(errorMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.AUTHENTICATION.INVALID_CREDENTIALS)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerify = async (otp: string) => {
    setError('')
    setSuccess('')

    try {
      const result = await verifyOTP(email, otp)
      console.log('OTP Verification result:', result)
      
      if (result.success) {
        setSuccess(SUCCESS_MESSAGES.AUTHENTICATION.LOGIN_SUCCESS)
        
        // Clear session storage on successful login
        sessionStorage.removeItem('otp_email')
        sessionStorage.removeItem('otp_step')
        sessionStorage.removeItem('otp_sent_at')
        
        // Get redirect URL from response or determine based on role
        const redirectUrl = result.data?.redirectUrl || 
                          (result.data?.user?.role ? getDashboardRoute(result.data.user.role) : '/dashboard')
        
        console.log('Redirecting to:', redirectUrl)
        
        // Use auth redirect utility for reliable redirection
        setTimeout(() => {
          handleAuthRedirect(redirectUrl, router, '/dashboard')
        }, 500)
      } else {
        const errorMsg = result.error?.message || ERROR_MESSAGES.AUTHENTICATION.OTP_EXPIRED
        console.error('OTP verification failed:', errorMsg)
        setError(errorMsg)
      }
    } catch (err) {
      console.error('OTP verify error:', err)
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.AUTHENTICATION.INVALID_CREDENTIALS)
    }
  }

  const handleResendOTP = async () => {
    setError('')
    setSuccess('')
    
    try {
      const result = await login(email)
      if (result.success && result.data?.otpSentAt) {
        setSuccess('New verification code sent!')
        setOtpSentAt(result.data.otpSentAt)
      } else {
        setError(result.error?.message || 'Failed to resend code')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code')
    }
  }

  const handleBackToEmail = () => {
    setStep('email')
    setError('')
    setSuccess('')
    setOtpSentAt(undefined)
    
    // Clear OTP-related session storage
    sessionStorage.removeItem('otp_step')
    sessionStorage.removeItem('otp_sent_at')
  }

  return (
    <div className="min-h-screen w-full flex bg-background overflow-hidden">
      {/* Left Panel - Brand Visuals (60% of screen on desktop) */}
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

      {/* Right Panel - Login Form (40% of screen on desktop) */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-background relative">
        {/* Mobile Background */}
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-foreground">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setEmailError('')
                        }}
                        className="block w-full pl-11 pr-3 py-3 border border-border rounded-xl bg-background focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none"
                        placeholder="Enter your email"
                        disabled={isLoading}
                      />
                    </div>
                    {emailError && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-sm text-red-600 flex items-center mt-1"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {emailError}
                      </motion.p>
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

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center space-x-3 text-sm text-primary bg-primary/10 p-4 rounded-xl border border-primary/20"
                    >
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{success}</span>
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
              <OTPVerification
                email={email}
                onVerify={handleOTPVerify}
                onResend={handleResendOTP}
                onBack={handleBackToEmail}
                isLoading={isLoading}
                error={error}
                success={success}
                otpSentAt={otpSentAt}
              />
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