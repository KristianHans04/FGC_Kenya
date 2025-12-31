/**
 * @file lib/email/templates.ts
 * @description Legacy email templates file - now imports from modular structure
 * @author Team Kenya Dev
 * @deprecated Use individual template modules from ./templates/ instead
 */

import type { ApplicationStatus } from '@/app/types/application'

// Re-export all templates from the new modular structure for backward compatibility
export {
  // Template functions
  createOTPLoginTemplate as otpLoginTemplate,
  createWelcomeTemplate as welcomeTemplate,
  createApplicationSubmittedTemplate as applicationSubmittedTemplate,
  createApplicationStatusTemplate as applicationStatusTemplate,
  createAdminNewApplicationTemplate as adminNewApplicationTemplate,
  
  // Types
  type OTPEmailData,
  type WelcomeEmailData,
  type ApplicationSubmissionData,
  type ApplicationStatusData,
  type AdminNewApplicationData,
  type EmailTemplate
} from './templates/index'

/**
 * @deprecated Use createBaseTemplate from './templates/base' instead
 * Legacy base template function for backward compatibility
 */
function baseTemplate(content: string): string {
  // Import the new base template
  const { createBaseTemplate } = require('./templates/base')
  return createBaseTemplate(content, { title: 'FIRST Global Team Kenya' })
}

// Legacy exports - these functions are now deprecated
// All template functions have been moved to the modular structure in ./templates/
// This file now serves as a compatibility layer
