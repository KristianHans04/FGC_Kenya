/**
 * @file __tests__/auth-flow.test.ts
 * @description Integration tests for authentication flow
 */

import { NextRequest } from 'next/server'
import { POST as requestOTP } from '@/app/api/auth/request-otp/route'
import { POST as verifyOTP } from '@/app/api/auth/verify-otp/route'

// Mock Prisma
jest.mock('@/app/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    oTPCode: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    session: {
      create: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}))

const mockPrisma = require('@/app/lib/db').prisma

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock crypto functions using the existing setup
    ;(global as any).crypto.randomBytes.mockReturnValue(Buffer.from('1234567890123456'))
    ;(global as any).crypto.createHash.mockReturnValue({
      update: jest.fn(() => ({
        digest: jest.fn(() => 'mock-hash'),
      })),
    })
    ;(global as any).crypto.timingSafeEqual.mockReturnValue(true)
  })

  describe('Request OTP', () => {
    it('should create OTP for new user', async () => {
      // Mock user not found, then created
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        isActive: true,
        emailVerified: false,
      })
      mockPrisma.oTPCode.count.mockResolvedValue(0)
      mockPrisma.oTPCode.updateMany.mockResolvedValue({ count: 0 })
      mockPrisma.oTPCode.create.mockResolvedValue({})
      mockPrisma.auditLog.create.mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '127.0.0.1',
          'user-agent': 'test-agent',
        },
      })

      const response = await requestOTP(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('OTP sent')
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { email: 'test@example.com' },
        select: expect.any(Object),
      })
    })

    it('should handle existing user', async () => {
      // Mock existing user
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'existing@example.com',
        isActive: true,
        emailVerified: true,
      })
      mockPrisma.oTPCode.count.mockResolvedValue(0)
      mockPrisma.oTPCode.updateMany.mockResolvedValue({ count: 0 })
      mockPrisma.oTPCode.create.mockResolvedValue({})
      mockPrisma.auditLog.create.mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ email: 'existing@example.com' }),
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await requestOTP(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })

    it('should validate email format', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ email: 'invalid-email' }),
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await requestOTP(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('Verify OTP', () => {
    it('should verify correct OTP and create session', async () => {
      // Mock user and OTP verification
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        isActive: true,
        emailVerified: false,
        role: 'USER',
      })
      mockPrisma.oTPCode.findFirst.mockResolvedValue({
        id: 'otp-id',
        code: 'hashed-123456',
        expiresAt: new Date(Date.now() + 600000), // 10 minutes from now
        used: false,
        attempts: 0,
        userId: 'user-id',
      })
      mockPrisma.oTPCode.update.mockResolvedValue({})
      mockPrisma.session.create.mockResolvedValue({
        id: 'session-id',
        expiresAt: new Date(),
      })
      mockPrisma.session.update.mockResolvedValue({})
      mockPrisma.user.update.mockResolvedValue({})
      mockPrisma.auditLog.create.mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', code: '123456' }),
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await verifyOTP(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.user.email).toBe('test@example.com')
      expect(data.data.token).toBeDefined()
      expect(data.data.refreshToken).toBeDefined()
    })

    it('should reject invalid OTP', async () => {
      // Mock user exists but OTP verification fails
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        isActive: true,
        emailVerified: false,
      })
      mockPrisma.oTPCode.findFirst.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', code: '123456' }),
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await verifyOTP(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INVALID_OTP')
    })
  })
})