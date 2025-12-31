/**
 * @file base.ts
 * @description Base email template with Kenya branding
 * @author Team Kenya Dev
 */

import { EmailHeader } from './components'

/**
 * Base email template configuration
 */
export interface BaseEmailConfig {
  title?: string
  preheader?: string
  darkMode?: boolean
}

/**
 * Base email template styles
 * Consistent Kenya branding and responsive design
 */
export const emailStyles = `
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
    font-weight: bold;
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
  .footer { 
    text-align: center; 
    padding: 20px; 
    color: #666; 
    font-size: 12px; 
  }
  .footer a {
    color: #006600;
    text-decoration: none;
  }
  .footer a:hover {
    text-decoration: underline;
  }
  .kenya-stripe { 
    height: 4px; 
    background: linear-gradient(90deg, #000000 33%, #BB0000 33%, #BB0000 66%, #006600 66%); 
  }
  ul { 
    padding-left: 20px; 
  }
  li { 
    margin-bottom: 8px; 
  }
  h1, h2, h3 {
    color: #333;
  }
  
  /* Responsive design */
  @media only screen and (max-width: 480px) {
    .container {
      padding: 10px;
    }
    .content {
      padding: 20px;
    }
    .header h1 {
      font-size: 20px;
    }
  }
`

/**
 * Creates a base email template wrapper with Kenya branding
 * @param content - HTML content to wrap
 * @param config - Optional configuration for title and preheader
 * @returns Complete HTML email template
 */
export function createBaseTemplate(content: string, config: BaseEmailConfig = {}): string {
  const { title = 'FIRST Global Team Kenya', preheader = '' } = config
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
  ${preheader ? `<!--[if !mso]><!--><div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div><!--<![endif]-->` : ''}
  <style>
    ${emailStyles}
  </style>
</head>
<body>
  <div class="container">
    ${EmailHeader()}
    <div class="content">
      ${content}
    </div>
    <div class="kenya-stripe"></div>
    ${EmailFooter()}
  </div>
</body>
</html>
  `.trim()
}

/**
 * Email footer template
 * @returns HTML footer string
 */
export function EmailFooter(): string {
  const currentYear = new Date().getFullYear()
  
  return `
    <div class="footer">
      <p><strong>FIRST Global Team Kenya</strong></p>
      <p>Off James Gichuru Road, Nairobi, Kenya</p>
      <p>
        <a href="https://fgckenya.com">fgckenya.com</a> | 
        <a href="mailto:teamkenyarobotics254@gmail.com">teamkenyarobotics254@gmail.com</a>
      </p>
      <p style="margin-top: 15px; color: #999;">
        © ${currentYear} FIRST Global Team Kenya. All rights reserved.
      </p>
      <p style="color: #999;">
        This email was sent by FIRST Global Team Kenya. 
        If you didn't request this email, please ignore it.
      </p>
    </div>
  `
}