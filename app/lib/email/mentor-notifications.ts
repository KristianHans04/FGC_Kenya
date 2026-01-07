import { sendEmail } from '@/app/lib/email'

/**
 * Send email notification when a mentor is assigned to a cohort
 */
export async function sendMentorAssignmentEmail(
  mentorEmail: string,
  mentorName: string,
  cohort: string,
  validUntil?: Date | null
) {
  const subject = `Welcome as a Mentor for ${cohort}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #006600; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background: #006600; 
          color: white; 
          text-decoration: none; 
          border-radius: 4px; 
          margin-top: 20px;
        }
        .info-box { 
          background: #e8f5e9; 
          border-left: 4px solid #006600; 
          padding: 15px; 
          margin: 20px 0;
        }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome as a Mentor!</h1>
        </div>
        <div class="content">
          <p>Dear ${mentorName || 'Mentor'},</p>
          
          <p>We are pleased to inform you that you have been assigned as a mentor for the <strong>${cohort}</strong> cohort.</p>
          
          <div class="info-box">
            <strong>Your Mentor Access Includes:</strong>
            <ul>
              <li>View and guide your assigned students</li>
              <li>Access student profiles and progress</li>
              <li>Review student articles and content</li>
              <li>Participate in training sessions</li>
            </ul>
          </div>
          
          ${validUntil ? `
          <p><strong>Important:</strong> Your mentorship role is valid until ${validUntil.toLocaleDateString()}. 
          After this date, your access may be renewed by an administrator.</p>
          ` : ''}
          
          <p>As a mentor, you play a crucial role in guiding and supporting our students. 
          Your experience and expertise will help shape the next generation of FIRST Global competitors.</p>
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/mentor" class="button">
              Access Mentor Dashboard
            </a>
          </center>
          
          <p style="margin-top: 30px;">
            If you have any questions or need assistance, please don't hesitate to contact our support team.
          </p>
          
          <p>Thank you for your commitment to mentoring!</p>
          
          <p>Best regards,<br>
          FIRST Global Team Kenya</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: mentorEmail,
    subject,
    html
  })
}

/**
 * Send email notification when mentor's period expires
 */
export async function sendMentorExpiryEmail(
  mentorEmail: string,
  mentorName: string,
  cohort: string,
  endDate: Date
) {
  const subject = `Thank You for Mentoring ${cohort}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #006600; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .thank-you { 
          background: #fff3cd; 
          border: 1px solid #ffc107; 
          padding: 20px; 
          margin: 20px 0;
          border-radius: 8px;
        }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background: #006600; 
          color: white; 
          text-decoration: none; 
          border-radius: 4px; 
          margin-top: 20px;
        }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Your Service</h1>
        </div>
        <div class="content">
          <p>Dear ${mentorName || 'Mentor'},</p>
          
          <div class="thank-you">
            <h2 style="color: #856404; margin-top: 0;">Your Mentorship Period Has Concluded</h2>
            <p>Your mentorship role for the <strong>${cohort}</strong> cohort ended on ${endDate.toLocaleDateString()}.</p>
          </div>
          
          <p>We want to express our heartfelt gratitude for your dedication and commitment to mentoring our students. 
          Your guidance, expertise, and support have made a significant impact on their development and success.</p>
          
          <p><strong>Your contributions included:</strong></p>
          <ul>
            <li>Guiding and supporting students throughout their journey</li>
            <li>Sharing your valuable knowledge and experience</li>
            <li>Helping students develop critical skills</li>
            <li>Being a positive role model and inspiration</li>
          </ul>
          
          <p>While your formal mentorship period has ended, we hope you will continue to be part of our community. 
          We would love to have you back as a mentor in future cohorts.</p>
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">
              Stay Connected
            </a>
          </center>
          
          <p style="margin-top: 30px;">
            If you're interested in mentoring future cohorts or have any feedback about your experience, 
            please contact our team.
          </p>
          
          <p>Thank you once again for your invaluable contribution!</p>
          
          <p>Warm regards,<br>
          FIRST Global Team Kenya</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: mentorEmail,
    subject,
    html
  })
}

/**
 * Send email notification when mentor is granted application review access
 */
export async function sendMentorReviewAccessEmail(
  mentorEmail: string,
  mentorName: string,
  cohort: string,
  expiresAt?: Date | null
) {
  const subject = `Application Review Access Granted for ${cohort}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #006600; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .access-box { 
          background: #e3f2fd; 
          border-left: 4px solid #2196f3; 
          padding: 15px; 
          margin: 20px 0;
        }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background: #006600; 
          color: white; 
          text-decoration: none; 
          border-radius: 4px; 
          margin-top: 20px;
        }
        .warning { 
          background: #fff3cd; 
          border: 1px solid #ffc107; 
          padding: 10px; 
          margin-top: 20px;
          border-radius: 4px;
        }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Review Access Granted</h1>
        </div>
        <div class="content">
          <p>Dear ${mentorName || 'Mentor'},</p>
          
          <p>You have been granted access to review applications for the <strong>${cohort}</strong> cohort.</p>
          
          <div class="access-box">
            <strong>Your Review Access:</strong>
            <ul style="margin: 10px 0;">
              <li>View submitted applications</li>
              <li>Review application details</li>
              <li>Provide feedback and recommendations</li>
              <li>Help identify promising candidates</li>
            </ul>
            ${expiresAt ? `
            <p style="margin-top: 15px; margin-bottom: 0;">
              <strong>Access Valid Until:</strong> ${expiresAt.toLocaleDateString()}
            </p>
            ` : ''}
          </div>
          
          <p>Your insights and expertise are valuable in helping us select the best candidates for the program. 
          Please review applications carefully and provide constructive feedback.</p>
          
          ${expiresAt ? `
          <div class="warning">
            <strong>Important:</strong> This is time-limited access. Please complete your reviews before the expiry date.
            After this date, you will need to contact an administrator to regain access.
          </div>
          ` : ''}
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/mentor/applications" class="button">
              Start Reviewing Applications
            </a>
          </center>
          
          <p style="margin-top: 30px;">
            If you have any questions about the review process, please contact the administration team.
          </p>
          
          <p>Thank you for your contribution!</p>
          
          <p>Best regards,<br>
          FIRST Global Team Kenya</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: mentorEmail,
    subject,
    html
  })
}

/**
 * Send email notification when mentor's review access is revoked
 */
export async function sendMentorReviewAccessRevokedEmail(
  mentorEmail: string,
  mentorName: string,
  cohort: string
) {
  const subject = `Application Review Access Expired for ${cohort}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { 
          background: #f8d7da; 
          border-left: 4px solid #dc3545; 
          padding: 15px; 
          margin: 20px 0;
        }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Review Access Expired</h1>
        </div>
        <div class="content">
          <p>Dear ${mentorName || 'Mentor'},</p>
          
          <div class="info-box">
            <strong>Your application review access for ${cohort} has expired.</strong>
            <p style="margin: 10px 0 0 0;">You no longer have permission to review applications for this cohort.</p>
          </div>
          
          <p>If you need to continue reviewing applications or believe this is an error, 
          please contact an administrator to request an extension of your review privileges.</p>
          
          <p>Thank you for your contributions to the application review process.</p>
          
          <p>Best regards,<br>
          FIRST Global Team Kenya</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: mentorEmail,
    subject,
    html
  })
}