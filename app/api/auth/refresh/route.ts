/**
 * @file app/api/auth/refresh/route.ts
 * @description Refresh access token using refresh token
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { refreshTokenSchema } from '@/app/lib/validations/auth'
import { refreshTokens } from '@/app/lib/auth/jwt'
import { addSecurityHeaders } from '@/app/lib/middleware/security'
import type { ApiResponse, ErrorCode } from '@/app/types/api'
import type { SafeUser, AuthResponse } from '@/app/types/auth'

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = refreshTokenSchema.safeParse(body)

    if (!validationResult.success) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR' as ErrorCode,
              message: 'Invalid refresh token',
            },
          },
          { status: 400 }
        )
      )
    }

    const { refreshToken } = validationResult.data

    // Refresh tokens
    const newTokens = await refreshTokens(refreshToken)

    if (!newTokens) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_TOKEN' as ErrorCode,
              message: 'Invalid or expired refresh token',
            },
          },
          { status: 401 }
        )
      )
    }

    // Get user info for response
    const { verifyAccessToken } = await import('@/app/lib/auth/jwt')
    const payload = await verifyAccessToken(newTokens.accessToken)

    if (!payload) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'INTERNAL_ERROR' as ErrorCode,
              message: 'Token generation failed',
            },
          },
          { status: 500 }
        )
      )
    }

    // Get user details
    const { prisma } = await import('@/app/lib/db')
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        school: true,
        role: true,
        emailVerified: true,
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

    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      school: user.school,
      role: user.role as any,
      emailVerified: user.emailVerified,
    }

    const authResponse: AuthResponse = {
      user: safeUser,
      token: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      expiresAt: newTokens.expiresAt.toISOString(),
    }

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: authResponse,
      } as ApiResponse<AuthResponse>)
    )

    // Update cookies with new tokens
    response.cookies.set('auth_token', newTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    })

    response.cookies.set('refresh_token', newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Refresh token error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Token refresh failed',
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
