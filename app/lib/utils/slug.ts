/**
 * Secure slug generation utilities
 * Uses native crypto API for cryptographically secure, URL-safe identifiers
 * Optimized for database indexing and query performance
 */

import { generateId as generateCustomId } from './id'

// Create a custom ID generator with URL-safe characters
// Excludes similar-looking characters for better UX
const generateId = (length: number = 12) => generateCustomId(
  length,
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
)

// Shorter ID for less critical resources
const generateShortId = (length: number = 8) => generateCustomId(
  length,
  '0123456789abcdefghijklmnopqrstuvwxyz'
)

/**
 * Generate a secure slug for database records
 * @param prefix Optional prefix for the slug (e.g., 'usr_', 'app_', 'evt_')
 * @returns A secure, unique slug
 */
export function generateSlug(prefix?: string): string {
  const id = generateId()
  return prefix ? `${prefix}${id}` : id
}

/**
 * Generate a shorter slug for less critical resources
 * @param prefix Optional prefix for the slug
 * @returns A secure, unique slug
 */
export function generateShortSlug(prefix?: string): string {
  const id = generateShortId()
  return prefix ? `${prefix}${id}` : id
}

/**
 * Validate if a string is a valid slug format
 * @param slug The slug to validate
 * @returns True if valid slug format
 */
export function isValidSlug(slug: string): boolean {
  // Check if it matches our slug pattern
  const slugPattern = /^([a-z]{3}_)?[0-9A-Za-z]{8,12}$/
  return slugPattern.test(slug)
}

/**
 * Extract the prefix from a slug
 * @param slug The slug to extract from
 * @returns The prefix or null
 */
export function getSlugPrefix(slug: string): string | null {
  const match = slug.match(/^([a-z]{3}_)/)
  return match ? match[1].slice(0, -1) : null
}

/**
 * Slug prefixes for different entity types
 * Using 3-letter prefixes for consistency and readability
 */
export const SlugPrefix = {
  USER: 'usr_',
  APPLICATION: 'app_',
  EVENT: 'evt_',
  MEDIA: 'med_',
  PAYMENT: 'pay_',
  SESSION: 'ses_',
  CAMPAIGN: 'cam_',
  GROUP: 'grp_',
  MESSAGE: 'msg_',
  RESOURCE: 'res_',
  FORM: 'frm_',
  STORY: 'sto_',
  JOB: 'job_',
  ACHIEVEMENT: 'ach_',
  TEAM: 'tem_',
  MODULE: 'mod_',
} as const

/**
 * Generate slugs for specific entity types
 */
export const generateUserSlug = () => generateSlug(SlugPrefix.USER)
export const generateApplicationSlug = () => generateSlug(SlugPrefix.APPLICATION)
export const generateEventSlug = () => generateSlug(SlugPrefix.EVENT)
export const generateMediaSlug = () => generateSlug(SlugPrefix.MEDIA)
export const generatePaymentSlug = () => generateSlug(SlugPrefix.PAYMENT)
export const generateSessionSlug = () => generateSlug(SlugPrefix.SESSION)
export const generateCampaignSlug = () => generateSlug(SlugPrefix.CAMPAIGN)
export const generateGroupSlug = () => generateSlug(SlugPrefix.GROUP)
export const generateMessageSlug = () => generateSlug(SlugPrefix.MESSAGE)
export const generateResourceSlug = () => generateSlug(SlugPrefix.RESOURCE)
export const generateFormSlug = () => generateSlug(SlugPrefix.FORM)
export const generateStorySlug = () => generateSlug(SlugPrefix.STORY)
export const generateJobSlug = () => generateSlug(SlugPrefix.JOB)
export const generateAchievementSlug = () => generateSlug(SlugPrefix.ACHIEVEMENT)
export const generateTeamSlug = () => generateSlug(SlugPrefix.TEAM)
export const generateModuleSlug = () => generateSlug(SlugPrefix.MODULE)