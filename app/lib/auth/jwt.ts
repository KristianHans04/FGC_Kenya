/**
 * @file lib/auth/jwt.ts
 * @description JWT token generation and verification utilities using jose
 * @author Team Kenya Dev
 */

import { SignJWT, jwtVerify } from 'jose'
import prisma from '@/app/lib/db'
import type { JWTPayload, UserRole } from '@/app/types/auth'

/**
 * JWT configuration constants
 */
export const JWT_CONFIG = {
  /** Access token expiry (15 minutes) */
  ACCESS_TOKEN_EXPIRY: '15m',
  /** Refresh token expiry (7 days) */
  REFRESH_TOKEN_EXPIRY: '7d',
  /** Access token expiry in seconds */
  ACCESS_TOKEN_EXPIRY_SECONDS: 15 * 60,
  /** Refresh token expiry in seconds */
  REFRESH_TOKEN_EXPIRY_SECONDS: 7 * 24 * 60 * 60,
  /** Algorithm for signing */
  ALGORITHM: 'HS256' as const,
} as const

/**
 * Get JWT secret as Uint8Array for jose
 * @throws Error if JWT_SECRET is not configured
 */
function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured')
  }
  return new TextEncoder().encode(secret)
}

/**
 * Hash a token using Web Crypto API
 * @param token - Token to hash
 * @returns Hashed token as hex string
 */
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate a random refresh token
 * @returns Secure random token string
 */
function generateRefreshToken(): string {
  // Generate random token using Web Crypto API (Edge-compatible)
  const array = new Uint8Array(64)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Create access and refresh tokens for a user
 * @param userId - User ID
 * @param email - User email
 * @param role - User role
 * @param sessionId - Session ID
 * @returns Object containing access token, refresh token, and expiry
 */
export async function generateTokens(
  userId: string,
  email: string,
  role: UserRole,
  sessionId: string
): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
  const secret = getJWTSecret()

  const payload = {
    userId,
    email,
    roles: [{ role: role as any, cohort: null }],
    sessionId,
  }

  const accessToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_CONFIG.ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret)

  const refreshToken = generateRefreshToken()
  
  const expiresAt = new Date(
    Date.now() + JWT_CONFIG.ACCESS_TOKEN_EXPIRY_SECONDS * 1000
  )

  return { accessToken, refreshToken, expiresAt }
}

/**
 * Verify and decode a JWT access token
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getJWTSecret()
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [JWT_CONFIG.ALGORITHM],
    })

    // Cast payload to our JWTPayload type
    return payload as unknown as JWTPayload
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        console.debug('Token expired')
      } else {
        console.debug('Invalid token:', error.message)
      }
    }
    return null
  }
}

/**
 * Create a new session for a user
 * @param userId - User ID
 * @param userAgent - Browser/client user agent
 * @param ipAddress - Client IP address
 * @returns Session with tokens
 */
export async function createSession(
  userId: string,
  email: string,
  role: UserRole,
  userAgent?: string,
  ipAddress?: string
): Promise<{
  session: { id: string; expiresAt: Date }
  accessToken: string
  refreshToken: string
}> {
  // Calculate session expiry (same as refresh token)
  const sessionExpiresAt = new Date(
    Date.now() + JWT_CONFIG.REFRESH_TOKEN_EXPIRY_SECONDS * 1000
  )

  // Create session record first to get ID
  const session = await prisma.session.create({
    data: {
      userId,
      token: 'pending', // Will be updated
      refreshToken: 'pending', // Will be updated
      userAgent,
      ipAddress,
      expiresAt: sessionExpiresAt,
    },
  })

  // Generate tokens with session ID
  const { accessToken, refreshToken, expiresAt } = await generateTokens(
    userId,
    email,
    role,
    session.id
  )

  // Update session with actual tokens
  await prisma.session.update({
    where: { id: session.id },
    data: {
      token: accessToken,
      refreshToken: await hashToken(refreshToken),
    },
  })

  return {
    session: { id: session.id, expiresAt },
    accessToken,
    refreshToken,
  }
}

/**
 * Validate a session by token
 * @param sessionId - Session ID from JWT
 * @returns Session if valid, null otherwise
 */
export async function validateSession(
  sessionId: string
): Promise<{ userId: string; isValid: boolean } | null> {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        userId: true,
        isValid: true,
        expiresAt: true,
      },
    })

    if (!session) {
      return null
    }

    // Check if session is valid and not expired
    if (!session.isValid || session.expiresAt < new Date()) {
      return null
    }

    return { userId: session.userId, isValid: session.isValid }
  } catch (error) {
    console.error('Session validation error:', error)
    return null
  }
}

/**
 * Refresh tokens using a valid refresh token
 * @param refreshToken - Refresh token string
 * @returns New tokens and session info, or null if invalid
 */
export async function refreshTokens(
  refreshToken: string
): Promise<{
  accessToken: string
  refreshToken: string
  expiresAt: Date
} | null> {
  try {
    // Hash the refresh token to compare with stored value
    const hashedToken = await hashToken(refreshToken)

    // Find session with this refresh token
    const session = await prisma.session.findFirst({
      where: {
        refreshToken: hashedToken,
        isValid: true,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: { 
            id: true, 
            email: true,
            role: true,
          },
        },
      },
    })

    if (!session) {
      return null
    }

    // Generate new tokens
    const tokens = await generateTokens(
      session.userId,
      session.user.email,
      (session.user.role || 'USER') as UserRole,
      session.id
    )

    // Update session with new tokens
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: tokens.accessToken,
        refreshToken: await hashToken(tokens.refreshToken),
        updatedAt: new Date(),
      },
    })

    return tokens
  } catch (error) {
    console.error('Token refresh error:', error)
    return null
  }
}

/**
 * Invalidate a session (logout)
 * @param sessionId - Session ID to invalidate
 */
export async function invalidateSession(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { isValid: false },
  })
}

/**
 * Invalidate all sessions for a user
 * @param userId - User ID
 */
export async function invalidateAllSessions(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId },
    data: { isValid: false },
  })
}

/**
 * Clean up expired sessions (for scheduled cleanup)
 * @returns Number of deleted sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { isValid: false },
      ],
    },
  })
  
  return result.count
}