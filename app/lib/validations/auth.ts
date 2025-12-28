/**
 * @file validations/auth.ts
 * @description Zod validation schemas for authentication
 * @author Team Kenya Dev
 */

import { z } from 'zod'

/**
 * Email validation pattern
 * Validates standard email format with additional checks
 */
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/**
 * Kenyan phone number validation pattern
 * Accepts: +254XXXXXXXXX, 07XXXXXXXX, 01XXXXXXXX
 */
const kenyanPhonePattern = /^(\+254|0)[17]\d{8}$/

/**
 * OTP validation pattern (6 digits)
 */
const otpPattern = /^\d{6}$/

/**
 * Request OTP schema
 */
export const requestOTPSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(100, 'Email is too long')
    .regex(emailPattern, 'Please enter a valid email address')
    .transform((val) => val.toLowerCase().trim()),
  type: z
    .enum(['LOGIN', 'VERIFY_EMAIL', 'ACCOUNT_RECOVERY'])
    .optional()
    .default('LOGIN'),
})

export type RequestOTPInput = z.infer<typeof requestOTPSchema>

/**
 * Verify OTP schema
 */
export const verifyOTPSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(100, 'Email is too long')
    .regex(emailPattern, 'Please enter a valid email address')
    .transform((val) => val.toLowerCase().trim()),
  code: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(otpPattern, 'OTP must contain only numbers'),
})

export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>

/**
 * Update user profile schema
 */
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(
      /^[a-zA-Z\s\-']+$/,
      'First name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .optional(),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(
      /^[a-zA-Z\s\-']+$/,
      'Last name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .optional(),
  phone: z
    .string()
    .regex(kenyanPhonePattern, 'Please enter a valid Kenyan phone number')
    .optional()
    .nullable(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'Refresh token is required'),
})

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>

/**
 * Admin update user role schema
 */
export const updateUserRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
})

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
