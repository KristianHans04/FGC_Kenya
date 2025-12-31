/**
 * @file lib/email/index.ts
 * @description Email service for sending emails via Nodemailer
 * @author Team Kenya Dev
 */

import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import prisma from '@/app/lib/db'
import type { ApplicationStatus } from '@/app/types/application'
import {
  otpLoginTemplate,
  welcomeTemplate,
  applicationSubmittedTemplate,
  applicationStatusTemplate,
  adminNewApplicationTemplate,
  type ApplicationSubmissionData,
  type ApplicationStatusData,
  type AdminNewApplicationData,
} from './templates'

/**
 * Email configuration from environment variables
 */
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  user: process.env.EMAIL_USER || '',
  pass: process.env.EMAIL_PASS || '',
  from: process.env.EMAIL_FROM || 'FIRST Global Team Kenya <noreply@fgckenya.com>',
}

/**
 * Create nodemailer transporter
 */
function createTransporter(): Transporter {
  return nodemailer.createTransport({
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.secure,
    auth: {
      user: EMAIL_CONFIG.user,
      pass: EMAIL_CONFIG.pass,
    },
  })
}

/**
 * Email sending options
 */
interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send an email
 * @param options - Email options
 * @returns Promise resolving to success boolean
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  // In development or when EMAIL_PROVIDER is 'console', log email instead of sending
  if (process.env.NODE_ENV === 'development' || process.env.EMAIL_PROVIDER === 'console' || !EMAIL_CONFIG.user) {
    console.log('\n' + '='.repeat(60))
    console.log('[EMAIL PREVIEW] Development Mode')
    console.log('='.repeat(60))
    console.log('To:', options.to)
    console.log('Subject:', options.subject)
    console.log('-'.repeat(60))
    if (options.text) {
      // Extract OTP code if present
      const otpMatch = options.text.match(/OTP Code: (\d+)/);
      if (otpMatch) {
        console.log('[OTP CODE]:', otpMatch[1])
        console.log('-'.repeat(60))
      }
      console.log('Content:', options.text.slice(0, 500))
    }
    console.log('='.repeat(60) + '\n')
    return true
  }

  try {
    const transporter = createTransporter()
    
    await transporter.sendMail({
      from: EMAIL_CONFIG.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })
    
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

/**
 * Queue an email for async sending
 * @param options - Email options with template info
 */
export async function queueEmail(
  to: string,
  template: string,
  data: Record<string, unknown>
): Promise<void> {
  await prisma.emailQueue.create({
    data: {
      to,
      subject: '', // Will be set when processing
      template,
      data: data as object,
      status: 'PENDING',
    },
  })
}

/**
 * Process queued emails (called by cron job or worker)
 */
export async function processEmailQueue(): Promise<{ sent: number; failed: number }> {
  const pendingEmails = await prisma.emailQueue.findMany({
    where: {
      status: 'PENDING',
      attempts: { lt: 3 },
    },
    take: 10,
    orderBy: { createdAt: 'asc' },
  })

  let sent = 0
  let failed = 0

  for (const email of pendingEmails) {
    // Mark as sending
    await prisma.emailQueue.update({
      where: { id: email.id },
      data: { status: 'SENDING', attempts: { increment: 1 } },
    })

    try {
      // Generate email content based on template
      const { subject, html, text } = generateEmailContent(
        email.template,
        email.data as Record<string, unknown>
      )

      const success = await sendEmail({
        to: email.to,
        subject,
        html,
        text,
      })

      if (success) {
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: { status: 'SENT', sentAt: new Date() },
        })
        sent++
      } else {
        throw new Error('Send failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: {
          status: email.attempts >= 2 ? 'FAILED' : 'PENDING',
          error: errorMessage,
        },
      })
      failed++
    }
  }

  return { sent, failed }
}

/**
 * Generate email content from template
 */
function generateEmailContent(
  template: string,
  data: Record<string, unknown>
): { subject: string; html: string; text: string } {
  switch (template) {
    case 'otp-login':
      return otpLoginTemplate(data as unknown as { code: string; expiryMinutes: number })
    case 'welcome':
      return welcomeTemplate(data as unknown as { firstName: string; email: string })
    case 'application-submitted':
      return applicationSubmittedTemplate(data as unknown as ApplicationSubmissionData)
    case 'application-status':
      return applicationStatusTemplate(data as unknown as ApplicationStatusData)
    case 'admin-new-application':
      return adminNewApplicationTemplate(data as unknown as AdminNewApplicationData)
    default:
      throw new Error(`Unknown email template: ${template}`)
  }
}

// Convenience functions for specific email types

/**
 * Send OTP login email
 */
export async function sendOTPEmail(
  email: string,
  code: string,
  expiryMinutes: number = 10
): Promise<boolean> {
  const { subject, html, text } = otpLoginTemplate({ code, expiryMinutes })
  return sendEmail({ to: email, subject, html, text })
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  firstName: string
): Promise<boolean> {
  const { subject, html, text } = welcomeTemplate({ firstName, email })
  return sendEmail({ to: email, subject, html, text })
}

/**
 * Send application submitted email
 */

/**
 * Send application status update email
 */
export async function sendApplicationStatusEmail(
  email: string,
  firstName: string,
  applicationId: string,
  status: ApplicationStatus,
  notes?: string,
  interviewDate?: Date
): Promise<boolean> {
  const { subject, html, text } = applicationStatusTemplate({
    firstName,
    applicationId,
    status,
    notes,
    interviewDate,
  })
  return sendEmail({ to: email, subject, html, text })
}

/**
 * Send admin notification for new application
 */
export async function sendAdminNewApplicationEmail(
  applicantName: string,
  applicantEmail: string,
  applicationId: string,
  season: string = '2026'
): Promise<boolean> {
  const adminEmails = process.env.ADMIN_NOTIFICATION_EMAILS?.split(',') || []
  
  if (adminEmails.length === 0) {
    console.log('No admin notification emails configured')
    return true
  }

  const { subject, html, text } = adminNewApplicationTemplate({
    applicantName,
    applicantEmail,
    applicationId,
    season,
  })

  const results = await Promise.all(
    adminEmails.map((adminEmail) =>
      sendEmail({ to: adminEmail.trim(), subject, html, text })
    )
  )

  return results.every(Boolean)
}

/**
 * Send application submitted email
 */

export * from './templates'
