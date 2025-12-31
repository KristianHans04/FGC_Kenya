/**
 * @file admin.ts
 * @description Admin notification email templates
 * @author Team Kenya Dev
 */

import { createBaseTemplate } from './base'
import { EmailButton, InfoBox, Divider, ReferenceNumber } from './components'
import type { ApplicationStatus } from '@/app/types/application'

/**
 * New application notification data for admins
 */
export interface AdminNewApplicationData {
  applicantName: string
  applicantEmail: string
  applicationId: string
  season: string
  submittedAt?: Date
  county?: string
  school?: string
  grade?: string
  experience?: string
  interests?: string[]
  reviewUrl?: string
}

/**
 * Application status change notification data for admins
 */
export interface AdminStatusChangeData {
  applicantName: string
  applicantEmail: string
  applicationId: string
  previousStatus: ApplicationStatus
  newStatus: ApplicationStatus
  changedBy: string
  changedAt: Date
  notes?: string
  reviewUrl?: string
}

/**
 * System notification data for admins
 */
export interface AdminSystemNotificationData {
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  details?: string
  timestamp: Date
  actionUrl?: string
  actionText?: string
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
 * Creates admin notification email for new applications
 * @param data - New application notification data
 * @returns Complete email template
 */
export function createAdminNewApplicationTemplate(data: AdminNewApplicationData): EmailTemplate {
  const { 
    applicantName, 
    applicantEmail, 
    applicationId, 
    season,
    submittedAt,
    county,
    school,
    grade,
    experience,
    interests,
    reviewUrl = process.env.NEXT_PUBLIC_APP_URL + `/admin/applications/${applicationId}`
  } = data
  
  const subject = `New Application: ${applicantName} - ${season}`
  const preheader = `${applicantName} has submitted a new application for review`
  const reference = applicationId.slice(0, 8).toUpperCase()
  
  const htmlContent = `
    <h2>📋 New Application Submitted</h2>
    
    <p>A new application has been submitted for the <strong>${season} season</strong> and requires review.</p>
    
    ${ReferenceNumber(reference, 'Application Reference')}
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #333;">Applicant Information</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 30%;">Name:</td>
          <td style="padding: 8px 0;">${applicantName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Email:</td>
          <td style="padding: 8px 0;"><a href="mailto:${applicantEmail}" style="color: #006600;">${applicantEmail}</a></td>
        </tr>
        ${county ? `<tr>
          <td style="padding: 8px 0; font-weight: bold;">County:</td>
          <td style="padding: 8px 0;">${county}</td>
        </tr>` : ''}
        ${school ? `<tr>
          <td style="padding: 8px 0; font-weight: bold;">School:</td>
          <td style="padding: 8px 0;">${school}</td>
        </tr>` : ''}
        ${grade ? `<tr>
          <td style="padding: 8px 0; font-weight: bold;">Grade:</td>
          <td style="padding: 8px 0;">${grade}</td>
        </tr>` : ''}
        ${experience ? `<tr>
          <td style="padding: 8px 0; font-weight: bold;">Experience:</td>
          <td style="padding: 8px 0;">${experience}</td>
        </tr>` : ''}
        ${submittedAt ? `<tr>
          <td style="padding: 8px 0; font-weight: bold;">Submitted:</td>
          <td style="padding: 8px 0;">${submittedAt.toLocaleDateString('en-KE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</td>
        </tr>` : ''}
      </table>
    </div>
    
    ${interests && interests.length > 0 ? `
    <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h4 style="margin-top: 0; color: #2e7d32;">Areas of Interest</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${interests.map(interest => `
          <span style="
            background: #c8e6c9; 
            color: #1b5e20; 
            padding: 4px 12px; 
            border-radius: 16px; 
            font-size: 12px;
            font-weight: bold;
          ">${interest}</span>
        `).join('')}
      </div>
    </div>` : ''}
    
    <div style="text-align: center; margin: 30px 0;">
      ${EmailButton('Review Application', reviewUrl, 'primary')}
    </div>
    
    ${InfoBox(
      'Action Required',
      'Please review this application promptly to maintain our response time standards. The applicant is waiting for updates on their submission.',
      'info'
    )}
    
    <p>This notification was sent to all admin team members.</p>
  `
  
  const html = createBaseTemplate(htmlContent, {
    title: 'New Application - Team Kenya Admin',
    preheader
  })
  
  const text = `
New Application Submitted

Applicant: ${applicantName}
Email: ${applicantEmail}
Reference: ${reference}
Season: ${season}
${county ? `County: ${county}` : ''}
${school ? `School: ${school}` : ''}
${grade ? `Grade: ${grade}` : ''}
${experience ? `Experience: ${experience}` : ''}
${interests && interests.length > 0 ? `Interests: ${interests.join(', ')}` : ''}
${submittedAt ? `Submitted: ${submittedAt.toLocaleDateString('en-KE')}` : ''}

Review Application: ${reviewUrl}

This notification was sent to all admin team members.
  `.trim()
  
  return { subject, html, text }
}

/**
 * Creates admin notification email for application status changes
 * @param data - Status change notification data
 * @returns Complete email template
 */
export function createAdminStatusChangeTemplate(data: AdminStatusChangeData): EmailTemplate {
  const { 
    applicantName, 
    applicationId, 
    previousStatus,
    newStatus,
    changedBy,
    changedAt,
    notes,
    reviewUrl = process.env.NEXT_PUBLIC_APP_URL + `/admin/applications/${applicationId}`
  } = data
  
  const subject = `Status Changed: ${applicantName} - ${newStatus.replace('_', ' ')}`
  const preheader = `Application status updated from ${previousStatus} to ${newStatus}`
  const reference = applicationId.slice(0, 8).toUpperCase()
  
  const htmlContent = `
    <h2>📝 Application Status Updated</h2>
    
    <p>An application status has been changed and logged in the system.</p>
    
    ${ReferenceNumber(reference, 'Application Reference')}
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #333;">Status Change Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 30%;">Applicant:</td>
          <td style="padding: 8px 0;">${applicantName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Previous Status:</td>
          <td style="padding: 8px 0;">
            <span style="background: #fff3e0; color: #ef6c00; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              ${previousStatus.replace('_', ' ')}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">New Status:</td>
          <td style="padding: 8px 0;">
            <span style="background: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              ${newStatus.replace('_', ' ')}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Changed By:</td>
          <td style="padding: 8px 0;">${changedBy}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Changed At:</td>
          <td style="padding: 8px 0;">${changedAt.toLocaleDateString('en-KE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</td>
        </tr>
      </table>
    </div>
    
    ${notes ? `
      ${InfoBox('Review Notes', notes, 'info')}
    ` : ''}
    
    <div style="text-align: center; margin: 30px 0;">
      ${EmailButton('View Application', reviewUrl, 'primary')}
    </div>
    
    <p>This notification helps maintain audit trails and keeps the admin team informed of review progress.</p>
  `
  
  const html = createBaseTemplate(htmlContent, {
    title: 'Status Update - Team Kenya Admin',
    preheader
  })
  
  const text = `
Application Status Updated

Applicant: ${applicantName}
Reference: ${reference}
Previous Status: ${previousStatus.replace('_', ' ')}
New Status: ${newStatus.replace('_', ' ')}
Changed By: ${changedBy}
Changed At: ${changedAt.toLocaleDateString('en-KE')}

${notes ? `Review Notes: ${notes}` : ''}

View Application: ${reviewUrl}

This notification helps maintain audit trails and keeps the admin team informed.
  `.trim()
  
  return { subject, html, text }
}

/**
 * Creates system notification email for admins
 * @param data - System notification data
 * @returns Complete email template
 */
export function createAdminSystemNotificationTemplate(data: AdminSystemNotificationData): EmailTemplate {
  const { 
    type, 
    title, 
    message, 
    details, 
    timestamp,
    actionUrl,
    actionText = 'Take Action'
  } = data
  
  const subject = `System ${type.toUpperCase()}: ${title}`
  const preheader = message
  
  const typeInfo = {
    error: { emoji: '🚨', color: '#c62828', bgColor: '#ffebee' },
    warning: { emoji: '⚠️', color: '#ef6c00', bgColor: '#fff3e0' },
    info: { emoji: 'ℹ️', color: '#1565c0', bgColor: '#e3f2fd' },
    success: { emoji: '✅', color: '#2e7d32', bgColor: '#e8f5e9' }
  }
  
  const { emoji, color, bgColor } = typeInfo[type]
  
  const htmlContent = `
    <h2>${emoji} System ${type.charAt(0).toUpperCase() + type.slice(1)}</h2>
    
    <div style="background: ${bgColor}; color: ${color}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color};">
      <h3 style="margin-top: 0; color: ${color};">${title}</h3>
      <p style="margin-bottom: 0;">${message}</p>
    </div>
    
    ${details ? `
      <h3>Additional Details</h3>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; font-family: monospace; font-size: 12px; overflow-x: auto;">
        <pre style="margin: 0; white-space: pre-wrap;">${details}</pre>
      </div>
    ` : ''}
    
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #666;">
        <strong>Timestamp:</strong> ${timestamp.toLocaleDateString('en-KE', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Africa/Nairobi'
        })} (EAT)
      </p>
    </div>
    
    ${actionUrl ? `
      <div style="text-align: center; margin: 30px 0;">
        ${EmailButton(actionText, actionUrl, type === 'error' || type === 'warning' ? 'primary' : 'secondary')}
      </div>
    ` : ''}
    
    <p style="color: #666; font-size: 12px;">
      This system notification was automatically generated. 
      Please investigate and resolve any issues promptly to ensure smooth operation.
    </p>
  `
  
  const html = createBaseTemplate(htmlContent, {
    title: `System ${type.charAt(0).toUpperCase() + type.slice(1)} - Team Kenya`,
    preheader
  })
  
  const text = `
System ${type.toUpperCase()}: ${title}

${message}

${details ? `Details:\n${details}\n` : ''}

Timestamp: ${timestamp.toLocaleDateString('en-KE')} (EAT)

${actionUrl ? `Take Action: ${actionUrl}` : ''}

This system notification was automatically generated.
Please investigate and resolve any issues promptly.
  `.trim()
  
  return { subject, html, text }
}