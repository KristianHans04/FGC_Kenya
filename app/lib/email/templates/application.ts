/**
 * @file application.ts
 * @description Application-related email templates
 * @author Team Kenya Dev
 */

import { createBaseTemplate } from './base'
import { EmailButton, StatusBadge, InfoBox, Divider, ReferenceNumber } from './components'
import type { ApplicationStatus } from '@/app/types/application'

/**
 * Application submission email data
 */
export interface ApplicationSubmissionData {
  firstName: string
  lastName: string
  applicationId: string
  season: string
  submittedAt: Date
  dashboardUrl?: string
}

/**
 * Application status update email data
 */
export interface ApplicationStatusData {
  firstName: string
  lastName?: string
  applicationId: string
  status: ApplicationStatus
  previousStatus?: ApplicationStatus
  notes?: string
  interviewDate?: Date
  interviewLocation?: string
  nextSteps?: string[]
  dashboardUrl?: string
}

/**
 * Email template result interface
 */
export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

/**
 * Creates application submitted confirmation email
 * @param data - Application submission data
 * @returns Complete email template
 */
export function createApplicationSubmittedTemplate(data: ApplicationSubmissionData): EmailTemplate {
  const { 
    firstName, 
    lastName, 
    applicationId, 
    season, 
    submittedAt,
    dashboardUrl = process.env.NEXT_PUBLIC_APP_URL + '/dashboard'
  } = data
  
  const fullName = lastName ? `${firstName} ${lastName}` : firstName
  const subject = `Application Received - FIRST Global Team Kenya ${season}`
  const preheader = `Your ${season} application has been successfully submitted`
  const reference = applicationId.slice(0, 8).toUpperCase()
  
  const htmlContent = `
    <h2>Application Received!</h2>
    
    <p>Dear ${firstName},</p>
    
    <p>We have successfully received your application for the <strong>FIRST Global Team Kenya ${season} Season</strong>.</p>
    
    ${ReferenceNumber(reference, 'Application Reference')}
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #006600;">
      <p style="margin: 0; font-size: 14px; color: #666;">
        <strong>Submitted:</strong> ${submittedAt.toLocaleDateString('en-KE', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
    
    <h3>What Happens Next?</h3>
    <ol style="line-height: 1.8;">
      <li><strong>Initial Screening (1-2 weeks):</strong> Our selection committee will review your application against our criteria.</li>
      <li><strong>Shortlisting:</strong> Qualified candidates will be notified and invited for the next stage.</li>
      <li><strong>Interviews:</strong> Shortlisted candidates will participate in interviews with our team.</li>
      <li><strong>Final Selection:</strong> The final team will be announced, and selected members will begin orientation.</li>
    </ol>
    
    ${InfoBox(
      'Track Your Application',
      'You can check your application status anytime from your dashboard. We\'ll also send you email updates as your application progresses through each stage.',
      'info'
    )}
    
    <div style="text-align: center; margin: 30px 0;">
      ${EmailButton('View Application Status', dashboardUrl, 'primary')}
    </div>
    
    ${Divider()}
    
    <p><strong>What to expect during the review:</strong></p>
    <ul style="line-height: 1.8; color: #666; font-size: 14px;">
      <li>Academic performance and STEM background</li>
      <li>Experience with robotics, programming, or engineering</li>
      <li>Motivation and commitment to Team Kenya's mission</li>
      <li>Communication skills and teamwork potential</li>
      <li>Leadership qualities and community involvement</li>
    </ul>
    
    <p>Thank you for your interest in representing Kenya at the FIRST Global Challenge!</p>
    
    <p>Best regards,<br>
    <strong>The Selection Committee</strong><br>
    FIRST Global Team Kenya</p>
  `
  
  const html = createBaseTemplate(htmlContent, {
    title: `Application Received - Team Kenya ${season}`,
    preheader
  })
  
  const text = `
Application Received!

Dear ${firstName},

We have successfully received your application for the FIRST Global Team Kenya ${season} Season.

Application Reference: ${reference}
Submitted: ${submittedAt.toLocaleDateString('en-KE')}

What Happens Next?
1. Initial Screening (1-2 weeks): Review against our criteria
2. Shortlisting: Qualified candidates notified for next stage
3. Interviews: Shortlisted candidates participate in interviews
4. Final Selection: Final team announced and orientation begins

You can track your application status at: ${dashboardUrl}

Thank you for your interest in representing Kenya!

Best regards,
The Selection Committee
FIRST Global Team Kenya
  `.trim()
  
  return { subject, html, text }
}

/**
 * Creates application status update email
 * @param data - Application status data
 * @returns Complete email template
 */
export function createApplicationStatusTemplate(data: ApplicationStatusData): EmailTemplate {
  const { 
    firstName, 
    status, 
    notes, 
    interviewDate,
    interviewLocation,
    nextSteps,
    dashboardUrl = process.env.NEXT_PUBLIC_APP_URL + '/dashboard'
  } = data
  
  const statusInfo = getStatusInfo(status)
  const subject = `${statusInfo.title} - FIRST Global Team Kenya`
  const preheader = `Your application status has been updated to ${status.replace('_', ' ')}`
  
  // Generate status-specific content
  let additionalContent = ''
  
  // Interview details
  if (interviewDate && status === 'INTERVIEW_SCHEDULED') {
    additionalContent += `
      <div style="background: #f3e5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7b1fa2;">
        <h3 style="margin-top: 0; color: #7b1fa2;">Interview Details</h3>
        <p><strong>Date & Time:</strong> ${interviewDate.toLocaleDateString('en-KE', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        ${interviewLocation ? `<p><strong>Location:</strong> ${interviewLocation}</p>` : ''}
        <p style="margin-bottom: 0;">Please ensure you are available at the scheduled time. Further details will be provided closer to the date.</p>
      </div>
    `
  }
  
  // Additional notes
  if (notes) {
    additionalContent += `
      ${InfoBox('Additional Information', notes, 'info')}
    `
  }
  
  // Next steps for accepted candidates
  if (status === 'ACCEPTED') {
    const defaultNextSteps = [
      'Confirm your acceptance by responding to this email within 48 hours',
      'Complete the team member onboarding process',
      'Attend orientation sessions and team meetings',
      'Begin preparation for the competition season',
      'Receive training materials and schedule'
    ]
    
    const steps = nextSteps || defaultNextSteps
    
    additionalContent += `
      <h3>Next Steps as a Team Member</h3>
      <ol style="line-height: 1.8;">
        ${steps.map(step => `<li>${step}</li>`).join('')}
      </ol>
      
      ${InfoBox(
        'Congratulations!',
        'Welcome to FIRST Global Team Kenya! You are now part of an elite team representing Kenya on the global stage. We look forward to working with you.',
        'success'
      )}
    `
  }
  
  // Rejection with encouragement
  if (status === 'REJECTED') {
    additionalContent += `
      ${InfoBox(
        'Thank You for Applying',
        'While we cannot offer you a position this season, we encourage you to continue developing your STEM skills. Consider applying again next season - many successful team members were not selected on their first attempt.',
        'info'
      )}
      
      <h3>Continue Your STEM Journey</h3>
      <ul style="line-height: 1.8;">
        <li>Participate in our outreach programs and workshops</li>
        <li>Engage with local robotics clubs and STEM activities</li>
        <li>Follow Team Kenya's journey and learn from our experiences</li>
        <li>Apply again next season with enhanced skills and experience</li>
      </ul>
    `
  }
  
  const htmlContent = `
    <h2>${statusInfo.title}</h2>
    
    <p>Dear ${firstName},</p>
    
    <div style="text-align: center; margin: 20px 0;">
      ${StatusBadge(status)}
    </div>
    
    <p>${statusInfo.message}</p>
    
    ${additionalContent}
    
    <div style="text-align: center; margin: 30px 0;">
      ${EmailButton('View Full Details', dashboardUrl, 'primary')}
    </div>
    
    <p>If you have any questions, please don't hesitate to reach out to us.</p>
    
    <p>Best regards,<br>
    <strong>The Selection Committee</strong><br>
    FIRST Global Team Kenya</p>
  `
  
  const html = createBaseTemplate(htmlContent, {
    title: `Application Update - Team Kenya`,
    preheader
  })
  
  const text = `
${statusInfo.title}

Dear ${firstName},

Status: ${status.replace('_', ' ')}

${statusInfo.message}

${interviewDate ? `Interview Date: ${interviewDate.toLocaleDateString('en-KE')}` : ''}
${interviewLocation ? `Interview Location: ${interviewLocation}` : ''}
${notes ? `Additional Information: ${notes}` : ''}

View full details: ${dashboardUrl}

Best regards,
The Selection Committee
FIRST Global Team Kenya
  `.trim()
  
  return { subject, html, text }
}

/**
 * Get status-specific information for email content
 * @param status - Application status
 * @returns Status information object
 */
function getStatusInfo(status: ApplicationStatus): { title: string; message: string } {
  const statusMessages: Record<ApplicationStatus, { title: string; message: string }> = {
    DRAFT: { 
      title: 'Application Draft Saved', 
      message: 'Your application has been saved as a draft. You can continue editing and submit when ready.' 
    },
    SUBMITTED: { 
      title: 'Application Submitted', 
      message: 'Your application has been successfully received and is being processed.' 
    },
    UNDER_REVIEW: { 
      title: 'Application Under Review', 
      message: 'Your application is currently being reviewed by our selection committee. We appreciate your patience.' 
    },
    SHORTLISTED: { 
      title: 'Congratulations! You\'ve Been Shortlisted', 
      message: 'We are pleased to inform you that you have been shortlisted for the next stage of selection. This is a significant achievement!' 
    },
    INTERVIEW_SCHEDULED: { 
      title: 'Interview Scheduled', 
      message: 'Your interview has been scheduled. Please check the details below and confirm your availability.' 
    },
    INTERVIEWED: { 
      title: 'Interview Completed', 
      message: 'Thank you for completing your interview. Our selection committee is now making the final decisions.' 
    },
    ACCEPTED: { 
      title: 'Congratulations! You\'ve Been Selected for Team Kenya!', 
      message: 'We are thrilled to inform you that you have been selected to join FIRST Global Team Kenya! Welcome to the team!' 
    },
    REJECTED: { 
      title: 'Application Decision', 
      message: 'After careful consideration, we regret to inform you that we are unable to offer you a place on the team this season. This decision was extremely difficult given the high quality of applications.' 
    },
    WAITLISTED: { 
      title: 'Application Waitlisted', 
      message: 'You have been placed on our waitlist. We will contact you if a position becomes available.' 
    },
    WITHDRAWN: { 
      title: 'Application Withdrawn', 
      message: 'Your application has been withdrawn as requested.' 
    },
  }

  return statusMessages[status]
}