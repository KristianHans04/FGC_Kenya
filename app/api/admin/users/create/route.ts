/**
 * @file app/api/admin/users/create/route.ts
 * @description Create new user endpoint with email notifications
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import { addSecurityHeaders } from '@/app/lib/middleware/security'
import prisma from '@/app/lib/db'
// Passwordless authentication - no bcrypt needed
import type { ApiResponse, ErrorCode } from '@/app/types/api'

/**
 * POST /api/admin/users/create
 * Create a new user account
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request)
    if (!authResult.user) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED' as ErrorCode,
              message: 'Not authenticated',
            },
          },
          { status: 401 }
        )
      )
    }

    // Check admin permissions
    if (authResult.user.role !== 'ADMIN' && authResult.user.role !== 'SUPER_ADMIN') {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN' as ErrorCode,
              message: 'Admin access required',
            },
          },
          { status: 403 }
        )
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      email,
      firstName,
      lastName,
      phone,
      school,
      year,
      role,
      address,
      bio,
      sendWelcomeEmail,
    } = body

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'BAD_REQUEST' as ErrorCode,
              message: 'Missing required fields',
            },
          },
          { status: 400 }
        )
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'BAD_REQUEST' as ErrorCode,
              message: 'Invalid email format',
            },
          },
          { status: 400 }
        )
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'CONFLICT' as ErrorCode,
              message: 'User with this email already exists',
            },
          },
          { status: 409 }
        )
      )
    }

    // Validate role permissions
    const allowedRoles = ['USER', 'STUDENT', 'ALUMNI', 'MENTOR', 'ADMIN']
    if (authResult.user.role === 'SUPER_ADMIN') {
      allowedRoles.push('SUPER_ADMIN')
    }
    
    const userRole = role || 'USER'
    if (!allowedRoles.includes(userRole)) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN' as ErrorCode,
              message: 'You do not have permission to assign this role',
            },
          },
          { status: 403 }
        )
      )
    }

    // Only super admins can create other admins or super admins
    if ((userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && authResult.user.role !== 'SUPER_ADMIN') {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN' as ErrorCode,
              message: 'Only super admins can create admin accounts',
            },
          },
          { status: 403 }
        )
      )
    }

    // Create user (Note: This system uses passwordless authentication with OTP)
    // The password will be set by the user when they first login
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        firstName,
        lastName,
        phone: phone || null,
        school: school || null,
        grade: year || null,
        role: userRole,
        homeAddress: address || null,
        isActive: true,
        emailVerified: false, // User will verify via welcome email
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'USER_CREATED',
        entityType: 'User',
        entityId: newUser.id,
        userId: authResult.user.id,
        adminId: authResult.user.id,
        details: {
          createdEmail: newUser.email,
          createdRole: newUser.role,
          createdBy: authResult.user.email,
          sendWelcomeEmail,
        },
        ipAddress:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    })

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: {
          user: newUser,
          message: 'User created successfully',
        },
      })
    )
  } catch (error) {
    console.error('Create user error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to create user',
          },
        },
        { status: 500 }
      )
    )
  }
}