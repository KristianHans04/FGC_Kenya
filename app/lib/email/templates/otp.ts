/**
 * @file otp.ts
 * @description OTP (One-Time Password) email templates
 * @author Team Kenya Dev
 */

import { createBaseTemplate } from './base'
import { OTPCode, InfoBox, Divider } from './components'

/**
 * OTP login email data structure
 */
export interface OTPEmailData {
  code: string
  expiryMinutes: number
  userAgent?: string
  ipAddress?: string
  location?: string
}

/**
 * OTP email template result
 */
export interface OTPEmailTemplate {
  subject: string
  html: string
  text: string
}

/**
 * Creates an OTP login email template
 * @param data - OTP email data
 * @returns Complete email template with subject, HTML, and text versions
 */
export function createOTPLoginTemplate(data: OTPEmailData): OTPEmailTemplate {
  const { code, expiryMinutes, userAgent, ipAddress, location } = data
  
  const subject = `Your login code: ${code}`
  const preheader = `Use code ${code} to log in to your Team Kenya account`
  
  const securityInfo = userAgent || ipAddress || location ? `
    ${Divider()}
    ${InfoBox(
      'Login Attempt Details',
      `
        ${userAgent ? `<strong>Device:</strong> ${userAgent}<br>` : ''}
        ${ipAddress ? `<strong>IP Address:</strong> ${ipAddress}<br>` : ''}
        ${location ? `<strong>Location:</strong> ${location}<br>` : ''}
        <strong>Time:</strong> ${new Date().toLocaleString('en-KE')}
      `,
      'info'
    )}
  ` : ''
  
  const htmlContent = `
    <h2>Your Login Code</h2>
    <p>Use the following code to log in to your FIRST Global Team Kenya account:</p>
    
    ${OTPCode(code)}
    
    <p><strong>This code will expire in ${expiryMinutes} minutes.</strong></p>
    
    <p style="color: #666; font-size: 14px;">
      If you didn't request this code, please ignore this email. 
      Someone may have entered your email address by mistake.
    </p>
    
    ${securityInfo}
    
    ${Divider()}
    
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="color: #666; font-size: 12px; margin: 0;">
        <strong>Security tip:</strong> Never share this code with anyone. 
        Team Kenya staff will never ask for your login code.
      </p>
    </div>
  `
  
  const html = createBaseTemplate(htmlContent, {
    title: 'Login Code - FIRST Global Team Kenya',
    preheader
  })
  
  const text = `
Your Login Code: ${code}

Use this code to log in to your FIRST Global Team Kenya account.
This code will expire in ${expiryMinutes} minutes.

${userAgent ? `Device: ${userAgent}` : ''}
${ipAddress ? `IP Address: ${ipAddress}` : ''}
${location ? `Location: ${location}` : ''}
Time: ${new Date().toLocaleString('en-KE')}

If you didn't request this code, please ignore this email.

SECURITY TIP: Never share this code with anyone. Team Kenya staff will never ask for your login code.

FIRST Global Team Kenya
  `.trim()
  
  return { subject, html, text }
}

/**
 * Creates a password reset OTP email template
 * @param data - OTP email data with additional reset context
 * @returns Complete email template for password reset
 */
export function createPasswordResetOTPTemplate(data: OTPEmailData): OTPEmailTemplate {
  const { code, expiryMinutes } = data
  
  const subject = `Password reset code: ${code}`
  const preheader = `Reset your Team Kenya account password with code ${code}`
  
  const htmlContent = `
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your FIRST Global Team Kenya account password.</p>
    
    ${OTPCode(code)}
    
    <p><strong>This code will expire in ${expiryMinutes} minutes.</strong></p>
    
    ${InfoBox(
      'Didn\'t request this?',
      'If you didn\'t request a password reset, you can safely ignore this email. Your password will remain unchanged.',
      'warning'
    )}
    
    ${Divider()}
    
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
      <p style="color: #666; font-size: 12px; margin: 0;">
        <strong>Security tip:</strong> For your account security, never share this reset code with anyone.
      </p>
    </div>
  `
  
  const html = createBaseTemplate(htmlContent, {
    title: 'Password Reset - FIRST Global Team Kenya',
    preheader
  })
  
  const text = `
Password Reset Request

We received a request to reset your FIRST Global Team Kenya account password.

Your reset code: ${code}

This code will expire in ${expiryMinutes} minutes.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

SECURITY TIP: For your account security, never share this reset code with anyone.

FIRST Global Team Kenya
  `.trim()
  
  return { subject, html, text }
}