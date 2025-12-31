/**
 * @file welcome.ts
 * @description Welcome email templates for new users
 * @author Team Kenya Dev
 */

import { createBaseTemplate } from './base'
import { EmailButton, InfoBox, Divider } from './components'

/**
 * Welcome email data structure
 */
export interface WelcomeEmailData {
  firstName: string
  lastName?: string
  email: string
  userType?: 'student' | 'mentor' | 'admin'
  dashboardUrl?: string
  resourcesUrl?: string
  communityUrl?: string
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
 * Creates a welcome email template for new users
 * @param data - Welcome email data
 * @returns Complete welcome email template
 */
export function createWelcomeTemplate(data: WelcomeEmailData): EmailTemplate {
  const { 
    firstName, 
    lastName, 
    userType = 'student',
    dashboardUrl = process.env.NEXT_PUBLIC_APP_URL + '/dashboard',
    resourcesUrl = process.env.NEXT_PUBLIC_APP_URL + '/resources',
    communityUrl = process.env.NEXT_PUBLIC_APP_URL + '/about'
  } = data
  
  const fullName = lastName ? `${firstName} ${lastName}` : firstName
  const subject = `Welcome to FIRST Global Team Kenya, ${firstName}!`
  const preheader = `Your journey into Kenyan STEM excellence begins now`
  
  const userSpecificContent = getUserTypeContent(userType, dashboardUrl)
  
  const htmlContent = `
    <h2>Welcome, ${firstName}! 🇰🇪</h2>
    
    <p>Thank you for joining <strong>FIRST Global Team Kenya</strong>. 
    We're excited to have you as part of our community of aspiring robotics enthusiasts and STEM advocates!</p>
    
    ${InfoBox(
      'Your Journey Starts Here',
      `As a ${userType}, you're now part of a community that has been representing Kenya on the global stage since 2017, inspiring the next generation of innovators.`,
      'success'
    )}
    
    <h3>What's Next?</h3>
    ${userSpecificContent}
    
    <div style="background: linear-gradient(90deg, #00000010, #BB000010, #00660010); padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Quick Links to Get Started</h3>
      <div style="text-align: center;">
        ${EmailButton('Go to Dashboard', dashboardUrl, 'primary')}
        ${EmailButton('Explore Resources', resourcesUrl, 'secondary')}
      </div>
    </div>
    
    ${Divider()}
    
    <p><strong>Need help?</strong> Feel free to reach out to us at 
    <a href="mailto:teamkenyarobotics254@gmail.com" style="color: #006600;">teamkenyarobotics254@gmail.com</a>. 
    Our team is here to support your STEM journey.</p>
    
    <p>Welcome aboard!</p>
    <p><strong>The FIRST Global Team Kenya Family</strong></p>
  `
  
  const html = createBaseTemplate(htmlContent, {
    title: 'Welcome to Team Kenya - FIRST Global',
    preheader
  })
  
  const text = `
Welcome, ${firstName}!

Thank you for joining FIRST Global Team Kenya. We're excited to have you as part of our community of aspiring robotics enthusiasts and STEM advocates!

As a ${userType}, you're now part of a community that has been representing Kenya on the global stage since 2017.

What's Next?
${getTextUserTypeContent(userType)}

Quick Links:
- Dashboard: ${dashboardUrl}
- Resources: ${resourcesUrl}
- About Team Kenya: ${communityUrl}

Need help? Reach out to teamkenyarobotics254@gmail.com

Welcome aboard!
The FIRST Global Team Kenya Family
  `.trim()
  
  return { subject, html, text }
}

/**
 * Get user type-specific content for HTML emails
 * @param userType - Type of user
 * @param dashboardUrl - Dashboard URL
 * @returns HTML content string
 */
function getUserTypeContent(userType: string, dashboardUrl: string): string {
  switch (userType) {
    case 'student':
      return `
        <ul style="line-height: 1.8;">
          <li><strong>Complete Your Profile:</strong> Set up your student profile with your interests and experience level.</li>
          <li><strong>Explore Application Process:</strong> Learn about applying for our team selection process.</li>
          <li><strong>Access Learning Resources:</strong> Dive into our robotics and STEM learning materials.</li>
          <li><strong>Join Our Community:</strong> Connect with fellow students and mentors through our programs.</li>
          <li><strong>Stay Updated:</strong> Follow our latest news, competitions, and achievements.</li>
        </ul>
      `
    case 'mentor':
      return `
        <ul style="line-height: 1.8;">
          <li><strong>Complete Your Mentor Profile:</strong> Share your expertise and areas of mentorship.</li>
          <li><strong>Explore Mentorship Opportunities:</strong> See how you can guide our talented students.</li>
          <li><strong>Access Mentor Resources:</strong> Find tools and materials to support student learning.</li>
          <li><strong>Connect with the Team:</strong> Meet our current mentors and students.</li>
          <li><strong>Join Our Mission:</strong> Help us inspire the next generation of Kenyan STEM leaders.</li>
        </ul>
      `
    case 'admin':
      return `
        <ul style="line-height: 1.8;">
          <li><strong>Access Admin Dashboard:</strong> Review applications and manage team operations.</li>
          <li><strong>Monitor Team Activities:</strong> Track student progress and mentor engagement.</li>
          <li><strong>Manage Resources:</strong> Update content and maintain learning materials.</li>
          <li><strong>Coordinate Programs:</strong> Organize outreach events and competitions.</li>
          <li><strong>Support the Mission:</strong> Lead Team Kenya's STEM education initiatives.</li>
        </ul>
      `
    default:
      return `
        <ul style="line-height: 1.8;">
          <li><strong>Explore Your Dashboard:</strong> Get familiar with your personalized space.</li>
          <li><strong>Discover Resources:</strong> Access our comprehensive STEM learning materials.</li>
          <li><strong>Learn About Our Mission:</strong> Understand Team Kenya's impact in STEM education.</li>
          <li><strong>Connect with the Community:</strong> Meet students, mentors, and supporters.</li>
          <li><strong>Stay Engaged:</strong> Follow our journey and upcoming opportunities.</li>
        </ul>
      `
  }
}

/**
 * Get user type-specific content for text emails
 * @param userType - Type of user
 * @returns Text content string
 */
function getTextUserTypeContent(userType: string): string {
  switch (userType) {
    case 'student':
      return `
- Complete Your Profile: Set up your student profile with interests and experience
- Explore Application Process: Learn about team selection
- Access Learning Resources: Dive into robotics and STEM materials
- Join Our Community: Connect with fellow students and mentors
- Stay Updated: Follow our latest news and achievements
      `.trim()
    case 'mentor':
      return `
- Complete Your Mentor Profile: Share your expertise and mentorship areas
- Explore Mentorship Opportunities: Guide our talented students
- Access Mentor Resources: Find tools to support student learning
- Connect with the Team: Meet current mentors and students
- Join Our Mission: Inspire the next generation of Kenyan STEM leaders
      `.trim()
    case 'admin':
      return `
- Access Admin Dashboard: Review applications and manage operations
- Monitor Team Activities: Track student progress and engagement
- Manage Resources: Update content and learning materials
- Coordinate Programs: Organize outreach events and competitions
- Support the Mission: Lead Team Kenya's STEM initiatives
      `.trim()
    default:
      return `
- Explore Your Dashboard: Get familiar with your personalized space
- Discover Resources: Access comprehensive STEM learning materials
- Learn About Our Mission: Understand Team Kenya's STEM education impact
- Connect with the Community: Meet students, mentors, and supporters
- Stay Engaged: Follow our journey and upcoming opportunities
      `.trim()
  }
}