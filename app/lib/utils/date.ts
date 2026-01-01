/**
 * Date formatting and manipulation utilities
 * Replaces date-fns with native Date API implementations
 */

/**
 * Format a date to a readable string
 * @param date - Date to format
 * @param format - Format type ('short' | 'long' | 'full' | 'PPp' | 'PPpp')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  format: 'short' | 'long' | 'full' | 'PPp' | 'PPpp' = 'long'
): string {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date'
  }
  
  // Handle date-fns format codes
  if (format === 'PPp') {
    // PPp: Apr 29, 2023, 12:45 PM
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ', ' + d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }
  
  if (format === 'PPpp') {
    // PPpp: Apr 29, 2023 at 12:45:30 PM
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }
  
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  }[format] as Intl.DateTimeFormatOptions
  
  return d.toLocaleDateString('en-US', options)
}

/**
 * Format a date to ISO string (YYYY-MM-DD)
 * @param date - Date to format
 * @returns ISO date string
 */
export function formatDateISO(date: Date | string | number): string {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

/**
 * Format a date to a relative time string (e.g., "2 hours ago")
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  
  if (seconds < 60) return 'just now'
  if (minutes === 1) return '1 minute ago'
  if (minutes < 60) return `${minutes} minutes ago`
  if (hours === 1) return '1 hour ago'
  if (hours < 24) return `${hours} hours ago`
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  if (weeks === 1) return '1 week ago'
  if (weeks < 4) return `${weeks} weeks ago`
  if (months === 1) return '1 month ago'
  if (months < 12) return `${months} months ago`
  if (years === 1) return '1 year ago'
  return `${years} years ago`
}

/**
 * Add days to a date
 * @param date - Starting date
 * @param days - Number of days to add
 * @returns New date
 */
export function addDays(date: Date | string | number, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/**
 * Add minutes to a date
 * @param date - Starting date
 * @param minutes - Number of minutes to add
 * @returns New date
 */
export function addMinutes(date: Date | string | number, minutes: number): Date {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() + minutes)
  return d
}

/**
 * Check if a date is before another date
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if date1 is before date2
 */
export function isBefore(
  date1: Date | string | number,
  date2: Date | string | number
): boolean {
  return new Date(date1).getTime() < new Date(date2).getTime()
}

/**
 * Check if a date is after another date
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if date1 is after date2
 */
export function isAfter(
  date1: Date | string | number,
  date2: Date | string | number
): boolean {
  return new Date(date1).getTime() > new Date(date2).getTime()
}

/**
 * Get the difference between two dates in milliseconds
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in milliseconds
 */
export function differenceInMilliseconds(
  date1: Date | string | number,
  date2: Date | string | number
): number {
  return Math.abs(new Date(date1).getTime() - new Date(date2).getTime())
}

/**
 * Get the difference between two dates in seconds
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in seconds
 */
export function differenceInSeconds(
  date1: Date | string | number,
  date2: Date | string | number
): number {
  return Math.floor(differenceInMilliseconds(date1, date2) / 1000)
}

/**
 * Get the difference between two dates in minutes
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in minutes
 */
export function differenceInMinutes(
  date1: Date | string | number,
  date2: Date | string | number
): number {
  return Math.floor(differenceInMilliseconds(date1, date2) / (1000 * 60))
}

/**
 * Get the difference between two dates in hours
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in hours
 */
export function differenceInHours(
  date1: Date | string | number,
  date2: Date | string | number
): number {
  return Math.floor(differenceInMilliseconds(date1, date2) / (1000 * 60 * 60))
}

/**
 * Get the difference between two dates in days
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in days
 */
export function differenceInDays(
  date1: Date | string | number,
  date2: Date | string | number
): number {
  return Math.floor(differenceInMilliseconds(date1, date2) / (1000 * 60 * 60 * 24))
}

/**
 * Check if a date is valid
 * @param date - Date to check
 * @returns True if valid date
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Parse a date string safely
 * @param dateString - Date string to parse
 * @returns Parsed date or null if invalid
 */
export function parseDate(dateString: string): Date | null {
  const date = new Date(dateString)
  return isValidDate(date) ? date : null
}