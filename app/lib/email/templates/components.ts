/**
 * @file components.ts
 * @description Reusable email components and utilities
 * @author Team Kenya Dev
 */

/**
 * Email header component with Kenya flag colors
 * @returns HTML header string
 */
export function EmailHeader(): string {
  return `
    <div class="header">
      <h1><i>FIRST</i> Global Team Kenya</h1>
      <p>Inspiring the Future of STEM</p>
    </div>
  `
}

/**
 * Email button component with consistent styling
 * @param text - Button text
 * @param url - Button URL
 * @param variant - Button style variant
 * @returns HTML button string
 */
export function EmailButton(
  text: string, 
  url: string, 
  variant: 'primary' | 'secondary' = 'primary'
): string {
  const baseStyle = `
    display: inline-block; 
    padding: 12px 30px; 
    text-decoration: none; 
    border-radius: 5px; 
    font-weight: bold; 
    margin: 20px 0;
    text-align: center;
  `
  
  const variantStyles = {
    primary: `
      background: #006600; 
      color: white;
      border: 2px solid #006600;
    `,
    secondary: `
      background: transparent; 
      color: #006600;
      border: 2px solid #006600;
    `
  }
  
  const hoverStyle = variant === 'primary' 
    ? 'background: #008800;' 
    : 'background: #006600; color: white;'
  
  return `
    <a href="${url}" style="${baseStyle} ${variantStyles[variant]}" 
       onmouseover="this.style.cssText='${baseStyle} ${hoverStyle}'" 
       onmouseout="this.style.cssText='${baseStyle} ${variantStyles[variant]}'">
      ${text}
    </a>
  `
}

/**
 * OTP code display component
 * @param code - The OTP code to display
 * @returns HTML OTP display string
 */
export function OTPCode(code: string): string {
  return `
    <div style="
      background: #f0f0f0; 
      padding: 20px; 
      text-align: center; 
      font-size: 32px; 
      font-weight: bold; 
      letter-spacing: 8px; 
      color: #006600; 
      border-radius: 8px; 
      margin: 20px 0;
      border: 2px dashed #006600;
    ">
      ${code}
    </div>
  `
}

/**
 * Status badge component for application status
 * @param status - Application status
 * @param text - Optional custom text (defaults to status)
 * @returns HTML status badge string
 */
export function StatusBadge(status: string, text?: string): string {
  const statusClasses: Record<string, string> = {
    DRAFT: 'background: #e3f2fd; color: #1565c0;',
    SUBMITTED: 'background: #e3f2fd; color: #1565c0;',
    UNDER_REVIEW: 'background: #fff3e0; color: #ef6c00;',
    SHORTLISTED: 'background: #e8f5e9; color: #2e7d32;',
    ACCEPTED: 'background: #c8e6c9; color: #1b5e20;',
    REJECTED: 'background: #ffebee; color: #c62828;',
    INTERVIEW_SCHEDULED: 'background: #f3e5f5; color: #7b1fa2;',
    INTERVIEWED: 'background: #fff3e0; color: #ef6c00;',
    WAITLISTED: 'background: #e3f2fd; color: #1565c0;',
    WITHDRAWN: 'background: #ffebee; color: #c62828;'
  }
  
  const statusStyle = statusClasses[status.toUpperCase()] || statusClasses.SUBMITTED
  
  return `
    <span style="
      display: inline-block; 
      padding: 8px 16px; 
      border-radius: 20px; 
      font-weight: bold; 
      margin: 10px 0;
      font-size: 14px;
      ${statusStyle}
    ">
      ${text || status.replace('_', ' ')}
    </span>
  `
}

/**
 * Information box component for highlighting content
 * @param title - Box title
 * @param content - Box content
 * @param variant - Style variant
 * @returns HTML info box string
 */
export function InfoBox(
  title: string, 
  content: string, 
  variant: 'info' | 'success' | 'warning' | 'error' = 'info'
): string {
  const variants = {
    info: 'background: #e3f2fd; color: #1565c0; border-left: 4px solid #1565c0;',
    success: 'background: #e8f5e9; color: #2e7d32; border-left: 4px solid #2e7d32;',
    warning: 'background: #fff3e0; color: #ef6c00; border-left: 4px solid #ef6c00;',
    error: 'background: #ffebee; color: #c62828; border-left: 4px solid #c62828;'
  }
  
  return `
    <div style="
      padding: 15px; 
      border-radius: 8px; 
      margin: 20px 0;
      ${variants[variant]}
    ">
      <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 16px;">${title}</h3>
      <p style="margin-bottom: 0; line-height: 1.5;">${content}</p>
    </div>
  `
}

/**
 * Divider/separator component
 * @param style - Divider style
 * @returns HTML divider string
 */
export function Divider(style: 'solid' | 'dashed' | 'dotted' = 'solid'): string {
  return `
    <hr style="
      border: none; 
      border-top: 1px ${style} #eee; 
      margin: 20px 0;
    ">
  `
}

/**
 * Text highlighting component
 * @param text - Text to highlight
 * @param color - Highlight color
 * @returns HTML highlighted text string
 */
export function HighlightText(text: string, color = '#006600'): string {
  return `
    <strong style="
      background: ${color}20; 
      color: ${color}; 
      padding: 2px 6px; 
      border-radius: 4px;
      font-weight: bold;
    ">${text}</strong>
  `
}

/**
 * Reference number display component
 * @param reference - Reference number
 * @param label - Label text
 * @returns HTML reference display string
 */
export function ReferenceNumber(reference: string, label = 'Reference'): string {
  return `
    <div style="
      background: #e8f5e9; 
      padding: 15px; 
      border-radius: 8px; 
      margin: 20px 0;
      text-align: center;
      border: 1px solid #2e7d32;
    ">
      <p style="margin: 0; color: #2e7d32;">
        <strong>${label}:</strong> ${reference}
      </p>
    </div>
  `
}