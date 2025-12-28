/**
 * @file lib/auth/otp.ts
 * @description OTP generation and verification utilities
 * @author Team Kenya Dev
 */

import crypto from 'crypto'
import prisma from '@/app/lib/db'
import type { OTPType as OTPTypeEnum } from '@/app/types/auth'

/**
 * OTP configuration constants
 */
export const OTP_CONFIG = {
  /** Length of OTP code */
  LENGTH: 6,
  /** OTP expiry time in minutes */
  EXPIRY_MINUTES: 10,
  /** Maximum verification attempts before lockout */
  MAX_ATTEMPTS: 5,
  /** Cooldown period between OTP requests in seconds */
  COOLDOWN_SECONDS: 60,
  /** Maximum OTPs per email per hour */
  MAX_OTPS_PER_HOUR: 5,
} as const

/**
 * Generate a cryptographically secure OTP code
 * @returns 6-digit OTP string
 */
export function generateOTPCode(): string {
  // Generate random bytes and convert to number
  const buffer = crypto.randomBytes(4)
  const num = buffer.readUInt32BE(0)
  
  // Get 6 digits from the number
  const otp = (num % 1000000).toString().padStart(OTP_CONFIG.LENGTH, '0')
  
  return otp
}

/**
 * Hash OTP code for secure storage
 * @param code - Plain OTP code
 * @returns Hashed OTP code
 */
export function hashOTP(code: string): string {
  return crypto
    .createHash('sha256')
    .update(code + process.env.JWT_SECRET)
    .digest('hex')
}

/**
 * Verify OTP code against hash
 * @param code - Plain OTP code
 * @param hash - Stored hash
 * @returns Boolean indicating match
 */
export function verifyOTPHash(code: string, hash: string): boolean {
  const inputHash = hashOTP(code)
  // Check if hash lengths match before comparing
  if (inputHash.length !== hash.length) {
    return false
  }
  return crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(hash))
}

/**
 * Calculate OTP expiry time
 * @returns Date object for expiry
 */
export function calculateOTPExpiry(): Date {
  const expiry = new Date()
  expiry.setMinutes(expiry.getMinutes() + OTP_CONFIG.EXPIRY_MINUTES)
  return expiry
}

/**
 * Check if user can request a new OTP (rate limiting)
 * @param userId - User ID
 * @returns Object with canRequest boolean and waitSeconds if rate limited
 */
export async function canRequestOTP(
  userId: string
): Promise<{ canRequest: boolean; waitSeconds?: number; reason?: string }> {
  const now = new Date()
  
  // Check for recent OTP (cooldown)
  const recentOTP = await prisma.oTPCode.findFirst({
    where: {
      userId,
      createdAt: {
        gte: new Date(now.getTime() - OTP_CONFIG.COOLDOWN_SECONDS * 1000),
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (recentOTP) {
    const timeSinceCreation = Math.floor(
      (now.getTime() - recentOTP.createdAt.getTime()) / 1000
    )
    const waitSeconds = OTP_CONFIG.COOLDOWN_SECONDS - timeSinceCreation
    
    return {
      canRequest: false,
      waitSeconds,
      reason: `Please wait ${waitSeconds} seconds before requesting a new code`,
    }
  }

  // Check hourly limit
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const hourlyCount = await prisma.oTPCode.count({
    where: {
      userId,
      createdAt: { gte: oneHourAgo },
    },
  })

  if (hourlyCount >= OTP_CONFIG.MAX_OTPS_PER_HOUR) {
    return {
      canRequest: false,
      reason: 'Too many OTP requests. Please try again in an hour.',
    }
  }

  return { canRequest: true }
}

/**
 * Create and store a new OTP code for a user
 * @param userId - User ID
 * @param type - OTP type (LOGIN, VERIFY_EMAIL, etc.)
 * @returns The plain OTP code (to be sent via email)
 */
export async function createOTP(
  userId: string,
  type: OTPTypeEnum = 'LOGIN' as OTPTypeEnum
): Promise<string> {
  // Generate plain OTP
  const plainCode = generateOTPCode()
  
  // Hash for storage
  const hashedCode = hashOTP(plainCode)
  
  // Invalidate any existing unused OTPs of the same type
  await prisma.oTPCode.updateMany({
    where: {
      userId,
      type: type as 'LOGIN' | 'VERIFY_EMAIL' | 'ACCOUNT_RECOVERY',
      used: false,
    },
    data: { used: true },
  })

  // Create new OTP record
  await prisma.oTPCode.create({
    data: {
      userId,
      code: hashedCode,
      type: type as 'LOGIN' | 'VERIFY_EMAIL' | 'ACCOUNT_RECOVERY',
      expiresAt: calculateOTPExpiry(),
    },
  })

  return plainCode
}

/**
 * Verify an OTP code for a user
 * @param userId - User ID
 * @param code - Plain OTP code to verify
 * @param type - Expected OTP type
 * @returns Object with success status and error message if failed
 */
export async function verifyOTP(
  userId: string,
  code: string,
  type: OTPTypeEnum = 'LOGIN' as OTPTypeEnum
): Promise<{ success: boolean; error?: string }> {
  const now = new Date()
  
  // Find the most recent unused OTP of the given type
  const otpRecord = await prisma.oTPCode.findFirst({
    where: {
      userId,
      type: type as 'LOGIN' | 'VERIFY_EMAIL' | 'ACCOUNT_RECOVERY',
      used: false,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!otpRecord) {
    return { success: false, error: 'No valid OTP found. Please request a new code.' }
  }

  // Check max attempts
  if (otpRecord.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
    // Mark as used to prevent further attempts
    await prisma.oTPCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    })
    
    return {
      success: false,
      error: 'Maximum verification attempts exceeded. Please request a new code.',
    }
  }

  // Verify the code
  const isValid = verifyOTPHash(code, otpRecord.code)

  if (!isValid) {
    // Increment attempts
    await prisma.oTPCode.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    })
    
    const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - otpRecord.attempts - 1
    
    return {
      success: false,
      error: `Invalid OTP code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
    }
  }

  // Mark OTP as used
  await prisma.oTPCode.update({
    where: { id: otpRecord.id },
    data: {
      used: true,
      usedAt: now,
    },
  })

  return { success: true }
}

/**
 * Clean up expired OTP codes (for scheduled cleanup)
 * @returns Number of deleted records
 */
export async function cleanupExpiredOTPs(): Promise<number> {
  const result = await prisma.oTPCode.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { used: true, usedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      ],
    },
  })
  
  return result.count
}
