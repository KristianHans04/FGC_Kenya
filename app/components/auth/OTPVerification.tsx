'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { Shield, AlertCircle, CheckCircle, Loader2, RefreshCw, Clock } from 'lucide-react'
import { cn } from '@/app/lib/utils/cn'
import { OTP_CONFIG } from '@/app/lib/auth/otp'

interface OTPVerificationProps {
  email: string
  onVerify: (otp: string) => Promise<void>
  onResend: () => Promise<void>
  onBack: () => void
  isLoading?: boolean
  error?: string
  success?: string
  otpSentAt?: number // Unix timestamp from server
}

// Shake animation variants
const shakeAnimation: any = {
  shake: {
    x: [0, -10, 10, -10, 10, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  },
  static: {
    x: 0
  }
}

export default function OTPVerification({
  email,
  onVerify,
  onResend,
  onBack,
  isLoading = false,
  error,
  success,
  otpSentAt
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timeLeft, setTimeLeft] = useState<number>(OTP_CONFIG.EXPIRY_SECONDS)
  const [canResend, setCanResend] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [lastResendTime, setLastResendTime] = useState(0)
  const [isShaking, setIsShaking] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const controls = useAnimation()

  // Shake and reset on error
  useEffect(() => {
    if (error) {
      // Trigger shake animation
      setIsShaking(true)
      controls.start("shake").then(() => {
        setIsShaking(false)
        controls.start("static")
      })
      
      // Clear OTP inputs after a brief delay to show the error
      setTimeout(() => {
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }, 600)
    }
  }, [error, controls])

  // Calculate remaining time from server timestamp
  useEffect(() => {
    if (!otpSentAt) return

    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000)
      const elapsed = now - otpSentAt
      const remaining = Math.max(0, OTP_CONFIG.EXPIRY_SECONDS - elapsed)
      setTimeLeft(remaining)
      
      // Enable resend after cooldown period
      setCanResend(elapsed >= OTP_CONFIG.COOLDOWN_SECONDS)
      
      if (remaining === 0 && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    // Calculate immediately
    calculateTimeLeft()

    // Update every second
    intervalRef.current = setInterval(calculateTimeLeft, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [otpSentAt])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }


  // Handle input change
  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1)
    
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-verify when all 6 digits are entered
    const otpString = newOtp.join('')
    if (otpString.length === 6 && !isLoading) {
      handleVerify(otpString)
    }
  }

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus()
      } else {
        // Clear current input
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      }
    }
  }

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    
    if (pastedData.length > 0) {
      const newOtp = ['', '', '', '', '', '']
      
      pastedData.split('').forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit
      })
      
      setOtp(newOtp)
      
      // Focus last filled input or last input if all filled
      const lastFilledIndex = Math.min(pastedData.length - 1, 5)
      inputRefs.current[lastFilledIndex]?.focus()
      
      // Auto-verify if 6 digits pasted
      if (pastedData.length === 6 && !isLoading) {
        handleVerify(pastedData)
      }
    }
  }

  // Handle verify
  const handleVerify = async (otpString?: string) => {
    const code = otpString || otp.join('')
    if (code.length !== 6) return
    
    await onVerify(code)
  }

  // Handle resend
  const handleResend = async () => {
    if (!canResend || isResending) return
    
    setIsResending(true)
    setOtp(['', '', '', '', '', '']) // Reset OTP inputs
    
    try {
      await onResend()
      setLastResendTime(Date.now())
      setCanResend(false)
      
      // Focus first input after resend
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
      
      // Reset timer will happen when new otpSentAt prop is received
    } finally {
      setIsResending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-card-foreground">Enter Verification Code</h2>
        <div className="mt-4 px-4 py-3 bg-muted rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            Verification code sent to your email
          </p>
          <p className="text-sm font-medium text-card-foreground mt-1">{email}</p>
        </div>
      </div>

      {/* Timer Display */}
      <div className="mb-6">
        <motion.div 
          className={cn(
            "flex items-center justify-center gap-2 px-5 py-2.5 rounded-full mx-auto w-fit",
            "border-2 transition-colors duration-300",
            timeLeft > 120 
              ? "border-primary bg-primary/5" 
              : timeLeft > 60 
                ? "border-accent-dark bg-accent/10" 
                : "border-secondary bg-secondary/10"
          )}
        >
          <Clock className={cn(
            "h-4 w-4 transition-colors duration-300",
            timeLeft > 120 
              ? "text-primary" 
              : timeLeft > 60 
                ? "text-accent-dark" 
                : "text-secondary"
          )} />
          <span className="text-sm font-medium text-card-foreground">
            Code expires in
          </span>
          <span className={cn(
            "text-lg font-mono font-bold transition-colors duration-300",
            timeLeft > 120 
              ? "text-primary" 
              : timeLeft > 60 
                ? "text-accent-dark" 
                : "text-secondary"
          )}>
            {formatTime(timeLeft)}
          </span>
        </motion.div>
        {timeLeft === 0 && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-center text-sm text-secondary mt-3 font-medium"
          >
            Code expired. Please request a new one.
          </motion.p>
        )}
      </div>

      {/* OTP Input Fields */}
      <motion.div 
        className="flex justify-center space-x-2 mb-6"
        animate={controls}
        variants={shakeAnimation}
        initial="static"
      >
        {otp.map((digit, index) => (
          <motion.input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={isLoading || timeLeft === 0}
            autoFocus={index === 0}
            className={cn(
              "w-12 h-14 text-center text-2xl font-bold font-mono",
              "border-2 rounded-lg transition-all duration-200",
              "bg-muted border-border",
              "focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-card",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              // Filled state
              digit && !error && "bg-primary/10 text-card-foreground border-primary",
              // Error state  
              error && "bg-secondary/10 text-card-foreground border-secondary"
            )}
            animate={digit ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.2 }}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </motion.div>

      {/* Error/Success Messages */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <div className="flex items-center space-x-2 text-sm text-secondary bg-secondary/10 p-3 rounded-lg border border-secondary">
              <AlertCircle className="h-4 w-4 shrink-0 animate-pulse" />
              <span className="font-medium text-card-foreground">{error}</span>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <div className="flex items-center space-x-2 text-sm text-primary bg-primary/10 p-3 rounded-lg border border-primary">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span className="font-medium text-card-foreground">{success}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Verify Button */}
        <button
          onClick={() => handleVerify()}
          disabled={isLoading || otp.join('').length !== 6 || timeLeft === 0}
          className={cn(
            "w-full flex items-center justify-center py-3 px-4 rounded-lg",
            "font-semibold transition-all duration-200",
            "bg-primary text-white hover:bg-primary-light",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transform hover:scale-[1.02] active:scale-[0.98]",
            "shadow-md hover:shadow-lg"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Verifying...
            </>
          ) : (
            <>
              <Shield className="h-5 w-5 mr-2" />
              {timeLeft === 0 ? 'Code Expired' : 'Verify & Continue'}
            </>
          )}
        </button>

        {/* Resend Button */}
        <motion.button
          onClick={handleResend}
          disabled={!canResend || isResending || timeLeft === 0}
          className={cn(
            "w-full flex items-center justify-center py-3 px-4 rounded-lg",
            "font-medium transition-all duration-200",
            "bg-muted border-2 border-border",
            "text-muted-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            canResend && !isResending && "hover:bg-muted hover:border-primary hover:text-primary",
            "transform hover:scale-[1.01] active:scale-[0.99]"
          )}
          whileHover={canResend && !isResending ? { scale: 1.01 } : {}}
          whileTap={canResend && !isResending ? { scale: 0.99 } : {}}
        >
          {isResending ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Sending new code...
            </>
          ) : (
            <>
              <RefreshCw className={cn("h-5 w-5 mr-2", canResend && "hover:rotate-180 transition-transform duration-300")} />
              {canResend 
                ? 'Resend Code' 
                : otpSentAt 
                  ? `Resend in ${OTP_CONFIG.COOLDOWN_SECONDS - (Math.floor(Date.now() / 1000) - otpSentAt)}s`
                  : 'Resend Code'
              }
            </>
          )}
        </motion.button>

        {/* Back Button */}
        <button
          onClick={onBack}
          disabled={isLoading}
          className="w-full py-3 px-4 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          ← Back to email
        </button>
      </div>
    </motion.div>
  )
}