/**
 * Secure ID generation utilities using Web Crypto API
 * Replaces nanoid with native crypto implementation
 */

/**
 * Generate a cryptographically secure random ID
 * @param length - Length of the ID (default: 21)
 * @param alphabet - Custom alphabet for ID generation
 * @returns Random ID string
 */
export function generateId(
  length: number = 21,
  alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
): string {
  const randomValues = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(randomValues)
    .map(value => alphabet[value % alphabet.length])
    .join('')
}

/**
 * Generate a URL-safe random ID
 * @param length - Length of the ID (default: 21)
 * @returns URL-safe random ID
 */
export function generateUrlSafeId(length: number = 21): string {
  return generateId(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_')
}

/**
 * Generate a numeric-only ID
 * @param length - Length of the ID (default: 6)
 * @returns Numeric ID string
 */
export function generateNumericId(length: number = 6): string {
  return generateId(length, '0123456789')
}

/**
 * Generate a hex ID
 * @param length - Length of the ID (default: 32)
 * @returns Hexadecimal ID string
 */
export function generateHexId(length: number = 32): string {
  return generateId(length, '0123456789abcdef')
}

/**
 * Generate a UUID v4 compatible ID
 * @returns UUID v4 string
 */
export function generateUUID(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  
  // Fallback for older environments
  const hex = generateHexId(32)
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    '4' + hex.slice(13, 16),
    ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16) + hex.slice(17, 20),
    hex.slice(20, 32)
  ].join('-')
}