/**
 * @file application.ts
 * @description Application and related type definitions
 * @author Team Kenya Dev
 */

/**
 * Application status values
 */
export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEWED = 'INTERVIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WAITLISTED = 'WAITLISTED',
  WITHDRAWN = 'WITHDRAWN',
}

/**
 * Experience level values
 */
export enum ExperienceLevel {
  NONE = 'NONE',
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

/**
 * Interest area options
 */
export const INTEREST_AREAS = [
  { id: 'programming', label: 'Programming & Software' },
  { id: 'mechanical', label: 'Mechanical Engineering' },
  { id: 'electrical', label: 'Electrical Engineering' },
  { id: 'design', label: 'Design & CAD' },
  { id: 'strategy', label: 'Strategy & Planning' },
  { id: 'outreach', label: 'Community Outreach' },
  { id: 'media', label: 'Media & Documentation' },
  { id: 'leadership', label: 'Team Leadership' },
] as const

export type InterestAreaId = typeof INTEREST_AREAS[number]['id']

/**
 * Kenyan counties list
 */
export const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet',
  'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado',
  'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga',
  'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
  'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
  'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
  'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga',
  'Wajir', 'West Pokot',
] as const

export type KenyanCounty = typeof KENYAN_COUNTIES[number]

/**
 * Application data structure
 */
export interface Application {
  id: string
  userId: string
  season: string
  status: ApplicationStatus
  
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: Date
  gender: string | null
  nationality: string
  
  // Educational Information
  school: string
  grade: string
  county: string
  
  // Experience & Interest
  experience: ExperienceLevel
  interests: string[]
  motivation: string
  
  // Additional Information
  previouslyApplied: boolean
  hearAboutUs: string | null
  additionalInfo: string | null
  
  // Documents
  resumeUrl: string | null
  recommendationUrl: string | null
  
  // Consent
  parentConsent: boolean
  termsAccepted: boolean
  parentEmail: string | null
  parentPhone: string | null
  
  // Admin Review
  reviewNotes: string | null
  reviewedBy: string | null
  reviewedAt: Date | null
  interviewDate: Date | null
  interviewNotes: string | null
  finalScore: number | null
  
  // Timestamps
  submittedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Application status history entry
 */
export interface ApplicationStatusHistory {
  id: string
  applicationId: string
  previousStatus: ApplicationStatus | null
  newStatus: ApplicationStatus
  notes: string | null
  changedBy: string | null
  createdAt: Date
}

/**
 * Application form input (for creating/updating)
 */
export interface ApplicationFormInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string // ISO date string
  gender?: string
  school: string
  grade: string
  county: string
  experience: ExperienceLevel
  interests: string[]
  motivation: string
  previouslyApplied?: boolean
  hearAboutUs?: string
  additionalInfo?: string
  parentConsent: boolean
  termsAccepted: boolean
  parentEmail?: string
  parentPhone?: string
}

/**
 * Application submission input
 */
export interface SubmitApplicationInput {
  applicationId: string
}

/**
 * Admin review input
 */
export interface ReviewApplicationInput {
  applicationId: string
  status: ApplicationStatus
  notes?: string
  interviewDate?: string
  finalScore?: number
}

/**
 * Application list filters
 */
export interface ApplicationFilters {
  status?: ApplicationStatus | ApplicationStatus[]
  season?: string
  county?: string
  experience?: ExperienceLevel
  search?: string
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'submittedAt' | 'firstName' | 'lastName' | 'status'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Paginated application list response
 */
export interface PaginatedApplications {
  applications: Application[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Application statistics for admin dashboard
 */
export interface ApplicationStats {
  total: number
  byStatus: Record<ApplicationStatus, number>
  byCounty: Record<string, number>
  byExperience: Record<ExperienceLevel, number>
  recentSubmissions: number // Last 7 days
}

/**
 * Season settings structure
 */
export interface SeasonSettings {
  id: string
  season: string
  applicationOpenDate: Date
  applicationCloseDate: Date
  reviewStartDate: Date | null
  interviewStartDate: Date | null
  announcementDate: Date | null
  isActive: boolean
  maxApplications: number
  currentApplications: number
}
