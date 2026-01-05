import type { Metadata } from 'next'

const siteConfig = {
  name: 'FIRST Global Team Kenya',
  shortName: 'FGC Kenya',
  description: 'Inspiring young innovators through robotics and STEM education in Kenya',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://fgckenya.com',
  keywords: [
    'FIRST Global',
    'Team Kenya',
    'Robotics',
    'STEM Education',
    'Innovation',
    'Youth Development',
    'Kenya'
  ]
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.shortName}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: 'FGC Kenya Team' }],
  creator: 'FGC Kenya',
  publisher: 'FIRST Global Team Kenya',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: siteConfig.name
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    creator: '@FGCKenya',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

// Metadata configurations for all pages
export const pageMetadata = {
  // Public pages
  home: {
    title: 'Home',
    description: 'Welcome to FIRST Global Team Kenya - Inspiring young innovators through robotics and STEM education'
  },
  about: {
    title: 'About Us',
    description: 'Learn about FIRST Global Team Kenya\'s mission, values, and impact on youth STEM education'
  },
  contact: {
    title: 'Contact Us',
    description: 'Get in touch with FIRST Global Team Kenya. We\'d love to hear from you'
  },
  join: {
    title: 'Join the Team',
    description: 'Apply to join FIRST Global Team Kenya and be part of the robotics revolution'
  },
  support: {
    title: 'Support Us',
    description: 'Support FIRST Global Team Kenya through donations, sponsorships, and partnerships'
  },
  resources: {
    title: 'Resources',
    description: 'Educational resources, learning materials, and tools for STEM education'
  },
  news: {
    title: 'News & Updates',
    description: 'Latest news, updates, and achievements from FIRST Global Team Kenya'
  },
  media: {
    title: 'Media & Stories',
    description: 'Stories, articles, and media coverage of FIRST Global Team Kenya'
  },
  impact: {
    title: 'Our Impact',
    description: 'Discover the impact FIRST Global Team Kenya is making in STEM education across Kenya'
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Privacy policy and data protection information for FIRST Global Team Kenya'
  },
  terms: {
    title: 'Terms of Service',
    description: 'Terms of service and usage guidelines for FIRST Global Team Kenya website'
  },

  // Auth pages
  login: {
    title: 'Sign In',
    description: 'Sign in to your FIRST Global Team Kenya account'
  },
  signup: {
    title: 'Sign Up',
    description: 'Create your FIRST Global Team Kenya account'
  },

  // Dashboard pages
  dashboard: {
    title: 'Dashboard',
    description: 'Your personal dashboard for FIRST Global Team Kenya'
  },
  'dashboard/applications': {
    title: 'My Applications',
    description: 'View and manage your team applications'
  },
  'dashboard/settings': {
    title: 'Account Settings',
    description: 'Manage your account settings and profile information'
  },

  // Admin pages
  admin: {
    title: 'Admin Dashboard',
    description: 'Administrative dashboard for FIRST Global Team Kenya'
  },
  'admin/analytics': {
    title: 'Analytics',
    description: 'Platform analytics and performance metrics'
  },
  'admin/users': {
    title: 'User Management',
    description: 'Manage platform users and permissions'
  },
  'admin/applications': {
    title: 'Application Management',
    description: 'Review and manage team applications'
  },
  'admin/applications/forms': {
    title: 'Application Forms',
    description: 'Create and manage application forms'
  },
  'admin/emails': {
    title: 'Email Management',
    description: 'Manage email communications and templates'
  },
  'admin/emails/campaigns': {
    title: 'Email Campaigns',
    description: 'Create and manage email campaigns'
  },
  'admin/emails/compose': {
    title: 'Compose Email',
    description: 'Compose and send emails to users'
  },
  'admin/emails/groups': {
    title: 'Email Groups',
    description: 'Manage email distribution groups'
  },
  'admin/emails/inbox': {
    title: 'Email Inbox',
    description: 'View and manage incoming emails'
  },
  'admin/events': {
    title: 'Event Management',
    description: 'Create and manage events'
  },
  'admin/media': {
    title: 'Media Management',
    description: 'Manage media content and uploads'
  },
  'admin/payments': {
    title: 'Payment Tracking',
    description: 'Track and manage payments'
  },
  'admin/super': {
    title: 'Super Admin',
    description: 'Super admin controls and system management'
  },
  'admin/super/users': {
    title: 'System Users',
    description: 'Advanced user management and role assignments'
  },

  // Student pages
  student: {
    title: 'Student Dashboard',
    description: 'Student dashboard for FIRST Global Team Kenya'
  },
  'student/profile': {
    title: 'Student Profile',
    description: 'Manage your student profile and information'
  },
  'student/training': {
    title: 'Training Modules',
    description: 'Access your training modules and learning materials'
  },
  'student/team': {
    title: 'My Team',
    description: 'View your team members and collaboration tools'
  },
  'student/resources': {
    title: 'Learning Resources',
    description: 'Access learning resources and study materials'
  },
  'student/achievements': {
    title: 'Achievements',
    description: 'View your achievements and progress'
  },
  'student/media': {
    title: 'Media Submissions',
    description: 'Submit and manage your media content'
  },

  // Mentor pages
  mentor: {
    title: 'Mentor Dashboard',
    description: 'Mentor dashboard for FIRST Global Team Kenya'
  },
  'mentor/profile': {
    title: 'Mentor Profile',
    description: 'Manage your mentor profile and expertise'
  },
  'mentor/students': {
    title: 'My Students',
    description: 'View and manage your assigned students'
  },
  'mentor/sessions': {
    title: 'Mentoring Sessions',
    description: 'Schedule and manage mentoring sessions'
  },
  'mentor/sessions/schedule': {
    title: 'Session Schedule',
    description: 'View and manage your mentoring schedule'
  },
  'mentor/resources': {
    title: 'Teaching Resources',
    description: 'Access teaching materials and resources'
  },
  'mentor/messages': {
    title: 'Messages',
    description: 'Communicate with students and team members'
  },
  'mentor/media/pending': {
    title: 'Pending Media Review',
    description: 'Review and approve student media submissions'
  },

  // Alumni pages
  alumni: {
    title: 'Alumni Dashboard',
    description: 'Alumni network dashboard for FIRST Global Team Kenya'
  },
  'alumni/profile': {
    title: 'Alumni Profile',
    description: 'Manage your alumni profile and career information'
  },
  'alumni/network': {
    title: 'Alumni Network',
    description: 'Connect with FIRST Global Team Kenya alumni'
  },
  'alumni/events': {
    title: 'Alumni Events',
    description: 'Discover and join alumni events'
  },
  'alumni/jobs': {
    title: 'Job Board',
    description: 'Explore career opportunities for alumni'
  },
  'alumni/mentorship': {
    title: 'Alumni Mentorship',
    description: 'Give back by mentoring current students'
  },
  'alumni/stories': {
    title: 'Success Stories',
    description: 'Read inspiring stories from our alumni'
  }
}

// Helper function to generate metadata for a specific page
export function generatePageMetadata(path: string): Metadata {
  const config = pageMetadata[path as keyof typeof pageMetadata]
  if (!config) {
    return defaultMetadata
  }

  return {
    title: config.title,
    description: config.description,
    openGraph: {
      title: `${config.title} | ${siteConfig.shortName}`,
      description: config.description,
      url: `${siteConfig.url}/${path}`,
      siteName: siteConfig.name,
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: config.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${config.title} | ${siteConfig.shortName}`,
      description: config.description,
      creator: '@FGCKenya',
      images: ['/og-image.png']
    }
  }
}

// For dynamic pages
export function generateDynamicMetadata(
  title: string,
  description: string,
  path?: string
): Metadata {
  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteConfig.shortName}`,
      description,
      url: path ? `${siteConfig.url}/${path}` : siteConfig.url,
      siteName: siteConfig.name,
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteConfig.shortName}`,
      description,
      creator: '@FGCKenya',
      images: ['/og-image.png']
    }
  }
}