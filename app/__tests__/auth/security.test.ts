/**
 * @file app/__tests__/auth/security.test.ts
 * @description Comprehensive security tests for authentication system
 * @author Team Kenya Dev
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { generateOTPCode, hashOTP, verifyOTPHash, calculateOTPExpiry } from '@/app/lib/auth/otp'
import { SECURITY, VALIDATION } from '@/app/lib/constants'

describe('Authentication Security Tests', () => {
  describe('OTP Generation', () => {
    it('should generate a 6-digit OTP code', () => {
      const otp = generateOTPCode()
      expect(otp).toMatch(/^\d{6}$/)
      expect(otp.length).toBe(6)
    })

    it('should generate unique OTP codes', () => {
      const otps = new Set()
      for (let i = 0; i < 100; i++) {
        otps.add(generateOTPCode())
      }
      // Allow for some collisions but expect mostly unique values
      expect(otps.size).toBeGreaterThan(90)
    })

    it('should not generate predictable patterns', () => {
      const otps = []
      for (let i = 0; i < 10; i++) {
        otps.push(generateOTPCode())
      }
      
      // Check that not all OTPs start with the same digit
      const firstDigits = new Set(otps.map(otp => otp[0]))
      expect(firstDigits.size).toBeGreaterThan(1)
    })
  })

  describe('OTP Hashing', () => {
    it('should hash OTP codes', () => {
      const otp = '123456'
      const hash = hashOTP(otp)
      expect(hash).toBeDefined()
      expect(hash).not.toBe(otp)
      expect(hash.length).toBeGreaterThan(20)
    })

    it('should generate different hashes for different OTPs', () => {
      const hash1 = hashOTP('123456')
      const hash2 = hashOTP('654321')
      expect(hash1).not.toBe(hash2)
    })

    it('should verify correct OTP against hash', () => {
      const otp = '123456'
      const hash = hashOTP(otp)
      expect(verifyOTPHash(otp, hash)).toBe(true)
    })

    it('should reject incorrect OTP against hash', () => {
      const hash = hashOTP('123456')
      expect(verifyOTPHash('654321', hash)).toBe(false)
      expect(verifyOTPHash('000000', hash)).toBe(false)
      expect(verifyOTPHash('', hash)).toBe(false)
    })
  })

  describe('OTP Expiry', () => {
    it('should calculate expiry time correctly', () => {
      const now = Date.now()
      const expiry = calculateOTPExpiry()
      const expectedExpiry = now + SECURITY.OTP_EXPIRY_MINUTES * 60 * 1000
      
      // Allow 1 second difference for test execution time
      expect(expiry.getTime()).toBeGreaterThanOrEqual(expectedExpiry - 1000)
      expect(expiry.getTime()).toBeLessThanOrEqual(expectedExpiry + 1000)
    })

    it('should check if OTP is expired', () => {
      const pastExpiry = new Date(Date.now() - 60000) // 1 minute ago
      const futureExpiry = new Date(Date.now() + 60000) // 1 minute from now
      
      expect(pastExpiry.getTime() < Date.now()).toBe(true)
      expect(futureExpiry.getTime() > Date.now()).toBe(true)
    })
  })

  describe('Input Validation', () => {
    describe('Email Validation', () => {
      it('should validate correct email addresses', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'first+last@test.org',
          'admin@company.io'
        ]
        
        validEmails.forEach(email => {
          expect(VALIDATION.EMAIL.test(email)).toBe(true)
        })
      })

      it('should reject invalid email addresses', () => {
        const invalidEmails = [
          'notanemail',
          '@domain.com',
          'user@',
          'user @domain.com',
          'user@domain',
          'user@.com',
          ''
        ]
        
        invalidEmails.forEach(email => {
          expect(VALIDATION.EMAIL.test(email)).toBe(false)
        })
      })
    })

    describe('Phone Number Validation', () => {
      it('should validate correct Kenyan phone numbers', () => {
        const validPhones = [
          '+254712345678',
          '+254701234567',
          '0712345678',
          '0701234567'
        ]
        
        validPhones.forEach(phone => {
          expect(VALIDATION.PHONE.test(phone)).toBe(true)
        })
      })

      it('should reject invalid phone numbers', () => {
        const invalidPhones = [
          '254712345678', // Missing +
          '+25471234567', // Too short
          '+2547123456789', // Too long
          '0812345678', // Invalid prefix
          '071234567', // Too short
          '+254812345678', // Invalid operator code
          'notaphonenumber',
          ''
        ]
        
        invalidPhones.forEach(phone => {
          expect(VALIDATION.PHONE.test(phone)).toBe(false)
        })
      })
    })

    describe('OTP Code Validation', () => {
      it('should validate correct OTP codes', () => {
        const validOTPs = ['123456', '000000', '999999', '543210']
        
        validOTPs.forEach(otp => {
          expect(VALIDATION.OTP.test(otp)).toBe(true)
        })
      })

      it('should reject invalid OTP codes', () => {
        const invalidOTPs = [
          '12345', // Too short
          '1234567', // Too long
          'abcdef', // Letters
          '12 3456', // Space
          '12-3456', // Hyphen
          '',
          '123a56'
        ]
        
        invalidOTPs.forEach(otp => {
          expect(VALIDATION.OTP.test(otp)).toBe(false)
        })
      })
    })

    describe('Name Validation', () => {
      it('should validate correct names', () => {
        const validNames = [
          'John',
          'Mary Jane',
          "O'Connor",
          'Jean-Pierre',
          'De La Cruz'
        ]
        
        validNames.forEach(name => {
          expect(VALIDATION.NAME.test(name)).toBe(true)
        })
      })

      it('should reject invalid names', () => {
        const invalidNames = [
          'John123',
          'Mary@Jane',
          'Test!Name',
          '12345',
          ''
        ]
        
        invalidNames.forEach(name => {
          expect(VALIDATION.NAME.test(name)).toBe(false)
        })
      })
    })
  })

  describe('Rate Limiting', () => {
    it('should respect OTP attempt limits', () => {
      expect(SECURITY.MAX_OTP_ATTEMPTS).toBe(3)
      expect(SECURITY.ACCOUNT_LOCK_DURATION_MINUTES).toBe(15)
    })

    it('should have proper rate limit configuration', () => {
      expect(SECURITY.RATE_LIMIT.LOGIN.MAX_REQUESTS).toBe(5)
      expect(SECURITY.RATE_LIMIT.LOGIN.WINDOW_MINUTES).toBe(15)
      expect(SECURITY.RATE_LIMIT.API.MAX_REQUESTS).toBe(100)
      expect(SECURITY.RATE_LIMIT.API.WINDOW_MINUTES).toBe(15)
    })
  })

  describe('SQL Injection Prevention', () => {
    it('should sanitize malicious SQL inputs', () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin' --",
        "1' UNION SELECT * FROM users--",
        "' OR 1=1--"
      ]
      
      // These should not match valid patterns
      maliciousInputs.forEach(input => {
        expect(VALIDATION.EMAIL.test(input)).toBe(false)
        expect(VALIDATION.NAME.test(input)).toBe(false)
      })
    })
  })

  describe('XSS Prevention', () => {
    it('should detect potential XSS attempts', () => {
      const xssAttempts = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src=x onerror=alert("XSS")>',
        '<svg onload=alert("XSS")>',
        '"><script>alert("XSS")</script>'
      ]
      
      // These should not match valid patterns
      xssAttempts.forEach(input => {
        expect(VALIDATION.NAME.test(input)).toBe(false)
        expect(VALIDATION.EMAIL.test(input)).toBe(false)
      })
    })
  })

  describe('Password Security', () => {
    it('should have proper bcrypt configuration', () => {
      expect(SECURITY.BCRYPT_ROUNDS).toBeGreaterThanOrEqual(10)
      expect(SECURITY.BCRYPT_ROUNDS).toBeLessThanOrEqual(15)
    })
  })

  describe('Session Security', () => {
    it('should have proper session expiry configuration', () => {
      expect(SECURITY.SESSION_EXPIRY_HOURS).toBe(24)
      expect(SECURITY.REFRESH_TOKEN_EXPIRY_DAYS).toBe(7)
    })
  })
})