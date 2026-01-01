/**
 * @file app/api/auth/request-otp/route.ts
 * @description Request OTP for authentication
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { requestOTPSchema } from '@/app/lib/validations/auth'
import { canRequestOTP, createOTP, OTP_CONFIG } from '@/app/lib/auth/otp'
import type { OTPType } from '@/app/types/auth'
import { sendOTPEmail } from '@/app/lib/email'
import prisma from '@/app/lib/db'
import { rateLimit, addSecurityHeaders } from '@/app/lib/middleware/security'
import type { ApiResponse, ErrorCode } from '@/app/types/api'

/**
 * POST /api/auth/request-otp
 * Request an OTP code for authentication
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request, 'auth')
    if (rateLimitResult) return rateLimitResult

    // Parse and validate request body
    const body = await request.json()
    const validationResult = requestOTPSchema.safeParse(body)

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

    const { email } = validationResult.data

    // Check if user exists or create them
    let user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, isActive: true, emailVerified: true },
    })

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: { email },
        select: { id: true, isActive: true, emailVerified: true },
      })
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

    // Check if user can request OTP
    const rateLimitCheck = await canRequestOTP(user.id)
    if (!rateLimitCheck.canRequest) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMITED' as ErrorCode,
              message: rateLimitCheck.reason || 'Too many requests',
            },
          },
          { status: 429 }
        )
      )
    }

    // Generate and store OTP
    const otpCode = await createOTP(user.id, 'LOGIN' as OTPType)
    
    // Record timestamp when OTP was sent
    const otpSentAt = Math.floor(Date.now() / 1000) // Unix timestamp

    // Send OTP email (will use OTP_CONFIG.EXPIRY_MINUTES by default)
    const emailSent = await sendOTPEmail(email, otpCode)

    if (!emailSent) {
      console.error('Failed to send OTP email to:', email)
      // Don't expose email sending errors to client for security
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'OTP_REQUESTED',
        entityType: 'User',
        entityId: user.id,
        details: { emailSent, otpSentAt },
        ipAddress: request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    })

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        message: 'OTP sent to your email',
        data: { otpSentAt } // Return timestamp to client
      } as ApiResponse<{ otpSentAt: number }>)
    )

    return response
  } catch (error) {
    console.error('Request OTP error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to send OTP',
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
