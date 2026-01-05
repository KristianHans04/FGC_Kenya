/**
 * @file app/api/admin/emails/send-welcome/route.ts
 * @description Send welcome email to new users
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import { addSecurityHeaders } from '@/app/lib/middleware/security'
import { sendEmail } from '@/app/lib/email'
import { createBaseTemplate } from '@/app/lib/email/templates/base'
import { EmailButton, InfoBox, Divider } from '@/app/lib/email/templates/components'
import prisma from '@/app/lib/db'
import type { ApiResponse, ErrorCode } from '@/app/types/api'

/**
 * POST /api/admin/emails/send-welcome
 * Send welcome email to new user
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
      userId,
      email,
      firstName,
      temporaryPassword,
      requirePasswordChange
    } = body

    // Note: This system uses OTP for verification, not tokens
    // Users will verify via OTP sent to their email

    // Prepare email content
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`
    
    const subject = 'Welcome to FIRST Global Team Kenya!'
    const preheader = 'Your account has been created successfully - Let\'s get started!'
    
    const htmlContent = `
      <h2>Welcome to the Team!</h2>
      <p>Dear ${firstName},</p>
      
      <p>Welcome to the FIRST Global Team Kenya platform! Your account has been successfully created by our administrator.</p>
      
      <p>You are now part of our community dedicated to advancing STEM education and robotics excellence in Kenya.</p>
      
      ${InfoBox(
        'Account Details',
        `<strong>Email:</strong> ${email}<br>
         <strong>Authentication:</strong> OTP (One-Time Password)<br>
         <em>You'll receive a verification code via email each time you log in.</em>`,
        'info'
      )}
      
      <h3>Next Steps:</h3>
      <ol style="padding-left: 20px;">
        <li>Click the login button below to access your account</li>
        <li>Enter your email address on the login page</li>
        <li>Check your email for the verification code</li>
        <li>Complete your profile information</li>
        <li>Explore the platform features</li>
      </ol>
      
      <div style="text-align: center;">
        ${EmailButton('Login to Your Account', loginUrl, 'primary')}
      </div>
      
      ${Divider()}
      
      ${InfoBox(
        'Need Help?',
        'If you have any questions or need assistance, please don\'t hesitate to contact our support team at <a href="mailto:teamkenyarobotics254@gmail.com" style="color: #006600;">teamkenyarobotics254@gmail.com</a>',
        'info'
      )}
      
      <p>We look forward to your participation and contributions to our robotics community!</p>
      
      <p>Best regards,<br>
      <strong>The FIRST Global Team Kenya Admin Team</strong></p>
    `
    
    const emailHtml = createBaseTemplate(htmlContent, {
      title: 'Welcome to FIRST Global Team Kenya',
      preheader
    })

    // Send email
    const emailSent = await sendEmail({
      to: email,
      subject,
      html: emailHtml,
      text: `Welcome to FIRST Global Team Kenya!
      
Dear ${firstName},

Your account has been successfully created by our administrator.

Account Details:
- Email: ${email}
- Authentication: OTP (One-Time Password)

Next Steps:
1. Visit the login page at: ${loginUrl}
2. Enter your email address
3. Check your email for the verification code
4. Complete your profile information
5. Explore the platform features

If you need assistance, contact our support team at teamkenyarobotics254@gmail.com

Best regards,
The FIRST Global Team Kenya Admin Team`
    })

    if (!emailSent) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'INTERNAL_ERROR' as ErrorCode,
              message: 'Failed to send welcome email',
            },
          },
          { status: 500 }
        )
      )
    }

    // Log email sent
    await prisma.auditLog.create({
      data: {
        action: 'EMAIL_SENT',
        entityType: 'User',
        entityId: userId || 'unknown',
        userId: authResult.user.id,
        adminId: authResult.user.id,
        details: {
          recipientEmail: email,
          sentBy: authResult.user.email,
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
          message: 'Welcome email sent successfully',
        },
      })
    )
  } catch (error) {
    console.error('Send welcome email error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to send welcome email',
          },
        },
        { status: 500 }
      )
    )
  }
}