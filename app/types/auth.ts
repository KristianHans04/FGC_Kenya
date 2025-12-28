/**
 * @file auth.ts
 * @description Authentication and user type definitions
 * @author Team Kenya Dev
 */

/**
 * User roles for authorization
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

/**
 * OTP types for different authentication flows
 */
export enum OTPType {
  LOGIN = 'LOGIN',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  ACCOUNT_RECOVERY = 'ACCOUNT_RECOVERY',
}

/**
 * User data structure
 */
export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: UserRole
  isActive: boolean
  emailVerified: boolean
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Safe user data (without sensitive fields) for client-side
 */
export interface SafeUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: UserRole
  emailVerified: boolean
}

/**
 * Session data structure
 */
export interface Session {
  id: string
  token: string
  refreshToken: string | null
  userId: string
  userAgent: string | null
  ipAddress: string | null
  expiresAt: Date
  isValid: boolean
  createdAt: Date
}

/**
 * OTP code data structure
 */
export interface OTPCode {
  id: string
  code: string
  type: OTPType
  userId: string
  expiresAt: Date
  used: boolean
  usedAt: Date | null
  attempts: number
  createdAt: Date
}

/**
 * JWT payload structure
 */
export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  sessionId: string
  iat: number
  exp: number
}

/**
 * Authentication context for components
 */
export interface AuthContextType {
  user: SafeUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string) => Promise<void>
  verifyOTP: (email: string, code: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

/**
 * Request OTP input
 */
export interface RequestOTPInput {
  email: string
  type?: OTPType
}

/**
 * Verify OTP input
 */
export interface VerifyOTPInput {
  email: string
  code: string
}

/**
 * Auth response after successful verification
 */
export interface AuthResponse {
  user: SafeUser
  token: string
  refreshToken: string
  expiresAt: string
}

/**
 * Token refresh input
 */
export interface RefreshTokenInput {
  refreshToken: string
}
