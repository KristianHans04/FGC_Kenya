/**
 * @file app/login/page.tsx
 * @description Login page with split layout and modern UI
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
    <div className="min-h-screen w-full flex overflow-hidden bg-background">
      {/* Left Panel - Brand & Visuals (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-kenya-black overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-kenya-green/90 via-kenya-black/80 to-kenya-red/90 mix-blend-multiply"></div>
          <div className="absolute inset-0 african-pattern opacity-10"></div>
          {/* Animated decorative blobs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-kenya-green rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-kenya-red rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
          </div>
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <Image
              src="/images/FGC_Logo.svg"
              alt="FIRST Global Team Kenya"
              width={180}
              height={60}
              className="h-16 w-auto brightness-0 invert"
              priority
            />
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold font-heading mb-6 leading-tight">
            Inspiring the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">STEM</span> in Kenya
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Join a community of innovators, creators, and problem solvers. 
            Together, we are building a brighter future through robotics and technology.
          </p>
        </div>

        <div className="relative z-10 text-sm text-gray-400">
          &copy; {new Date().getFullYear()} FIRST Global Team Kenya. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-background relative">
        {/* Mobile Background Elements */}
        <div className="absolute inset-0 z-0 lg:hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
        </div>

        <div className="w-full max-w-md space-y-8 relative z-10">
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
            <h1 className="text-3xl font-bold font-heading text-foreground">
              Welcome Back
            </h1>
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
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-background focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none"
                        placeholder="name@example.com"
                        disabled={isLoading}
                      />
                    </div>
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
                    className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white bg-kenya-green hover:bg-green-700 shadow-lg shadow-green-900/20 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none font-medium"
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
                  <h2 className="text-lg font-semibold text-foreground">Enter Verification Code</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    We sent a 6-digit code to <br />
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
                      className="block w-full text-center py-4 border border-border rounded-xl bg-background focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none text-3xl font-mono tracking-[0.5em] placeholder:tracking-normal"
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
                      className="flex-1 py-3.5 px-4 border border-border rounded-xl hover:bg-muted/50 transition-colors text-sm font-medium"
                      disabled={isLoading}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || otp.length !== 6}
                      className="flex-[2] flex items-center justify-center py-3.5 px-4 rounded-xl text-white bg-kenya-green hover:bg-green-700 shadow-lg shadow-green-900/20 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none font-medium"
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