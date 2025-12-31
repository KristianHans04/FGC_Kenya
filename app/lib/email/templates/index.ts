/**
 * @file index.ts
 * @description Main export file for modular email templates
 * @author Team Kenya Dev
 */

// Import templates first for internal use
import { createOTPLoginTemplate, createPasswordResetOTPTemplate } from './otp'
import { createWelcomeTemplate } from './welcome'
import { createApplicationSubmittedTemplate, createApplicationStatusTemplate } from './application'
import { createAdminNewApplicationTemplate, createAdminStatusChangeTemplate, createAdminSystemNotificationTemplate } from './admin'

// Base template and components
export { createBaseTemplate, emailStyles, EmailFooter } from './base'
export type { BaseEmailConfig } from './base'

export { 
  EmailHeader, 
  EmailButton, 
  OTPCode, 
  StatusBadge, 
  InfoBox, 
  Divider, 
  HighlightText, 
  ReferenceNumber 
} from './components'

// OTP templates
export { 
  createOTPLoginTemplate, 
  createPasswordResetOTPTemplate 
}
export type { OTPEmailData, OTPEmailTemplate } from './otp'

// Welcome templates
export { createWelcomeTemplate }
export type { WelcomeEmailData } from './welcome'

// Application templates
export { 
  createApplicationSubmittedTemplate, 
  createApplicationStatusTemplate 
}
export type { 
  ApplicationSubmissionData, 
  ApplicationStatusData 
} from './application'

// Admin notification templates
export { 
  createAdminNewApplicationTemplate, 
  createAdminStatusChangeTemplate,
  createAdminSystemNotificationTemplate 
}
export type { 
  AdminNewApplicationData, 
  AdminStatusChangeData,
  AdminSystemNotificationData 
} from './admin'

// Common interface
export type { EmailTemplate } from './welcome'

/**
 * Legacy template functions for backwards compatibility
 * These functions maintain the same interface as the original templates.ts file
 * Note: The functions are already exported above with their proper names
 */

/**
 * Template factory function for easy template selection
 * @param templateType - Type of template to create
 * @param data - Template data
 * @returns EmailTemplate object with subject, html, and text
 */
export function createEmailTemplate(
  templateType: 'otp-login' | 'password-reset' | 'welcome' | 'application-submitted' | 'application-status' | 'admin-new-application' | 'admin-status-change' | 'admin-system',
  data: any
): { subject: string; html: string; text: string } {
  switch (templateType) {
    case 'otp-login':
      return createOTPLoginTemplate(data)
    case 'password-reset':
      return createPasswordResetOTPTemplate(data)
    case 'welcome':
      return createWelcomeTemplate(data)
    case 'application-submitted':
      return createApplicationSubmittedTemplate(data)
    case 'application-status':
      return createApplicationStatusTemplate(data)
    case 'admin-new-application':
      return createAdminNewApplicationTemplate(data)
    case 'admin-status-change':
      return createAdminStatusChangeTemplate(data)
    case 'admin-system':
      return createAdminSystemNotificationTemplate(data)
    default:
      throw new Error(`Unknown template type: ${templateType}`)
  }
}

/**
 * Email template themes for different contexts
 */
export const EMAIL_THEMES = {
  DEFAULT: 'default',
  COMPETITION: 'competition',
  OUTREACH: 'outreach',
  ADMIN: 'admin'
} as const

export type EmailTheme = typeof EMAIL_THEMES[keyof typeof EMAIL_THEMES]

/**
 * Email template categories for organization
 */
export const EMAIL_CATEGORIES = {
  AUTH: 'authentication',
  APPLICATION: 'application',
  NOTIFICATION: 'notification',
  MARKETING: 'marketing',
  SYSTEM: 'system'
} as const

export type EmailCategory = typeof EMAIL_CATEGORIES[keyof typeof EMAIL_CATEGORIES]

/**
 * Available email templates registry
 */
export const EMAIL_TEMPLATES = {
  'otp-login': {
    name: 'OTP Login',
    category: EMAIL_CATEGORIES.AUTH,
    description: 'One-time password for user login'
  },
  'password-reset': {
    name: 'Password Reset OTP',
    category: EMAIL_CATEGORIES.AUTH,
    description: 'One-time password for password reset'
  },
  'welcome': {
    name: 'Welcome Email',
    category: EMAIL_CATEGORIES.NOTIFICATION,
    description: 'Welcome new users to the platform'
  },
  'application-submitted': {
    name: 'Application Submitted',
    category: EMAIL_CATEGORIES.APPLICATION,
    description: 'Confirmation of application submission'
  },
  'application-status': {
    name: 'Application Status Update',
    category: EMAIL_CATEGORIES.APPLICATION,
    description: 'Updates on application review status'
  },
  'admin-new-application': {
    name: 'Admin: New Application',
    category: EMAIL_CATEGORIES.NOTIFICATION,
    description: 'Notify admins of new application submissions'
  },
  'admin-status-change': {
    name: 'Admin: Status Change',
    category: EMAIL_CATEGORIES.NOTIFICATION,
    description: 'Notify admins of application status changes'
  },
  'admin-system': {
    name: 'Admin: System Notification',
    category: EMAIL_CATEGORIES.SYSTEM,
    description: 'System alerts and notifications for admins'
  }
} as const

export type EmailTemplateType = keyof typeof EMAIL_TEMPLATES