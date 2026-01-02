/**
 * @file app/api/admin/emails/send/route.ts
 * @description Send email to users API endpoint
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import { addSecurityHeaders } from '@/app/lib/middleware/security'
import { sendEmail } from '@/app/lib/email'
import prisma from '@/app/lib/db'
import type { ApiResponse, ErrorCode } from '@/app/types/api'

/**
 * POST /api/admin/emails/send
 * Send email to a user (admin only)
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
    const { to, subject, message, userId } = body

    // Validate required fields
    if (!to || !subject || !message) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR' as ErrorCode,
              message: 'Missing required fields: to, subject, message',
            },
          },
          { status: 400 }
        )
      )
    }

    // If userId is provided, verify the user exists
    let targetUser = null
    if (userId) {
      targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
        },
      })

      if (!targetUser) {
        return addSecurityHeaders(
          NextResponse.json(
            {
              success: false,
              error: {
                code: 'NOT_FOUND' as ErrorCode,
                message: 'User not found',
              },
            },
            { status: 404 }
          )
        )
      }
    }

    // Format the email HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #006600; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">FIRST Global Team Kenya</h2>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
          <div style="background-color: white; padding: 20px; border-radius: 4px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This email was sent by an administrator from FIRST Global Team Kenya.
            <br>If you believe this email was sent in error, please contact support.
          </p>
        </div>
      </div>
    `

    // Send the email
    await sendEmail({
      to,
      subject,
      html: htmlContent,
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'EMAIL_SENT',
        entityType: 'Email',
        entityId: userId || 'manual',
        details: {
          to,
          subject,
          sentBy: authResult.user.email,
        },
        userId: authResult.user.id,
        adminId: authResult.user.id,
        ipAddress: request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    })

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: {
          message: 'Email sent successfully',
          to,
          subject,
        },
      })
    )
  } catch (error) {
    console.error('Send email error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to send email',
          },
        },
        { status: 500 }
      )
    )
  }
}