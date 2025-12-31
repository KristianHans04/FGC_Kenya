/**
 * @file app/lib/constants/index.ts
 * @description Application constants for navigation, brand, and configuration
 * @author Team Kenya Dev
 */

import { FileText, Calendar } from 'lucide-react'

// Brand configuration
export const BRAND = {
  NAME: 'FIRST Global Team Kenya',
  SHORT_NAME: 'Team Kenya',
  LOGO_PATH: '/images/FGC_Logo.svg',
  DESCRIPTION: 'Inspiring the future of STEM in Kenya through robotics and innovation',
  SOCIAL: {
    TWITTER: '@TeamKenyaFGC',
    INSTAGRAM: '@teamkenyafgc',
    LINKEDIN: 'team-kenya-fgc',
    YOUTUBE: 'TeamKenyaFGC',
  },
} as const

// Program types for applications
export const PROGRAMS = {
  FGC_2026: {
    id: 'fgc_2026',
    name: 'FIRST Global Challenge 2026',
    description: 'Annual international robotics competition',
    year: 2026,
    icon: FileText,
    status: 'upcoming',
  },
  FGC_2027: {
    id: 'fgc_2027',
    name: 'FIRST Global Challenge 2027',
    description: 'Annual international robotics competition',
    year: 2027,
    icon: FileText,
    status: 'planning',
  },
  MENTORSHIP: {
    id: 'mentorship',
    name: 'Mentorship Program',
    description: 'Year-round mentorship for STEM students',
    year: null,
    icon: Calendar,
    status: 'active',
  },
} as const

// User navigation configuration
export const USER_NAVIGATION = {
  DASHBOARD: {
    label: 'Dashboard',
    href: '/dashboard',
  },
  APPLICATIONS: {
    label: 'My Applications',
    href: '/dashboard/applications',
    children: Object.values(PROGRAMS).map(program => ({
      label: program.name,
      href: `/dashboard/applications/${program.id}`,
    })),
  },
  SETTINGS: {
    label: 'Settings',
    href: '/dashboard/settings',
  },
} as const

// Admin navigation configuration
export const ADMIN_NAVIGATION = {
  DASHBOARD: {
    label: 'Dashboard',
    href: '/admin',
  },
  USER_MANAGEMENT: {
    label: 'User Management',
    href: '/admin/users',
  },
  APPLICATIONS: {
    label: 'Applications',
    href: '/admin/applications',
    children: Object.values(PROGRAMS).map(program => ({
      label: program.name,
      href: `/admin/applications/${program.id}`,
    })),
  },
  EMAILS: {
    label: 'Emails',
    href: '/admin/emails',
  },
  EVENTS: {
    label: 'Events',
    href: '/admin/events',
  },
} as const

// Application status types
export const APPLICATION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WAITLISTED: 'waitlisted',
} as const

// Alias for compatibility
export const APPLICATION_STATUSES = APPLICATION_STATUS

// Application status labels
export const APPLICATION_STATUS_LABELS = {
  [APPLICATION_STATUS.DRAFT]: 'Draft',
  [APPLICATION_STATUS.SUBMITTED]: 'Submitted',
  [APPLICATION_STATUS.UNDER_REVIEW]: 'Under Review',
  [APPLICATION_STATUS.SHORTLISTED]: 'Shortlisted',
  [APPLICATION_STATUS.ACCEPTED]: 'Accepted',
  [APPLICATION_STATUS.REJECTED]: 'Rejected',
  [APPLICATION_STATUS.WAITLISTED]: 'Waitlisted',
} as const

// Application status colors
export const APPLICATION_STATUS_COLORS = {
  [APPLICATION_STATUS.DRAFT]: 'text-gray-500 bg-gray-100',
  [APPLICATION_STATUS.SUBMITTED]: 'text-blue-600 bg-blue-100',
  [APPLICATION_STATUS.UNDER_REVIEW]: 'text-yellow-600 bg-yellow-100',
  [APPLICATION_STATUS.SHORTLISTED]: 'text-purple-600 bg-purple-100',
  [APPLICATION_STATUS.ACCEPTED]: 'text-green-600 bg-green-100',
  [APPLICATION_STATUS.REJECTED]: 'text-red-600 bg-red-100',
  [APPLICATION_STATUS.WAITLISTED]: 'text-orange-600 bg-orange-100',
} as const

// Email template types
export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  OTP_LOGIN: 'otp_login',
  APPLICATION_SUBMITTED: 'application_submitted',
  APPLICATION_ACCEPTED: 'application_accepted',
  APPLICATION_REJECTED: 'application_rejected',
  APPLICATION_SHORTLISTED: 'application_shortlisted',
  ACCOUNT_CREATED: 'account_created',
  ACCOUNT_UPDATED: 'account_updated',
  ACCOUNT_DELETED: 'account_deleted',
} as const

// Security constants
export const SECURITY = {
  MAX_OTP_ATTEMPTS: 3,
  OTP_EXPIRY_MINUTES: 5,
  OTP_LENGTH: 6,
  ACCOUNT_LOCK_DURATION_MINUTES: 15,
  SESSION_EXPIRY_HOURS: 24,
  REFRESH_TOKEN_EXPIRY_DAYS: 7,
  BCRYPT_ROUNDS: 12,
  RATE_LIMIT: {
    LOGIN: {
      MAX_REQUESTS: 5,
      WINDOW_MINUTES: 15,
    },
    API: {
      MAX_REQUESTS: 100,
      WINDOW_MINUTES: 15,
    },
  },
} as const

// Validation patterns
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(\+254|0)[17]\d{8}$/,
  NAME: /^[a-zA-Z\s-']+$/,
  OTP: /^\d{6}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const

// Error messages
export const ERROR_MESSAGES = {
  AUTHENTICATION: {
    INVALID_CREDENTIALS: 'Invalid email or OTP code',
    OTP_EXPIRED: 'OTP code has expired. Please request a new one.',
    TOO_MANY_ATTEMPTS: 'Too many attempts. Account temporarily locked.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    UNAUTHORIZED: 'You are not authorized to access this resource.',
    FORBIDDEN: 'You do not have permission to perform this action.',
  },
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid Kenyan phone number',
    INVALID_OTP: 'Please enter a valid 6-digit code',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
    PASSWORDS_DONT_MATCH: 'Passwords do not match',
  },
  APPLICATION: {
    ALREADY_SUBMITTED: 'You have already submitted an application for this program',
    DEADLINE_PASSED: 'The application deadline has passed',
    INCOMPLETE_PROFILE: 'Please complete your profile before applying',
    INVALID_AGE: 'You must be between 14 and 18 years old to apply',
  },
  NETWORK: {
    CONNECTION_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    TIMEOUT: 'Request timed out. Please try again.',
  },
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  AUTHENTICATION: {
    OTP_SENT: 'Verification code sent to your email',
    LOGIN_SUCCESS: 'Login successful! Redirecting...',
    LOGOUT_SUCCESS: 'You have been logged out successfully',
    ACCOUNT_CREATED: 'Account created successfully',
  },
  APPLICATION: {
    SAVED_DRAFT: 'Application saved as draft',
    SUBMITTED: 'Application submitted successfully',
    UPDATED: 'Application updated successfully',
  },
  PROFILE: {
    UPDATED: 'Profile updated successfully',
    IMAGE_UPLOADED: 'Profile image uploaded successfully',
  },
} as const

// Routes that don't show header/footer
export const NO_LAYOUT_ROUTES = [
  '/login',
  '/signup',
  '/dashboard',
  '/admin',
  '/mentor',
  '/student',
  '/alumni',
] as const

// Export all constants as a single object for convenience
export const CONSTANTS = {
  BRAND,
  PROGRAMS,
  USER_NAVIGATION,
  ADMIN_NAVIGATION,
  APPLICATION_STATUS,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  EMAIL_TEMPLATES,
  SECURITY,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  NO_LAYOUT_ROUTES,
} as const

export default CONSTANTS