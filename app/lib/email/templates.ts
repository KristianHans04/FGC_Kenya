/**
 * @file lib/email/templates.ts
 * @description Email templates for the application
 * @author Team Kenya Dev
 */

import type { ApplicationStatus } from '@/app/types/application'

/**
 * Base email template wrapper with Kenya branding
 */
function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FIRST Global Team Kenya</title>
  <style>
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0; 
      padding: 0; 
      background-color: #f5f5f5; 
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
    }
    .header { 
      background: linear-gradient(90deg, #000000, #BB0000, #006600); 
      padding: 30px 20px; 
      text-align: center; 
      border-radius: 8px 8px 0 0; 
    }
    .header h1 { 
      color: white; 
      margin: 0; 
      font-size: 24px; 
    }
    .header p { 
      color: rgba(255,255,255,0.9); 
      margin: 5px 0 0; 
      font-size: 14px; 
    }
    .content { 
      background: white; 
      padding: 30px; 
      border-radius: 0 0 8px 8px; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
    }
    .otp-code { 
      background: #f0f0f0; 
      padding: 20px; 
      text-align: center; 
      font-size: 32px; 
      font-weight: bold; 
      letter-spacing: 8px; 
      color: #006600; 
      border-radius: 8px; 
      margin: 20px 0; 
    }
    .button { 
      display: inline-block; 
      background: #006600; 
      color: white; 
      padding: 12px 30px; 
      text-decoration: none; 
      border-radius: 5px; 
      font-weight: bold; 
      margin: 20px 0; 
    }
    .button:hover { 
      background: #008800; 
    }
    .footer { 
      text-align: center; 
      padding: 20px; 
      color: #666; 
      font-size: 12px; 
    }
    .status-badge { 
      display: inline-block; 
      padding: 8px 16px; 
      border-radius: 20px; 
      font-weight: bold; 
      margin: 10px 0; 
    }
    .status-submitted { background: #e3f2fd; color: #1565c0; }
    .status-under-review { background: #fff3e0; color: #ef6c00; }
    .status-shortlisted { background: #e8f5e9; color: #2e7d32; }
    .status-accepted { background: #c8e6c9; color: #1b5e20; }
    .status-rejected { background: #ffebee; color: #c62828; }
    .status-interview { background: #f3e5f5; color: #7b1fa2; }
    .kenya-stripe { 
      height: 4px; 
      background: linear-gradient(90deg, #000000 33%, #BB0000 33%, #BB0000 66%, #006600 66%); 
    }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1><i>FIRST</i> Global Team Kenya</h1>
      <p>Inspiring the Future of STEM</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="kenya-stripe"></div>
    <div class="footer">
      <p>FIRST Global Team Kenya</p>
      <p>Off James Gichuru Road, Nairobi, Kenya</p>
      <p>
        <a href="https://fgckenya.com" style="color: #006600;">fgckenya.com</a> | 
        <a href="mailto:teamkenyarobotics254@gmail.com" style="color: #006600;">teamkenyarobotics254@gmail.com</a>
      </p>
      <p style="margin-top: 15px;">
        This email was sent by FIRST Global Team Kenya. 
        If you didn't request this email, please ignore it.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * OTP Login email template
 */
export function otpLoginTemplate(data: { 
  code: string
  expiryMinutes: number 
}): { subject: string; html: string; text: string } {
  const subject = `Your login code: ${data.code}`
  
  const html = baseTemplate(`
    <h2>Your Login Code</h2>
    <p>Use the following code to log in to your FIRST Global Team Kenya account:</p>
    
    <div class="otp-code">${data.code}</div>
    
    <p><strong>This code will expire in ${data.expiryMinutes} minutes.</strong></p>
    
    <p style="color: #666; font-size: 14px;">
      If you didn't request this code, please ignore this email. 
      Someone may have entered your email address by mistake.
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    
    <p style="color: #666; font-size: 12px;">
      <strong>Security tip:</strong> Never share this code with anyone. 
      Team Kenya staff will never ask for your login code.
    </p>
  `)
  
  const text = `
Your Login Code: ${data.code}

Use this code to log in to your FIRST Global Team Kenya account.
This code will expire in ${data.expiryMinutes} minutes.

If you didn't request this code, please ignore this email.

FIRST Global Team Kenya
  `.trim()
  
  return { subject, html, text }
}

/**
 * Welcome email template
 */
export function welcomeTemplate(data: { 
  firstName: string
}): { subject: string; html: string; text: string } {
  const subject = `Welcome to FIRST Global Team Kenya!`
  
  const html = baseTemplate(`
    <h2>Welcome, ${data.firstName}!</h2>
    
    <p>Thank you for creating an account with FIRST Global Team Kenya. 
    We're excited to have you join our community of aspiring robotics enthusiasts!</p>
    
    <h3>What's Next?</h3>
    <ul>
      <li><strong>Complete Your Application:</strong> If you haven't already, submit your application for the 2026 season.</li>
      <li><strong>Explore Resources:</strong> Check out our learning resources to prepare for the competition.</li>
      <li><strong>Stay Connected:</strong> Follow us on social media for updates and announcements.</li>
    </ul>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
    </div>
    
    <p>If you have any questions, feel free to reach out to us at 
    <a href="mailto:teamkenyarobotics254@gmail.com">teamkenyarobotics254@gmail.com</a>.</p>
    
    <p>Best regards,<br>The FIRST Global Team Kenya</p>
  `)
  
  const text = `
Welcome, ${data.firstName}!

Thank you for creating an account with FIRST Global Team Kenya.
We're excited to have you join our community of aspiring robotics enthusiasts!

What's Next?
- Complete Your Application: Submit your application for the 2026 season.
- Explore Resources: Check out our learning resources.
- Stay Connected: Follow us on social media for updates.

Visit your dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

If you have any questions, reach out to teamkenyarobotics254@gmail.com

Best regards,
The FIRST Global Team Kenya
  `.trim()
  
  return { subject, html, text }
}

/**
 * Application submitted confirmation email
 */
export function applicationSubmittedTemplate(data: {
  firstName: string
  applicationId: string
  season: string
}): { subject: string; html: string; text: string } {
  const subject = `Application Received - FIRST Global Team Kenya ${data.season}`
  
  const html = baseTemplate(`
    <h2>Application Received!</h2>
    
    <p>Dear ${data.firstName},</p>
    
    <p>We have successfully received your application for the <strong>FIRST Global Team Kenya ${data.season} Season</strong>.</p>
    
    <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Application Reference:</strong> ${data.applicationId.slice(0, 8).toUpperCase()}</p>
    </div>
    
    <h3>What Happens Next?</h3>
    <ol>
      <li><strong>Initial Screening:</strong> Our team will review your application.</li>
      <li><strong>Shortlisting:</strong> Selected candidates will be notified for interviews.</li>
      <li><strong>Interviews:</strong> Shortlisted candidates will be invited for interviews.</li>
      <li><strong>Final Selection:</strong> The final team will be announced.</li>
    </ol>
    
    <p>You can track your application status anytime from your dashboard.</p>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Application Status</a>
    </div>
    
    <p>Thank you for your interest in representing Kenya at the FIRST Global Challenge!</p>
    
    <p>Best regards,<br>The Selection Committee<br>FIRST Global Team Kenya</p>
  `)
  
  const text = `
Application Received!

Dear ${data.firstName},

We have successfully received your application for the FIRST Global Team Kenya ${data.season} Season.

Application Reference: ${data.applicationId.slice(0, 8).toUpperCase()}

What Happens Next?
1. Initial Screening: Our team will review your application.
2. Shortlisting: Selected candidates will be notified for interviews.
3. Interviews: Shortlisted candidates will be invited for interviews.
4. Final Selection: The final team will be announced.

Track your application: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Thank you for your interest in representing Kenya!

Best regards,
The Selection Committee
FIRST Global Team Kenya
  `.trim()
  
  return { subject, html, text }
}

/**
 * Application status update email
 */
export function applicationStatusTemplate(data: {
  firstName: string
  status: ApplicationStatus
  notes?: string
  interviewDate?: Date
}): { subject: string; html: string; text: string } {
  const statusMessages: Record<ApplicationStatus, { title: string; message: string; class: string }> = {
    DRAFT: { title: 'Application Draft', message: 'Your application is saved as a draft.', class: 'status-submitted' },
    SUBMITTED: { title: 'Application Submitted', message: 'Your application has been received.', class: 'status-submitted' },
    UNDER_REVIEW: { title: 'Under Review', message: 'Your application is currently being reviewed by our selection committee.', class: 'status-under-review' },
    SHORTLISTED: { title: 'Congratulations! You\'ve Been Shortlisted', message: 'We are pleased to inform you that you have been shortlisted for the next stage of selection.', class: 'status-shortlisted' },
    INTERVIEW_SCHEDULED: { title: 'Interview Scheduled', message: 'Your interview has been scheduled. Please check the details below.', class: 'status-interview' },
    INTERVIEWED: { title: 'Interview Completed', message: 'Thank you for completing your interview. We will be in touch soon.', class: 'status-under-review' },
    ACCEPTED: { title: 'Congratulations! You\'ve Been Selected', message: 'We are thrilled to inform you that you have been selected to join FIRST Global Team Kenya!', class: 'status-accepted' },
    REJECTED: { title: 'Application Update', message: 'After careful consideration, we regret to inform you that we are unable to offer you a place on the team this season.', class: 'status-rejected' },
    WAITLISTED: { title: 'Waitlisted', message: 'You have been placed on our waitlist. We will contact you if a position becomes available.', class: 'status-submitted' },
    WITHDRAWN: { title: 'Application Withdrawn', message: 'Your application has been withdrawn.', class: 'status-rejected' },
  }

  const statusInfo = statusMessages[data.status]
  const subject = `${statusInfo.title} - FIRST Global Team Kenya`
  
  let additionalContent = ''
  
  if (data.interviewDate) {
    additionalContent += `
      <div style="background: #f3e5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #7b1fa2;">Interview Details</h3>
        <p><strong>Date & Time:</strong> ${data.interviewDate.toLocaleDateString('en-KE', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        <p style="margin-bottom: 0;">Please ensure you are available at the scheduled time. Further details will be provided closer to the date.</p>
      </div>
    `
  }
  
  if (data.notes) {
    additionalContent += `
      <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Additional Notes</h3>
        <p style="margin-bottom: 0;">${data.notes}</p>
      </div>
    `
  }
  
  if (data.status === 'ACCEPTED') {
    additionalContent += `
      <h3>Next Steps</h3>
      <ul>
        <li>You will receive onboarding information within the next few days.</li>
        <li>Please confirm your acceptance by responding to this email.</li>
        <li>Start preparing by reviewing our training materials.</li>
      </ul>
    `
  }
  
  const html = baseTemplate(`
    <h2>${statusInfo.title}</h2>
    
    <p>Dear ${data.firstName},</p>
    
    <div style="text-align: center; margin: 20px 0;">
      <span class="status-badge ${statusInfo.class}">${data.status.replace('_', ' ')}</span>
    </div>
    
    <p>${statusInfo.message}</p>
    
    ${additionalContent}
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Full Details</a>
    </div>
    
    <p>If you have any questions, please don't hesitate to reach out to us.</p>
    
    <p>Best regards,<br>The Selection Committee<br>FIRST Global Team Kenya</p>
  `)
  
  const text = `
${statusInfo.title}

Dear ${data.firstName},

${statusInfo.message}

${data.interviewDate ? `Interview Date: ${data.interviewDate.toLocaleDateString('en-KE')}` : ''}
${data.notes ? `Notes: ${data.notes}` : ''}

View full details: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Best regards,
The Selection Committee
FIRST Global Team Kenya
  `.trim()
  
  return { subject, html, text }
}

/**
 * Admin notification for new application
 */
export function adminNewApplicationTemplate(data: {
  applicantName: string
  applicantEmail: string
  applicationId: string
  season: string
}): { subject: string; html: string; text: string } {
  const subject = `New Application Received - ${data.applicantName}`
  
  const html = baseTemplate(`
    <h2>New Application Submitted</h2>
    
    <p>A new application has been submitted for the ${data.season} season.</p>
    
    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Applicant:</strong> ${data.applicantName}</p>
      <p><strong>Email:</strong> ${data.applicantEmail}</p>
      <p style="margin-bottom: 0;"><strong>Reference:</strong> ${data.applicationId.slice(0, 8).toUpperCase()}</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/applications/${data.applicationId}" class="button">Review Application</a>
    </div>
  `)
  
  const text = `
New Application Submitted

Applicant: ${data.applicantName}
Email: ${data.applicantEmail}
Reference: ${data.applicationId.slice(0, 8).toUpperCase()}
Season: ${data.season}

Review: ${process.env.NEXT_PUBLIC_APP_URL}/admin/applications/${data.applicationId}
  `.trim()
  
  return { subject, html, text }
}
