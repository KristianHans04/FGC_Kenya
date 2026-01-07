import { sendEmail } from '@/app/lib/email'

interface ApplicationDecisionEmailParams {
  applicantEmail: string
  applicantName: string
  decision: 'ACCEPTED' | 'REJECTED' | 'SHORTLISTED'
  formTitle: string
  formYear: string
  reviewerFeedback?: string
  score?: number
}

export async function sendApplicationDecisionEmail({
  applicantEmail,
  applicantName,
  decision,
  formTitle,
  formYear,
  reviewerFeedback,
  score
}: ApplicationDecisionEmailParams) {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000'
  const dashboardUrl = `${baseUrl}/student`
  
  // Define email content based on decision
  const getEmailContent = () => {
    switch (decision) {
      case 'ACCEPTED':
        return {
          subject: `Congratulations! Your ${formTitle} application has been accepted`,
          heading: 'Congratulations! You\'ve been accepted!',
          message: `We are thrilled to inform you that your application for ${formTitle} has been accepted. You are now officially part of FIRST Global Team Kenya for ${formYear}.`,
          actionText: 'View Dashboard',
          color: '#16a34a' // green
        }
      
      case 'SHORTLISTED':
        return {
          subject: `Your ${formTitle} application has been shortlisted`,
          heading: 'You\'ve been shortlisted!',
          message: `Great news! Your application for ${formTitle} has been shortlisted. We will be in touch with next steps for the final selection process.`,
          actionText: 'View Application Status',
          color: '#9333ea' // purple
        }
      
      case 'REJECTED':
        return {
          subject: `Update on your ${formTitle} application`,
          heading: 'Thank you for your application',
          message: `Thank you for your interest in ${formTitle}. While we were impressed by your application, we regret to inform you that we are unable to offer you a place at this time.`,
          actionText: 'View Dashboard',
          color: '#dc2626' // red
        }
      
      default:
        throw new Error('Invalid decision type')
    }
  }

  const emailContent = getEmailContent()

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailContent.subject}</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #006600 0%, #008800 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { padding: 40px 30px; }
            .decision-badge { 
                display: inline-block; 
                padding: 8px 16px; 
                border-radius: 20px; 
                font-size: 14px; 
                font-weight: 600; 
                margin: 20px 0;
                background-color: ${emailContent.color}20;
                color: ${emailContent.color};
                border: 2px solid ${emailContent.color}40;
            }
            .score-section { 
                background-color: #f8fafc; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0; 
                border-left: 4px solid ${emailContent.color}; 
            }
            .feedback-section { 
                background-color: #f1f5f9; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0; 
                border-left: 4px solid #64748b; 
            }
            .button { 
                display: inline-block; 
                background-color: ${emailContent.color}; 
                color: white; 
                padding: 12px 24px; 
                text-decoration: none; 
                border-radius: 6px; 
                font-weight: 600; 
                margin: 20px 0; 
            }
            .footer { 
                background-color: #f8fafc; 
                padding: 30px; 
                text-align: center; 
                font-size: 14px; 
                color: #64748b; 
                border-top: 1px solid #e2e8f0; 
            }
            .logo { font-size: 24px; font-weight: 700; margin-bottom: 10px; }
            h1 { margin: 0 0 10px 0; font-size: 28px; }
            h2 { color: #1e293b; font-size: 20px; margin: 25px 0 15px 0; }
            p { line-height: 1.6; color: #475569; margin: 0 0 15px 0; }
            .highlight { color: ${emailContent.color}; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🚀 FIRST Global Team Kenya</div>
                <h1>${emailContent.heading}</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">
                    ${formTitle} • ${formYear}
                </p>
            </div>
            
            <div class="content">
                <p>Dear ${applicantName},</p>
                
                <p>${emailContent.message}</p>
                
                <div class="decision-badge">
                    Application Status: <span class="highlight">${decision.charAt(0).toUpperCase() + decision.slice(1).toLowerCase()}</span>
                </div>
                
                ${score ? `
                    <div class="score-section">
                        <h2>Review Score</h2>
                        <p>Your application received a score of <span class="highlight">${score}/100</span> from our review committee.</p>
                    </div>
                ` : ''}
                
                ${reviewerFeedback ? `
                    <div class="feedback-section">
                        <h2>Reviewer Feedback</h2>
                        <p style="color: #1e293b;">${reviewerFeedback}</p>
                    </div>
                ` : ''}
                
                ${decision === 'ACCEPTED' ? `
                    <h2>What's Next?</h2>
                    <p>We will be contacting you soon with:</p>
                    <ul style="color: #475569; line-height: 1.6;">
                        <li>Team onboarding information</li>
                        <li>Training schedule and requirements</li>
                        <li>Competition preparation details</li>
                        <li>Travel and logistics information</li>
                    </ul>
                ` : ''}
                
                ${decision === 'SHORTLISTED' ? `
                    <h2>What's Next?</h2>
                    <p>As a shortlisted candidate, you can expect:</p>
                    <ul style="color: #475569; line-height: 1.6;">
                        <li>An interview or additional assessment</li>
                        <li>Contact from our team within the next week</li>
                        <li>Final decision notification by the end of this month</li>
                    </ul>
                ` : ''}
                
                ${decision === 'REJECTED' ? `
                    <h2>Stay Connected</h2>
                    <p>Although this application was not successful, we encourage you to:</p>
                    <ul style="color: #475569; line-height: 1.6;">
                        <li>Apply for future opportunities with FIRST Global Team Kenya</li>
                        <li>Join our community events and workshops</li>
                        <li>Continue developing your STEM skills</li>
                        <li>Follow our journey and achievements</li>
                    </ul>
                    <p>Your passion for STEM is valuable, and we hope to see you in future programs.</p>
                ` : ''}
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${dashboardUrl}" class="button">${emailContent.actionText}</a>
                </div>
                
                <p>If you have any questions, please don't hesitate to reach out to us at <a href="mailto:team@fgc.ke" style="color: ${emailContent.color};">team@fgc.ke</a>.</p>
                
                <p style="margin-top: 30px;">
                    Best regards,<br>
                    <strong>FIRST Global Team Kenya Selection Committee</strong>
                </p>
            </div>
            
            <div class="footer">
                <p><strong>FIRST Global Team Kenya</strong></p>
                <p>Building tomorrow's innovators through robotics and STEM education</p>
                <p>
                    <a href="${baseUrl}" style="color: #64748b; margin: 0 10px;">Website</a> •
                    <a href="mailto:team@fgc.ke" style="color: #64748b; margin: 0 10px;">Contact</a>
                </p>
                <p style="font-size: 12px; margin-top: 15px;">
                    This email was sent to ${applicantEmail}. If you have questions about this notification, please contact our team.
                </p>
            </div>
        </div>
    </body>
    </html>
  `

  const plainText = `
    ${emailContent.heading}
    
    Dear ${applicantName},
    
    ${emailContent.message}
    
    Application Status: ${decision.charAt(0).toUpperCase() + decision.slice(1).toLowerCase()}
    
    ${score ? `Review Score: ${score}/100` : ''}
    
    ${reviewerFeedback ? `Reviewer Feedback: ${reviewerFeedback}` : ''}
    
    View your dashboard: ${dashboardUrl}
    
    If you have any questions, please contact us at team@fgc.ke
    
    Best regards,
    FIRST Global Team Kenya Selection Committee
  `

  await sendEmail({
    to: applicantEmail,
    subject: emailContent.subject,
    html,
    text: plainText
  })
}