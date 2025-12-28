/**
 * @file lib/auth/otp.test.ts
 * @description Unit tests for OTP utilities
 */

import { generateOTPCode, hashOTP, verifyOTPHash, calculateOTPExpiry, OTP_CONFIG } from '@/app/lib/auth/otp'

describe('OTP Utilities', () => {
  describe('generateOTPCode', () => {
    it('should generate a 6-digit string', () => {
      const code = generateOTPCode()
      expect(code).toMatch(/^\d{6}$/)
      expect(code.length).toBe(OTP_CONFIG.LENGTH)
    })
  })

  describe('hashOTP', () => {
    it('should return a string hash', () => {
      const code = '123456'
      const hash = hashOTP(code)
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should produce consistent hashes for the same input', () => {
      const code = '123456'
      const hash1 = hashOTP(code)
      const hash2 = hashOTP(code)
      expect(hash1).toBe(hash2)
    })

    it('should produce different hashes for different codes', () => {
      const hash1 = hashOTP('123456')
      const hash2 = hashOTP('654321')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyOTPHash', () => {
    it('should verify correct OTP hash', () => {
      const code = '123456'
      const hash = hashOTP(code)
      const isValid = verifyOTPHash(code, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect OTP code', () => {
      const code = '123456'
      const wrongCode = '654321'
      const hash = hashOTP(code)
      const isValid = verifyOTPHash(wrongCode, hash)
      expect(isValid).toBe(false)
    })

    it('should reject invalid hash', () => {
      const code = '123456'
      const invalidHash = 'invalid-hash'
      const isValid = verifyOTPHash(code, invalidHash)
      expect(isValid).toBe(false)
    })
  })

  describe('calculateOTPExpiry', () => {
    it('should return a date in the future', () => {
      const expiry = calculateOTPExpiry()
      const now = new Date()
      expect(expiry.getTime()).toBeGreaterThan(now.getTime())
    })

    it('should return a Date object', () => {
      const expiry = calculateOTPExpiry()
      expect(expiry).toBeInstanceOf(Date)
    })

    it('should be approximately 10 minutes from now', () => {
      const expiry = calculateOTPExpiry()
      const now = new Date()
      const diffMs = expiry.getTime() - now.getTime()
      const diffMinutes = diffMs / (1000 * 60)

      // Should be very close to 10 minutes (allowing for test execution time)
      expect(diffMinutes).toBeGreaterThan(9.5)
      expect(diffMinutes).toBeLessThan(10.5)
    })
  })

  describe('OTP_CONFIG', () => {
    it('should have correct configuration values', () => {
      expect(OTP_CONFIG.LENGTH).toBe(6)
      expect(OTP_CONFIG.EXPIRY_MINUTES).toBe(10)
      expect(OTP_CONFIG.MAX_ATTEMPTS).toBe(5)
      expect(OTP_CONFIG.COOLDOWN_SECONDS).toBe(60)
      expect(OTP_CONFIG.MAX_OTPS_PER_HOUR).toBe(5)
    })
  })
})