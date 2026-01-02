# Lib Directory

This directory contains utility libraries, configurations, and shared code for the FIRST Global Team Kenya application.

## Structure

```
lib/
├── auth/               # Authentication utilities
│   ├── jwt.ts         # JWT token management
│   ├── otp.ts         # OTP generation and validation
│   └── session.ts     # Session handling
├── email/              # Email functionality
│   ├── templates/     # Email templates
│   ├── send.ts        # Email sending utilities
│   └── config.ts      # Email configuration
├── security/           # Security utilities
│   ├── csrf.ts        # CSRF protection
│   ├── rate-limit.ts  # Rate limiting
│   └── validation.ts  # Security validation
├── validations/        # Data validation schemas
│   ├── application.ts # Application form validation
│   ├── auth.ts        # Authentication validation
│   └── user.ts        # User data validation
├── middleware/         # Custom middleware
│   ├── auth.ts        # Authentication middleware
│   ├── rate-limit.ts  # Rate limiting middleware
│   └── security.ts    # Security headers middleware
├── utils/              # General utilities
│   ├── cn.ts          # Class name utility
│   ├── format.ts      # Data formatting
│   └── date.ts        # Date utilities
├── config/             # Configuration files
│   └── metadata.ts    # App metadata
└── db.ts              # Database connection
```

## Authentication (`auth/`)

### JWT Management (`jwt.ts`)
```typescript
export function signToken(payload: object): string
export function verifyToken(token: string): object
export function refreshToken(oldToken: string): string
```

### OTP Handling (`otp.ts`)
```typescript
export function generateOTP(): string
export function verifyOTP(email: string, otp: string): boolean
export function sendOTP(email: string, otp: string): Promise<void>
```

### Session Management (`session.ts`)
```typescript
export function createSession(userId: string): Session
export function validateSession(sessionId: string): boolean
export function destroySession(sessionId: string): void
```

## Email System (`email/`)

### Email Templates (`templates/`)
- OTP verification emails
- Application status notifications
- Admin alerts
- Welcome emails

### Email Sending (`send.ts`)
```typescript
export async function sendEmail(
  to: string,
  subject: string,
  template: string,
  data: object
): Promise<void>
```

### Email Configuration (`config.ts`)
- SMTP settings
- Template configurations
- Email validation

## Security (`security/`)

### CSRF Protection (`csrf.ts`)
```typescript
export function generateCSRFToken(): string
export function validateCSRFToken(token: string): boolean
```

### Rate Limiting (`rate-limit.ts`)
```typescript
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many requests'
});
```

### Validation (`validation.ts`)
- Input sanitization
- XSS prevention
- SQL injection checks

## Validation Schemas (`validations/`)

Using Zod for runtime type validation:

```typescript
// Application validation
export const applicationSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().regex(/^\\+?\\d{10,15}$/),
    // ... more fields
  }),
  education: z.object({
    schoolName: z.string().min(2),
    gradeLevel: z.enum(['10', '11', '12']),
    // ... more fields
  })
});
```

## Middleware (`middleware/`)

### Authentication Middleware (`auth.ts`)
```typescript
export function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('token');
  if (!token || !verifyToken(token)) {
    return NextResponse.redirect('/login');
  }
  return NextResponse.next();
}
```

### Rate Limiting Middleware (`rate-limit.ts`)
Applies rate limiting to API routes based on IP address and user.

### Security Headers Middleware (`security.ts`)
Adds security headers to all responses:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options

## Utilities (`utils/`)

### Class Name Utility (`cn.ts`)
```typescript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Data Formatting (`format.ts`)
```typescript
export function formatDate(date: Date): string
export function formatPhone(phone: string): string
export function formatCurrency(amount: number): string
```

### Date Utilities (`date.ts`)
```typescript
export function isFuture(date: Date): boolean
export function daysUntil(date: Date): number
export function formatRelative(date: Date): string
```

## Database (`db.ts`)

### Prisma Client Configuration
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

## Configuration (`config/`)

### App Metadata (`metadata.ts`)
```typescript
export const metadata = {
  title: 'FIRST Global Team Kenya',
  description: 'Kenya\'s national team in the FIRST Global Challenge robotics competition',
  keywords: ['robotics', 'FIRST Global', 'Kenya', 'STEM'],
  authors: [{ name: 'FIRST Global Team Kenya' }],
  openGraph: {
    title: 'FIRST Global Team Kenya',
    description: 'Join Kenya\'s robotics team',
    images: ['/og-image.jpg'],
  },
};
```

## Best Practices

### Error Handling
```typescript
try {
  const result = await someOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { success: false, error: 'Operation failed' };
}
```

### Logging
```typescript
import { logger } from '@/lib/logger';

logger.info('User authenticated', { userId, email });
logger.error('Database error', { error, query });
```

### Environment Variables
```typescript
// Use validated environment variables
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  EMAIL_HOST: z.string(),
});

export const env = envSchema.parse(process.env);
```

## Testing Utilities

Create test utilities for consistent testing:

```typescript
// Test database setup
export async function setupTestDb() {
  // Create test database
  // Run migrations
  // Seed test data
}

// Cleanup after tests
export async function teardownTestDb() {
  // Clean up test data
  // Close connections
}
```

## Adding New Utilities

1. Determine appropriate category/directory
2. Create utility file with clear naming
3. Add TypeScript types and documentation
4. Write unit tests
5. Update exports in index files
6. Document usage in relevant README