/**
 * @file app/lib/utils/date.ts
 * @description Date formatting utilities for consistent rendering
 * @author Team Kenya Dev
 */

/**
 * Format a date string or Date object consistently across server and client
 * Uses ISO format to avoid locale differences
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return ''
    }
    
    // Use ISO format and extract the date part for consistency
    // This avoids locale-specific formatting that can differ between server and client
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Date formatting error:', error)
    return ''
  }
}

/**
 * Format a date with a more readable format
 * @param date - Date to format
 * @param options - Formatting options
 */
export function formatDateLong(
  date: string | Date | null | undefined,
  options: {
    includeTime?: boolean
    includeYear?: boolean
  } = {}
): string {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return ''
    }
    
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    
    const month = months[dateObj.getMonth()]
    const day = dateObj.getDate()
    const year = dateObj.getFullYear()
    
    let result = `${month} ${day}`
    
    if (options.includeYear !== false) {
      result += `, ${year}`
    }
    
    if (options.includeTime) {
      const hours = String(dateObj.getHours()).padStart(2, '0')
      const minutes = String(dateObj.getMinutes()).padStart(2, '0')
      result += ` at ${hours}:${minutes}`
    }
    
    return result
  } catch (error) {
    console.error('Date formatting error:', error)
    return ''
  }
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return ''
    }
    
    const now = new Date()
    const diff = now.getTime() - dateObj.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 7) {
      return formatDateLong(dateObj, { includeYear: days > 365 })
    } else if (days > 0) {
      return `${days} day${days === 1 ? '' : 's'} ago`
    } else if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`
    } else if (minutes > 0) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
    } else {
      return 'Just now'
    }
  } catch (error) {
    console.error('Relative time error:', error)
    return ''
  }
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: string | Date | null | undefined): boolean {
  if (!date) return false
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.getTime() < Date.now()
  } catch (error) {
    return false
  }
}

/**
 * Check if a date is today
 */
export function isToday(date: string | Date | null | undefined): boolean {
  if (!date) return false
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const today = new Date()
    
    return (
      dateObj.getFullYear() === today.getFullYear() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getDate() === today.getDate()
    )
  } catch (error) {
    return false
  }
}