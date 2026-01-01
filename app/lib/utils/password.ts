/**
 * Secure password hashing using native Node.js crypto
 * Replaces bcryptjs with crypto.scrypt
 */

import { randomBytes, scrypt, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

// Security constants matching bcryptjs defaults
const SALT_LENGTH = 16
const KEY_LENGTH = 32
const SCRYPT_COST = 16384 // N parameter (CPU/memory cost)
const SCRYPT_BLOCK_SIZE = 8 // r parameter (block size)
const SCRYPT_PARALLELIZATION = 1 // p parameter (parallelization)

/**
 * Hash a password using scrypt
 * @param password - Plain text password
 * @returns Hashed password with salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH)
  
  // Note: Node.js scrypt doesn't accept N, r, p parameters directly
  // Using default parameters which are secure for most use cases
  const derivedKey = await scryptAsync(
    password,
    salt,
    KEY_LENGTH
  ) as Buffer
  
  // Format: algorithm$salt$hash (simplified format)
  return `scrypt$${salt.toString('hex')}$${derivedKey.toString('hex')}`
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hash - Hashed password to compare
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // Handle legacy bcrypt hashes (if any exist)
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
      // For migration period - should be replaced with re-hashing logic
      console.warn('Legacy bcrypt hash detected. Consider re-hashing.')
      return false
    }
    
    const parts = hash.split('$')
    
    // Updated format: algorithm$salt$hash (3 parts now)
    if (parts[0] !== 'scrypt' || parts.length !== 3) {
      return false
    }
    
    const [algorithm, saltHex, hashHex] = parts
    const salt = Buffer.from(saltHex, 'hex')
    const storedHash = Buffer.from(hashHex, 'hex')
    
    const derivedKey = await scryptAsync(
      password,
      salt,
      KEY_LENGTH
    ) as Buffer
    
    // Use timing-safe comparison to prevent timing attacks
    return timingSafeEqual(derivedKey, storedHash)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

/**
 * Check if a hash needs to be upgraded (e.g., from bcrypt or older scrypt params)
 * @param hash - Hashed password
 * @returns True if hash should be upgraded
 */
export function needsRehash(hash: string): boolean {
  // Check for bcrypt hashes
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    return true
  }
  
  // Check for old scrypt parameters
  const parts = hash.split('$')
  if (parts[0] === 'scrypt' && parts.length === 6) {
    const cost = parseInt(parts[1])
    return cost < SCRYPT_COST
  }
  
  return true
}

/**
 * Generate a secure random token
 * @param length - Token length in bytes (default: 32)
 * @returns Hex-encoded token
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex')
}

/**
 * Generate a secure random password
 * @param length - Password length (default: 16)
 * @param options - Character set options
 * @returns Random password
 */
export function generateSecurePassword(
  length: number = 16,
  options: {
    uppercase?: boolean
    lowercase?: boolean
    numbers?: boolean
    symbols?: boolean
  } = {
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  }
): string {
  let charset = ''
  
  if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
  if (options.numbers) charset += '0123456789'
  if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  if (!charset) charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  
  const randomValues = randomBytes(length)
  return Array.from(randomValues)
    .map(byte => charset[byte % charset.length])
    .join('')
}