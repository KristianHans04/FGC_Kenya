/**
 * Navigation constants for all user roles
 */

import {
  Home,
  FileText,
  Settings,
  Users,
  Mail,
  Calendar,
  BarChart3,
  BookOpen,
  Award,
  MessageSquare,
  Briefcase,
  GraduationCap,
  Shield,
  Database,
  Send,
  Inbox,
  Edit,
  Network
} from 'lucide-react'

// SUPER ADMIN Navigation - Full system access  
export const SUPER_ADMIN_NAVIGATION = {
  USER_MANAGEMENT: {
    label: 'User Management',
    href: '/admin/super/users',
    icon: Users,
  },
  APPLICATIONS: {
    label: 'Applications',
    href: '/admin/applications',
    icon: FileText,
  },
  FORMS: {
    label: 'Form Builder',
    href: '/admin/applications/forms',
    icon: FileText,
  },
  EMAILS: {
    label: 'Email Inbox',
    href: '/admin/emails/inbox',
    icon: Mail,
  },
  EMAIL_GROUPS: {
    label: 'Email Groups',
    href: '/admin/emails/groups',
    icon: Users,
  },
  CAMPAIGNS: {
    label: 'Campaigns',
    href: '/admin/emails/campaigns', 
    icon: Send,
  },
  MEDIA: {
    label: 'Media Management',
    href: '/admin/media',
    icon: BookOpen,
  },
  PAYMENTS: {
    label: 'Payment Tracking',
    href: '/admin/payments',
    icon: Database,
  },
  ANALYTICS: {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
}

// ADMIN Navigation - Standard admin access
export const ADMIN_NAVIGATION = {
  DASHBOARD: {
    label: 'Admin Dashboard',
    href: '/admin',
    icon: BarChart3,
  },
  USER_MANAGEMENT: {
    label: 'User Management',
    href: '/admin/users',
    icon: Users,
  },
  APPLICATIONS: {
    label: 'Applications',
    href: '/admin/applications',
    icon: FileText,
  },
  FORMS: {
    label: 'Application Forms',
    href: '/admin/applications/forms',
    icon: Edit,
  },
  INBOX: {
    label: 'Email Inbox',
    href: '/admin/emails/inbox',
    icon: Inbox,
  },
  EMAIL_GROUPS: {
    label: 'Email Groups',
    href: '/admin/emails/groups',
    icon: Users,
  },
  CAMPAIGNS: {
    label: 'Email Campaigns',
    href: '/admin/emails/campaigns',
    icon: Send,
  },
  MEDIA: {
    label: 'Media',
    href: '/admin/media',
    icon: BookOpen,
  },
}

// MENTOR Navigation
export const MENTOR_NAVIGATION = {
  DASHBOARD: {
    label: 'Mentor Dashboard',
    href: '/mentor',
    icon: Home,
  },
  STUDENTS: {
    label: 'My Students',
    href: '/mentor/students',
    icon: GraduationCap,
  },
  RESOURCES: {
    label: 'Teaching Resources',
    href: '/mentor/resources',
    icon: BookOpen,
  },
  SESSIONS: {
    label: 'Training Sessions',
    href: '/mentor/sessions',
    icon: Calendar,
  },
  MEDIA_APPROVALS: {
    label: 'Review Articles',
    href: '/mentor/media',
    icon: FileText,
  },
  MESSAGES: {
    label: 'Messages',
    href: '/mentor/messages',
    icon: MessageSquare,
  },
  PROFILE: {
    label: 'My Profile',
    href: '/mentor/profile',
    icon: Settings,
  },
}

// STUDENT Navigation
export const STUDENT_NAVIGATION = {
  DASHBOARD: {
    label: 'Student Dashboard',
    href: '/student',
    icon: Home,
  },
  TRAINING: {
    label: 'Training Modules',
    href: '/student/training',
    icon: BookOpen,
  },
  MEDIA: {
    label: 'My Content',
    href: '/student/media',
    icon: FileText,
  },
  TEAM: {
    label: 'My Team',
    href: '/student/team',
    icon: Users,
  },
  ACHIEVEMENTS: {
    label: 'Achievements',
    href: '/student/achievements',
    icon: Award,
  },
  RESOURCES: {
    label: 'Resources',
    href: '/student/resources',
    icon: BookOpen,
  },
  PROFILE: {
    label: 'My Profile',
    href: '/student/profile',
    icon: Settings,
  },
}

// ALUMNI Navigation
export const ALUMNI_NAVIGATION = {
  DASHBOARD: {
    label: 'Alumni Dashboard',
    href: '/alumni',
    icon: Home,
  },
  NETWORK: {
    label: 'Alumni Network',
    href: '/alumni/network',
    icon: Users,
  },
  MENTORSHIP: {
    label: 'Mentorship',
    href: '/alumni/mentorship',
    icon: Briefcase,
  },
  STORIES: {
    label: 'Success Stories',
    href: '/alumni/stories',
    icon: Award,
  },
  EVENTS: {
    label: 'Alumni Events',
    href: '/alumni/events',
    icon: Calendar,
  },
  JOBS: {
    label: 'Job Board',
    href: '/alumni/jobs',
    icon: Briefcase,
  },
  PROFILE: {
    label: 'My Profile',
    href: '/alumni/profile',
    icon: Settings,
  },
}

// USER Navigation (Applicants/Regular Users)
export const USER_NAVIGATION = {
  DASHBOARD: {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  APPLICATIONS: {
    label: 'Applications',
    href: '/dashboard/applications',
    icon: FileText,
  },
  PROFILE: {
    label: 'My Profile',
    href: '/dashboard/settings',
    icon: Settings,
  },
}

// Get navigation based on role
export function getNavigationByRole(role: string) {
  switch (role) {
    case 'SUPER_ADMIN':
      return Object.values(SUPER_ADMIN_NAVIGATION)
    case 'ADMIN':
      return Object.values(ADMIN_NAVIGATION)
    case 'MENTOR':
      return Object.values(MENTOR_NAVIGATION)
    case 'STUDENT':
      return Object.values(STUDENT_NAVIGATION)
    case 'ALUMNI':
      return Object.values(ALUMNI_NAVIGATION)
    case 'USER':
    default:
      return Object.values(USER_NAVIGATION)
  }
}

// Get dashboard route by role
export function getDashboardRoute(role: string) {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/admin/super/users'
    case 'ADMIN':
      return '/admin'
    case 'MENTOR':
      return '/mentor'
    case 'STUDENT':
      return '/student'
    case 'ALUMNI':
      return '/alumni'
    case 'USER':
    default:
      return '/dashboard'
  }
}