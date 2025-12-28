import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock crypto for OTP generation
const mockCreateHash = jest.fn(() => ({
  update: jest.fn(() => ({
    digest: jest.fn(() => '48657734a5380fd33ab031118e93d4b2b7b8447ae8428c40ac0c01177b294ece'),
  })),
}))

Object.defineProperty(global, 'crypto', {
  value: {
    randomBytes: jest.fn((size) => Buffer.alloc(size, 'mock-random-bytes')),
    createHash: mockCreateHash,
    timingSafeEqual: jest.fn((a, b) => {
      // Simple mock that checks if buffers are equal in length and content
      if (a.length !== b.length) return false
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false
      }
      return true
    }),
  },
})

// Mock Request for tests
global.Request = class MockRequest {
  constructor(input, init = {}) {
    this.url = input
    this.method = init.method || 'GET'
    this.headers = new Map(Object.entries(init.headers || {}))
    this.body = init.body
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }

  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
  }
}

// Mock NextRequest directly
global.NextRequest = class MockNextRequest {
  constructor(input, init = {}) {
    this.url = input
    this.method = init.method || 'GET'
    this.headers = new Map(Object.entries(init.headers || {}))
    this.body = init.body
    this.nextUrl = new URL(input)
    this.cookies = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    }
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }

  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
  }
}

// Mock Response for Next.js API routes
global.Response = class MockResponse {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.statusText = init.statusText || 'OK'
    this.headers = new Map(Object.entries(init.headers || {}))
    this.ok = this.status >= 200 && this.status < 300
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }

  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
  }

  get [Symbol.toStringTag]() {
    return 'Response'
  }
}

// Mock environment variables
process.env = {
  ...process.env,
  JWT_SECRET: 'test-jwt-secret',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  EMAIL_HOST: 'localhost',
  EMAIL_PORT: '1025',
  EMAIL_USER: '',
  EMAIL_PASS: '',
}