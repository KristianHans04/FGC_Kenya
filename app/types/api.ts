/**
 * @file api.ts
 * @description API response and error type definitions
 * @author Team Kenya Dev
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
  meta?: ApiMeta
}

/**
 * API error structure
 */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
  stack?: string // Only in development
}

/**
 * API metadata for pagination, etc.
 */
export interface ApiMeta {
  page?: number
  limit?: number
  total?: number
  totalPages?: number
}

/**
 * Error codes for consistent error handling
 */
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_OTP = 'INVALID_OTP',
  OTP_EXPIRED = 'OTP_EXPIRED',
  OTP_MAX_ATTEMPTS = 'OTP_MAX_ATTEMPTS',
  SESSION_INVALID = 'SESSION_INVALID',
  
  // Authorization errors
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Application errors
  APPLICATION_NOT_FOUND = 'APPLICATION_NOT_FOUND',
  APPLICATION_ALREADY_SUBMITTED = 'APPLICATION_ALREADY_SUBMITTED',
  APPLICATION_CLOSED = 'APPLICATION_CLOSED',
  APPLICATIONS_FULL = 'APPLICATIONS_FULL',
  INVALID_APPLICATION_STATUS = 'INVALID_APPLICATION_STATUS',
  
  // Rate limiting
  RATE_LIMITED = 'RATE_LIMITED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EMAIL_ERROR = 'EMAIL_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

/**
 * HTTP status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Audit action types
 */
export enum AuditAction {
  // Authentication
  OTP_REQUESTED = 'OTP_REQUESTED',
  OTP_VERIFIED = 'OTP_VERIFIED',
  OTP_FAILED = 'OTP_FAILED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  SESSION_CREATED = 'SESSION_CREATED',
  SESSION_REVOKED = 'SESSION_REVOKED',
  
  // User Management
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  
  // Application Management
  APPLICATION_CREATED = 'APPLICATION_CREATED',
  APPLICATION_UPDATED = 'APPLICATION_UPDATED',
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
  APPLICATION_STATUS_CHANGED = 'APPLICATION_STATUS_CHANGED',
  APPLICATION_REVIEWED = 'APPLICATION_REVIEWED',
  APPLICATION_ACCEPTED = 'APPLICATION_ACCEPTED',
  APPLICATION_REJECTED = 'APPLICATION_REJECTED',
  APPLICATION_SHORTLISTED = 'APPLICATION_SHORTLISTED',
  APPLICATION_WITHDRAWN = 'APPLICATION_WITHDRAWN',
  
  // Admin Actions
  ADMIN_VIEWED_APPLICATION = 'ADMIN_VIEWED_APPLICATION',
  ADMIN_EXPORTED_DATA = 'ADMIN_EXPORTED_DATA',
  ADMIN_BULK_ACTION = 'ADMIN_BULK_ACTION',
}

/**
 * Email template types
 */
export enum EmailTemplate {
  OTP_LOGIN = 'otp-login',
  OTP_VERIFY_EMAIL = 'otp-verify-email',
  WELCOME = 'welcome',
  APPLICATION_RECEIVED = 'application-received',
  APPLICATION_SUBMITTED = 'application-submitted',
  APPLICATION_UNDER_REVIEW = 'application-under-review',
  APPLICATION_SHORTLISTED = 'application-shortlisted',
  APPLICATION_INTERVIEW_SCHEDULED = 'application-interview-scheduled',
  APPLICATION_ACCEPTED = 'application-accepted',
  APPLICATION_REJECTED = 'application-rejected',
  APPLICATION_WAITLISTED = 'application-waitlisted',
  ADMIN_NEW_APPLICATION = 'admin-new-application',
}

/**
 * Auth response after successful verification
 */
export interface AuthResponse {
  user: import('./auth').SafeUser
  token: string
  refreshToken: string
  expiresAt: string
}

/**
 * Request context with auth info
 */
export interface RequestContext {
  userId?: string
  sessionId?: string
  role?: string
  ipAddress?: string
  userAgent?: string
}
