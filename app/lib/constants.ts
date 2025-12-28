/**
 * @file app/lib/constants.ts
 * @description Application constants and configuration
 * @author Team Kenya Dev
 */

// Program configurations
export const PROGRAMS = {
  FGC_2026: {
    id: 'fgc-2026',
    name: 'FGC 2026',
    description: 'FIRST Global Challenge 2026',
    shortName: '2026 Challenge'
  },
  FGC_2027: {
    id: 'fgc-2027',
    name: 'FGC 2027',
    description: 'FIRST Global Challenge 2027',
    shortName: '2027 Challenge'
  },
  MENTOR: {
    id: 'mentor',
    name: 'Mentor Program',
    description: 'Mentorship and leadership program',
    shortName: 'Mentor Program'
  }
} as const

// Navigation items
export const USER_NAVIGATION = {
  DASHBOARD: {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'Home'
  },
  APPLICATIONS: {
    label: 'My Applications',
    href: '/dashboard/applications',
    icon: 'FileText',
    children: [
      {
        label: PROGRAMS.FGC_2026.name,
        href: `/dashboard/applications/${PROGRAMS.FGC_2026.id}`,
        icon: 'FileText'
      },
      {
        label: PROGRAMS.FGC_2027.name,
        href: `/dashboard/applications/${PROGRAMS.FGC_2027.id}`,
        icon: 'FileText'
      },
      {
        label: PROGRAMS.MENTOR.name,
        href: `/dashboard/applications/${PROGRAMS.MENTOR.id}`,
        icon: 'FileText'
      }
    ]
  },
  SETTINGS: {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: 'Settings'
  }
} as const

export const ADMIN_NAVIGATION = {
  DASHBOARD: {
    label: 'Dashboard',
    href: '/admin',
    icon: 'BarChart3'
  },
  USER_MANAGEMENT: {
    label: 'User Management',
    href: '/admin/users',
    icon: 'Users'
  },
  APPLICATIONS: {
    label: 'Applications',
    href: '/admin/applications',
    icon: 'FileText'
  },
  EMAILS: {
    label: 'Emails',
    href: '/admin/emails',
    icon: 'Mail'
  },
  EVENTS: {
    label: 'Events',
    href: '/admin/events',
    icon: 'Calendar'
  }
} as const

// Application statuses
export const APPLICATION_STATUSES = {
  DRAFT: {
    label: 'Draft',
    description: 'Application in progress',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20'
  },
  SUBMITTED: {
    label: 'Submitted',
    description: 'Under review',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  REVIEWED: {
    label: 'Reviewed',
    description: 'Review completed',
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  REJECTED: {
    label: 'Rejected',
    description: 'Application rejected',
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-800/20'
  }
} as const

// Brand information
export const BRAND = {
  NAME: 'FIRST Global Team Kenya',
  SHORT_NAME: 'Team Kenya',
  LOGO_PATH: '/FGCLogo.png',
  PRIMARY_COLOR: '#006600',
  SECONDARY_COLOR: '#BB0000'
} as const

// Routes that don't show header/footer
export const NO_LAYOUT_ROUTES = [
  '/login',
  '/dashboard',
  '/admin',
  '/settings',
  '/applications'
] as const