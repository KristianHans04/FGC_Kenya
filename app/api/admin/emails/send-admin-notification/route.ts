/**
 * @file app/api/admin/emails/send-admin-notification/route.ts
 * @description Send notification email to admin about user actions
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import { addSecurityHeaders } from '@/app/lib/middleware/security'
import { sendEmail } from '@/app/lib/email'
import { createBaseTemplate } from '@/app/lib/email/templates/base'
import { EmailButton, InfoBox, Divider, StatusBadge } from '@/app/lib/email/templates/components'
import type { ApiResponse, ErrorCode } from '@/app/types/api'

/**
 * POST /api/admin/emails/send-admin-notification
 * Send notification email to admin
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
      action,
      adminEmail,
      userData
    } = body

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/super/users`

    // Prepare email content based on action
    let subject = ''
    let htmlContent = ''
    let preheader = ''
    
    if (action === 'user_created') {
      subject = '[Admin] New User Created Successfully'
      preheader = `${userData?.name} has been added to the platform`
      
      htmlContent = `
        <h2>User Creation Confirmation</h2>
        
        ${InfoBox(
          'Success!',
          'A new user has been created successfully.',
          'success'
        )}
        
        <p>Dear Administrator,</p>
        
        <p>This is to confirm that you have successfully created a new user account in the FIRST Global Team Kenya platform.</p>
        
        ${InfoBox(
          'User Details',
          `<strong>Name:</strong> ${userData.name}<br>
           <strong>Email:</strong> ${userData.email}<br>
           <strong>Role:</strong> ${StatusBadge(userData.role)}<br>
           <strong>Created By:</strong> ${adminEmail}<br>
           <strong>Created At:</strong> ${new Date().toLocaleString('en-KE')}`,
          'info'
        )}
        
        <h3>User Onboarding</h3>
        <p>The user has been sent a welcome email with instructions to:</p>
        <ul style="padding-left: 20px;">
          <li>Log in using OTP verification</li>
          <li>Complete their profile information</li>
          <li>Explore the platform features</li>
        </ul>
        
        <div style="text-align: center;">
          ${EmailButton('View User Management Dashboard', dashboardUrl, 'primary')}
        </div>
        
        ${Divider()}
        
        <h3>Next Steps</h3>
        <ul style="padding-left: 20px;">
          <li>Monitor the user's first login</li>
          <li>Assist with any onboarding questions</li>
          <li>Ensure proper permissions are configured</li>
          <li>Follow up on user engagement</li>
        </ul>
        
        <p>Thank you for managing our platform users effectively!</p>
        
        <p>Best regards,<br>
        <strong>FIRST Global Team Kenya Admin System</strong></p>
      `
    } else {
      subject = '[Admin] Platform Action Notification'
      preheader = `Administrative action: ${action}`
      
      htmlContent = `
        <h2>Admin Action Notification</h2>
        
        <p>An administrative action has been performed on the platform.</p>
        
        ${InfoBox(
          'Action Details',
          `<strong>Action:</strong> ${action}<br>
           <strong>Time:</strong> ${new Date().toLocaleString('en-KE')}<br>
           <strong>Administrator:</strong> ${adminEmail}`,
          'info'
        )}
        
        <div style="text-align: center;">
          ${EmailButton('View Admin Dashboard', dashboardUrl, 'primary')}
        </div>
        
        <p>This is an automated notification from the admin system.</p>
      `
    }
    
    const emailHtml = createBaseTemplate(htmlContent, {
      title: subject,
      preheader
    })

    // Send email
    const emailSent = await sendEmail({
      to: adminEmail,
      subject,
      html: emailHtml,
      text: action === 'user_created' ? 
        `User Creation Confirmation

Dear Administrator,

A new user has been successfully created in the FIRST Global Team Kenya platform.

User Details:
- Name: ${userData?.name}
- Email: ${userData?.email}
- Role: ${userData?.role}
- Created By: ${adminEmail}
- Created At: ${new Date().toLocaleString('en-KE')}

The user has been sent a welcome email with OTP login instructions.

View User Management Dashboard: ${dashboardUrl}

Next Steps:
- Monitor the user's first login
- Assist with any onboarding questions
- Ensure proper permissions are configured

Best regards,
FIRST Global Team Kenya Admin System` :
        `Admin Action Notification

Action: ${action}
Time: ${new Date().toLocaleString('en-KE')}
Administrator: ${adminEmail}

View Admin Dashboard: ${dashboardUrl}`
    })

    if (!emailSent) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'INTERNAL_ERROR' as ErrorCode,
              message: 'Failed to send admin notification',
            },
          },
          { status: 500 }
        )
      )
    }

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: {
          message: 'Admin notification sent successfully',
        },
      })
    )
  } catch (error) {
    console.error('Send admin notification error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to send admin notification',
          },
        },
        { status: 500 }
      )
    )
  }
}