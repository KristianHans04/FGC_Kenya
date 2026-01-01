/**
 * @file auth.ts
 * @description Authentication and user type definitions
 * @author Team Kenya Dev
 */

/**
 * User roles for authorization
 */
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MENTOR = 'MENTOR',
  STUDENT = 'STUDENT',
  ALUMNI = 'ALUMNI',
  USER = 'USER',
}

/**
 * Legacy role enum for backwards compatibility
 * @deprecated Use Role enum instead
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

/**
 * Cohort roles
 */
export enum CohortRole {
  MENTOR = 'MENTOR',
  STUDENT = 'STUDENT',
}

/**
 * OTP types for different authentication flows
 */
export enum OTPType {
  LOGIN = 'LOGIN',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  ACCOUNT_RECOVERY = 'ACCOUNT_RECOVERY',
}

/**
 * User data structure
 */
export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  school: string | null
  isActive: boolean
  emailVerified: boolean
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
  currentRole?: Role // Helper to get active role
  currentCohort?: string // Helper to get active cohort
}

/**
 * Safe user data (without sensitive fields) for client-side
 */
export interface SafeUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  school: string | null
  emailVerified: boolean
  role?: Role  // Direct role field for streamlined schema
  roles?: {
    role: Role
    cohort: string | null
    isActive: boolean
  }[]  // Optional for backwards compatibility
  currentRole?: Role
  currentCohort?: string | null
}

/**
 * Cohort member data
 */
export interface CohortMember {
  id: string
  cohort: string
  role: CohortRole
  joinedAt: Date
  leftAt: Date | null
  isActive: boolean
  user: User
}

/**
 * Session data structure
 */
export interface Session {
  id: string
  token: string
  refreshToken: string | null
  userId: string
  userAgent: string | null
  ipAddress: string | null
  expiresAt: Date
  isValid: boolean
  createdAt: Date
}

/**
 * OTP code data structure
 */
export interface OTPCode {
  id: string
  code: string
  type: OTPType
  userId: string
  expiresAt: Date
  used: boolean
  usedAt: Date | null
  attempts: number
  createdAt: Date
}

/**
 * JWT payload structure
 */
export interface JWTPayload {
  userId: string
  email: string
  roles: {
    role: Role
    cohort: string | null
  }[]
  sessionId: string
  iat: number
  exp: number
}

/**
 * Authentication context for components
 */
export interface AuthContextType {
  user: SafeUser | null
  isLoading: boolean
  isAuthenticated: boolean
  hasRole: (role: Role, cohort?: string) => boolean
  hasAnyRole: (roles: Role[]) => boolean
  isSuperAdmin: () => boolean
  isAdmin: () => boolean
  isMentor: (cohort?: string) => boolean
  isStudent: (cohort?: string) => boolean
  isAlumni: () => boolean
  login: (email: string) => Promise<{ success: boolean; data?: { otpSentAt: number }; error?: { message: string } }>
  verifyOTP: (email: string, code: string) => Promise<{ success: boolean; data?: any; error?: { message: string } }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

/**
 * Request OTP input
 */
export interface RequestOTPInput {
  email: string
  type?: OTPType
}

/**
 * Verify OTP input
 */
export interface VerifyOTPInput {
  email: string
  code: string
}

/**
 * Auth response after successful verification
 */
export interface AuthResponse {
  user: SafeUser
  token: string
  refreshToken: string
  expiresAt: string
  redirectUrl?: string
}

/**
 * Token refresh input
 */
export interface RefreshTokenInput {
  refreshToken: string
}

/**
 * Role permission check helpers
 */
export const rolePermissions = {
  // Super Admin has access to everything
  [Role.SUPER_ADMIN]: {
    canViewAllUsers: true,
    canManageUsers: true,
    canAssignRoles: true,
    canViewPayments: true,
    canManageApplications: true,
    canManageMedia: true,
    canSendEmails: true,
    canViewAnalytics: true,
    canExportData: true,
  },
  // Admin has most privileges except payment tracking
  [Role.ADMIN]: {
    canViewAllUsers: false, // Must search by email
    canManageUsers: true,
    canAssignRoles: true,
    canViewPayments: false,
    canManageApplications: true,
    canManageMedia: true,
    canSendEmails: true,
    canViewAnalytics: true,
    canExportData: true,
  },
  // Mentor can manage their cohort
  [Role.MENTOR]: {
    canViewAllUsers: false,
    canManageUsers: false,
    canAssignRoles: false,
    canViewPayments: false,
    canManageApplications: false,
    canManageMedia: true, // Own articles
    canSendEmails: false,
    canViewAnalytics: false,
    canExportData: false,
    canViewCohortStudents: true,
    canApproveStudentContent: true,
  },
  // Student can create content
  [Role.STUDENT]: {
    canViewAllUsers: false,
    canManageUsers: false,
    canAssignRoles: false,
    canViewPayments: false,
    canManageApplications: false,
    canManageMedia: true, // Own articles, needs approval
    canSendEmails: false,
    canViewAnalytics: false,
    canExportData: false,
    canViewCohortMembers: true,
  },
  // Alumni have limited access
  [Role.ALUMNI]: {
    canViewAllUsers: false,
    canManageUsers: false,
    canAssignRoles: false,
    canViewPayments: false,
    canManageApplications: false,
    canManageMedia: false,
    canSendEmails: false,
    canViewAnalytics: false,
    canExportData: false,
    canAccessAlumniNetwork: true,
  },
  // Regular user has minimal access
  [Role.USER]: {
    canViewAllUsers: false,
    canManageUsers: false,
    canAssignRoles: false,
    canViewPayments: false,
    canManageApplications: false,
    canManageMedia: false,
    canSendEmails: false,
    canViewAnalytics: false,
    canExportData: false,
    canApplyToProgram: true,
  },
};

/**
 * Check if a user has permission for an action
 */
export function hasPermission(role: Role, permission: keyof typeof rolePermissions[Role]): boolean {
  const permissions = rolePermissions[role];
  if (!permissions) return false;
  return (permissions as any)[permission] === true;
}

