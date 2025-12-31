/**
 * @file app/api/auth/verify-otp/route.ts
 * @description Verify OTP and authenticate user
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyOTPSchema } from '@/app/lib/validations/auth'
import { verifyOTP, createSession } from '@/app/lib/auth'
import { sendWelcomeEmail } from '@/app/lib/email'
import prisma from '@/app/lib/db'
import { rateLimit, addSecurityHeaders } from '@/app/lib/middleware/security'
import type { ApiResponse, ErrorCode } from '@/app/types/api'
import type { SafeUser, AuthResponse } from '@/app/types/auth'

/**
 * POST /api/auth/verify-otp
 * Verify OTP code and authenticate user
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request, 'auth')
    if (rateLimitResult) return rateLimitResult

    // Parse and validate request body
    const body = await request.json()
    const validationResult = verifyOTPSchema.safeParse(body)

    if (!validationResult.success) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR' as ErrorCode,
              message: 'Invalid request data',
              details: validationResult.error.issues,
            },
          },
          { status: 400 }
        )
      )
    }

    const { email, code } = validationResult.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
      },
    })

    if (!user) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'USER_NOT_FOUND' as ErrorCode,
              message: 'User not found',
            },
          },
          { status: 404 }
        )
      )
    }

    if (!user.isActive) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'USER_INACTIVE' as ErrorCode,
              message: 'Account is deactivated',
            },
          },
          { status: 403 }
        )
      )
    }

    // Verify OTP
    const otpResult = await verifyOTP(user.id, code, 'LOGIN' as any)

    if (!otpResult.success) {
      // Create audit log for failed attempt
      await prisma.auditLog.create({
        data: {
          action: 'OTP_FAILED',
          entityType: 'User',
          entityId: user.id,
          details: { error: otpResult.error },
          ipAddress: request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip'),
          userAgent: request.headers.get('user-agent'),
        },
      })

      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_OTP' as ErrorCode,
              message: otpResult.error || 'Invalid OTP code',
            },
          },
          { status: 401 }
        )
      )
    }

    // Create session and tokens
    const { session, accessToken, refreshToken } = await createSession(
      user.id,
      user.email,
      user.role as any,
      request.headers.get('user-agent') || undefined,
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') || undefined
    )

    // Update user last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        emailVerified: true, // Mark email as verified after successful login
      },
    })

    // Send welcome email for new users
    if (!user.lastLoginAt) {
      await sendWelcomeEmail(user.email, user.firstName || user.email.split('@')[0])
    }

    // Create audit log for successful login
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN_SUCCESS',
        entityType: 'User',
        entityId: user.id,
        details: { sessionId: session.id },
        ipAddress: request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    })

    // Create safe user object
    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      school: null,
      role: user.role as any,
      emailVerified: true,
    }

    const authResponse: AuthResponse = {
      user: safeUser,
      token: accessToken,
      refreshToken,
      expiresAt: session.expiresAt.toISOString(),
    }

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: authResponse,
      } as ApiResponse<AuthResponse>)
    )

    // Set secure HTTP-only cookies
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    })

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Verify OTP error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Authentication failed',
          },
        },
        { status: 500 }
      )
    )
  }
}

/**
 * Handle OPTIONS request for CORS
 */
export async function OPTIONS(): Promise<NextResponse> {
  return addSecurityHeaders(new NextResponse(null, { status: 200 }))
}
