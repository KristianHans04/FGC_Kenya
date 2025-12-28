/**
 * @file validations/application.ts
 * @description Zod validation schemas for applications
 * @author Team Kenya Dev
 */

import { z } from 'zod'
import { KENYAN_COUNTIES, INTEREST_AREAS } from '@/app/types/application'

/**
 * Email validation pattern
 */
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/**
 * Kenyan phone number validation pattern
 */
const kenyanPhonePattern = /^(\+254|0)[17]\d{8}$/

/**
 * Name validation pattern
 */
const namePattern = /^[a-zA-Z\s\-']+$/

/**
 * Calculate age from date of birth
 */
const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--
  }
  return age
}

/**
 * Application form validation schema
 */
export const applicationFormSchema = z.object({
  // Personal Information
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(namePattern, 'First name can only contain letters, spaces, hyphens, and apostrophes'),

  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(namePattern, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),

  email: z
    .string()
    .min(1, 'Email is required')
    .max(100, 'Email is too long')
    .regex(emailPattern, 'Please enter a valid email address')
    .transform((val) => val.toLowerCase().trim()),

  phone: z
    .string()
    .regex(kenyanPhonePattern, 'Please enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)'),

  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Please enter a valid date')
    .transform((val) => new Date(val))
    .refine((date) => {
      const age = calculateAge(date)
      return age >= 14 && age <= 18
    }, 'Applicants must be between 14 and 18 years old'),

  gender: z
    .enum(['male', 'female', 'other', 'prefer_not_to_say'])
    .optional(),

  // Educational Information
  school: z
    .string()
    .min(5, 'School name must be at least 5 characters')
    .max(100, 'School name must be less than 100 characters'),

  grade: z
    .string()
    .refine((grade) => {
      const gradeNum = parseInt(grade, 10)
      return gradeNum >= 9 && gradeNum <= 12
    }, 'Grade must be between 9 and 12 (Form 1-4)'),

  county: z
    .string()
    .refine(
      (val) => KENYAN_COUNTIES.includes(val as typeof KENYAN_COUNTIES[number]),
      'Please select a valid Kenyan county'
    ),

  // Experience & Interest
  experience: z.enum(['NONE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'], {
    message: 'Please select your experience level',
  }),

  interests: z
    .array(z.string())
    .min(1, 'Please select at least one area of interest')
    .max(5, 'Please select at most 5 areas of interest')
    .refine(
      (vals) => vals.every((val) => INTEREST_AREAS.some((area) => area.id === val)),
      'Invalid interest area selected'
    ),

  motivation: z
    .string()
    .min(100, 'Please write at least 100 characters about your motivation')
    .max(1000, 'Motivation statement must be less than 1000 characters'),

  // Additional Information
  previouslyApplied: z.boolean().optional().default(false),

  hearAboutUs: z
    .enum(['social_media', 'school', 'friend', 'news', 'website', 'other'])
    .optional(),

  additionalInfo: z
    .string()
    .max(500, 'Additional information must be less than 500 characters')
    .optional(),

  // Parent/Guardian Information
  parentEmail: z
    .string()
    .regex(emailPattern, 'Please enter a valid parent/guardian email address')
    .optional()
    .nullable(),

  parentPhone: z
    .string()
    .regex(kenyanPhonePattern, 'Please enter a valid parent/guardian phone number')
    .optional()
    .nullable(),

  // Consent
  parentConsent: z
    .boolean()
    .refine((val) => val === true, 'Parent/guardian consent is required'),

  termsAccepted: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
})

export type ApplicationFormInput = z.infer<typeof applicationFormSchema>

/**
 * Application update schema (partial, for drafts)
 */
export const applicationUpdateSchema = applicationFormSchema.partial()

export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>

/**
 * Admin review application schema
 */
export const reviewApplicationSchema = z.object({
  status: z.enum([
    'UNDER_REVIEW',
    'SHORTLISTED',
    'INTERVIEW_SCHEDULED',
    'INTERVIEWED',
    'ACCEPTED',
    'REJECTED',
    'WAITLISTED',
  ]),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
  interviewDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Please enter a valid date')
    .optional()
    .nullable(),
  interviewNotes: z.string().max(2000, 'Interview notes must be less than 2000 characters').optional(),
  finalScore: z
    .number()
    .min(0, 'Score must be at least 0')
    .max(100, 'Score must be at most 100')
    .optional()
    .nullable(),
})

export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>

/**
 * Bulk status update schema
 */
export const bulkStatusUpdateSchema = z.object({
  applicationIds: z
    .array(z.string().uuid('Invalid application ID'))
    .min(1, 'At least one application must be selected')
    .max(50, 'Maximum 50 applications can be updated at once'),
  status: z.enum([
    'UNDER_REVIEW',
    'SHORTLISTED',
    'REJECTED',
    'WAITLISTED',
  ]),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
})

export type BulkStatusUpdateInput = z.infer<typeof bulkStatusUpdateSchema>

/**
 * Application filter schema
 */
export const applicationFilterSchema = z.object({
  status: z
    .union([
      z.enum([
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'SHORTLISTED',
        'INTERVIEW_SCHEDULED',
        'INTERVIEWED',
        'ACCEPTED',
        'REJECTED',
        'WAITLISTED',
        'WITHDRAWN',
      ]),
      z.array(
        z.enum([
          'DRAFT',
          'SUBMITTED',
          'UNDER_REVIEW',
          'SHORTLISTED',
          'INTERVIEW_SCHEDULED',
          'INTERVIEWED',
          'ACCEPTED',
          'REJECTED',
          'WAITLISTED',
          'WITHDRAWN',
        ])
      ),
    ])
    .optional(),
  season: z.string().optional(),
  county: z.string().optional(),
  experience: z.enum(['NONE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z
    .enum(['createdAt', 'submittedAt', 'firstName', 'lastName', 'status'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

export type ApplicationFilterInput = z.infer<typeof applicationFilterSchema>
