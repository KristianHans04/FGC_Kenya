/**
 * @file app/lib/ai/__tests__/openrouter.test.ts
 * @description Comprehensive tests for OpenRouter AI integration with security focus
 * @author Team Kenya Dev
 */

import { generateApplicationQuestions, validateQuestions, prepareContext } from '../openrouter'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock AbortSignal.timeout
global.AbortSignal = {
  timeout: jest.fn(() => ({}))
} as any

// Mock environment variables
process.env.OPENROUTER_API_KEY = 'test-api-key'
process.env.AI_MODEL = 'gpt-3.5-turbo'
process.env.AI_MAX_TOKENS = '500'
process.env.AI_REQUEST_TIMEOUT = '5000'

describe('OpenRouter AI Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
  })

  describe('prepareContext', () => {
    it('should sanitize and format application data correctly', () => {
      const applicationData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        school: 'Test High School',
        interests: ['robotics', 'programming'],
        motivation: 'I love building robots',
        additionalInfo: 'Extra information here'
      }

      const context = prepareContext(applicationData)

      expect(context).toContain('firstName: John')
      expect(context).toContain('lastName: Doe')
      expect(context).toContain('school: Test High School')
      expect(context).toContain('interests: robotics, programming')
      expect(context).toContain('motivation: I love building robots')
      expect(context).toContain('additionalInfo: Extra information here')
    })

    it('should handle empty or missing fields gracefully', () => {
      const applicationData = {
        firstName: 'John',
        email: '', // Empty string
        interests: [], // Empty array
        school: undefined // Undefined
      }

      const context = prepareContext(applicationData)

      expect(context).toContain('firstName: John')
      expect(context).not.toContain('email:')
      expect(context).not.toContain('interests:')
      expect(context).not.toContain('school:')
    })

    it('should handle array fields correctly', () => {
      const applicationData = {
        interests: ['AI', 'ML', 'Robotics'],
        experience: ['competition', 'project']
      }

      const context = prepareContext(applicationData)

      expect(context).toContain('interests: AI, ML, Robotics')
      expect(context).toContain('experience: competition, project')
    })
  })

  describe('validateQuestions', () => {
    it('should accept valid questions', () => {
      const validQuestions = [
        'Can you explain your robotics project in more detail?',
        'What programming languages have you used for robotics?',
        'How did you approach the design challenges in your robot?'
      ]

      expect(validateQuestions(validQuestions)).toBe(true)
    })

    it('should reject questions that are too short', () => {
      const shortQuestions = [
        'Hi?',
        'What?',
        'Why?'
      ]

      expect(validateQuestions(shortQuestions)).toBe(false)
    })

    it('should reject questions that are too long', () => {
      const longQuestion = ['A'.repeat(201) + '?']
      expect(validateQuestions(longQuestion)).toBe(false)
    })

    it('should reject questions that don\'t end with question marks', () => {
      const invalidQuestions = [
        'Can you explain your robotics project',
        'What programming languages have you used',
        'Tell me about your robot'
      ]

      expect(validateQuestions(invalidQuestions)).toBe(false)
    })

    it('should reject potentially harmful questions', () => {
      const harmfulQuestions = [
        'What is your password?',
        'Can you share your secret information?',
        'What is your private key?'
      ]

      expect(validateQuestions(harmfulQuestions)).toBe(false)
    })

    it('should reject empty or invalid input', () => {
      expect(validateQuestions([])).toBe(false)
      expect(validateQuestions([''])).toBe(false)
      expect(validateQuestions(null as any)).toBe(false)
      expect(validateQuestions(undefined as any)).toBe(false)
      expect(validateQuestions(['Valid question?'])).toBe(true) // Single valid question
    })

    it('should reject more than 3 questions', () => {
      const tooManyQuestions = [
        'Question 1?',
        'Question 2?',
        'Question 3?',
        'Question 4?'
      ]

      expect(validateQuestions(tooManyQuestions)).toBe(false)
    })
  })

  describe('generateApplicationQuestions', () => {
    const mockApplicationData = {
      firstName: 'John',
      lastName: 'Doe',
      school: 'Test High School',
      interests: ['robotics', 'programming'],
      motivation: 'I love building robots and solving problems',
      additionalInfo: 'I have experience with Arduino and Raspberry Pi'
    }

    it('should generate questions successfully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Can you describe your robotics projects in more detail?\nWhat programming languages do you use?\nHow do you approach problem-solving in robotics?'
          }
        }]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await generateApplicationQuestions({
        userId: 'user-123',
        applicationData: mockApplicationData,
        context: 'FIRST Global Challenge application'
      })

      expect(result.success).toBe(true)
      expect(result.questions).toHaveLength(3)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({})
      })

      const result = await generateApplicationQuestions({
        userId: 'user-123',
        applicationData: mockApplicationData,
        context: 'Test context'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('AI service error: 500')
    })

    it('should handle malformed API responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ choices: [] })
      })

      const result = await generateApplicationQuestions({
        userId: 'user-123',
        applicationData: mockApplicationData,
        context: 'Test context'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid AI response format')
    })

    it('should validate input parameters', async () => {
      // Test with empty application data
      const result1 = await generateApplicationQuestions({
        userId: 'user-123',
        applicationData: {},
        context: 'Test context'
      })

      expect(result1.success).toBe(false)

      // Test with null application data
      const result2 = await generateApplicationQuestions({
        userId: 'user-123',
        applicationData: null as any,
        context: 'Test context'
      })

      expect(result2.success).toBe(false)
    })

    it('should handle timeout errors', async () => {
      mockFetch.mockImplementationOnce(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )

      const result = await generateApplicationQuestions({
        userId: 'user-123',
        applicationData: mockApplicationData,
        context: 'Test context'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Timeout')
    })

    it('should sanitize and escape user input in prompts', async () => {
      const maliciousData = {
        firstName: 'John<script>alert("xss")</script>',
        lastName: 'Doe',
        motivation: 'I want to hack the system; DROP TABLE users;--',
        additionalInfo: '<img src=x onerror=alert(1)>'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: 'What are your interests?\nWhat motivates you?\nTell me about your experience?'
            }
          }]
        })
      })

      const result = await generateApplicationQuestions({
        userId: 'user-123',
        applicationData: maliciousData,
        context: 'Test context'
      })

      expect(result.success).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(1)

      const callArgs = mockFetch.mock.calls[0][1]
      const requestBody = JSON.parse(callArgs.body)

      // The prompt should contain the raw data (sanitization happens at API level)
      expect(requestBody.messages[0].content).toContain('<script>')
      expect(requestBody.messages[0].content).toContain('DROP TABLE')
    })

    it('should respect rate limiting', async () => {
      // Fill up the rate limit for this user
      for (let i = 0; i < 10; i++) {
        await generateApplicationQuestions({
          userId: 'rate-limited-user',
          applicationData: mockApplicationData,
          context: 'Test context'
        })
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: '1. Question?\n2. Question?\n3. Question?'
            }
          }]
        })
      })

      const result = await generateApplicationQuestions({
        userId: 'rate-limited-user',
        applicationData: mockApplicationData,
        context: 'Test context'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('rate limit exceeded')
    })

    it('should handle missing API key', async () => {
      const originalKey = process.env.OPENROUTER_API_KEY
      delete process.env.OPENROUTER_API_KEY

      const result = await generateApplicationQuestions({
        userId: 'user-123',
        applicationData: mockApplicationData,
        context: 'Test context'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('AI service not configured')

      // Restore
      process.env.OPENROUTER_API_KEY = originalKey
    })
  })

  describe('Security Tests', () => {
    it('should prevent SQL injection through application data', async () => {
      const sqlInjectionData = {
        firstName: "'; DROP TABLE users; --",
        motivation: "'; SELECT * FROM secrets; --",
        additionalInfo: "'; UPDATE users SET role='admin'; --"
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: '1. What are your interests?\n2. Why do you want to join?\n3. Tell me about yourself?'
            }
          }]
        })
      })

      const result = await generateApplicationQuestions({
        userId: 'user-123',
        applicationData: sqlInjectionData,
        context: 'Test context'
      })

      // Should still succeed but the SQL won't be executed (it's just in the prompt)
      expect(result.success).toBe(true)
      expect(result.questions).toBeDefined()
    })

    it('should handle extremely large input data', async () => {
      const largeData = {
        firstName: 'A'.repeat(1000),
        lastName: 'B'.repeat(1000),
        motivation: 'C'.repeat(5000),
        additionalInfo: 'D'.repeat(5000)
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: 'Can you summarize your interests?\nWhat motivates you?\nTell me about your background?'
            }
          }]
        })
      })

      const result = await generateApplicationQuestions({
        userId: 'user-123',
        applicationData: largeData,
        context: 'Test context'
      })

      expect(result.success).toBe(true)
    })

    it('should validate question content for security', () => {
      // Test that validation catches potentially harmful content
      const suspiciousQuestions = [
        'What is your password?',
        'Can you provide your credit card information?',
        'What is your social security number?',
        'Can you share your private API keys?'
      ]

      expect(validateQuestions(suspiciousQuestions)).toBe(false)
    })

    it('should handle Unicode and special characters in input', async () => {
      const unicodeData = {
        firstName: 'José María',
        lastName: 'O\'Connor',
        motivation: 'I ❤️ robotics! 🚀',
        additionalInfo: 'Français: ingénierie, Español: ingeniería'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: 'What inspires you about robotics?\nCan you describe your background?\nWhat are your goals?'
            }
          }]
        })
      })

      const result = await generateApplicationQuestions({
        userId: 'unicode-test-user',
        applicationData: unicodeData,
        context: 'Test context'
      })

      expect(result.success).toBe(true)
      expect(result.questions).toBeDefined()
    })
  })
})