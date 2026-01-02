# Development Guide

This guide covers the development workflow, project structure, coding standards, and best practices for the FIRST Global Team Kenya website.

## Project Structure

```
fgc-kenya/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   │   ├── login/           # Login page
│   │   └── signup/          # Signup page
│   ├── (dashboard)/         # Dashboard pages
│   │   ├── (admin)/         # Admin dashboard
│   │   ├── (alumni)/        # Alumni dashboard
│   │   ├── (mentor)/        # Mentor dashboard
│   │   └── (student)/       # Student dashboard
│   ├── api/                 # API routes
│   │   ├── admin/           # Admin endpoints
│   │   ├── applications/    # Application endpoints
│   │   └── auth/            # Authentication endpoints
│   ├── components/          # Reusable components
│   │   ├── auth/            # Auth components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── forms/           # Form components
│   │   ├── ui/              # UI components
│   │   └── ...              # Other components
│   ├── lib/                 # Utilities and libraries
│   │   ├── auth/            # Auth utilities
│   │   ├── email/           # Email templates
│   │   ├── middleware/      # Middleware
│   │   ├── security/        # Security utilities
│   │   └── validations/     # Validation schemas
│   ├── types/               # TypeScript definitions
│   └── [page]/              # Public pages
├── prisma/                  # Database schema
│   ├── migrations/          # Database migrations
│   └── schema.prisma        # Prisma schema
├── public/                  # Static assets
├── docs/                    # Documentation
├── __tests__/               # Test files
├── .env.example             # Environment variables template
└── package.json             # Dependencies and scripts
```

## Development Workflow

### 1. Local Development Setup

```bash
# Clone repository
git clone [repository-url]
cd fgc-kenya

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Set up database
npx prisma generate
npx prisma db push
npm run db:seed

# Start development server
npm run dev
```

### 2. Branching Strategy

- `main`: Production-ready code
- `develop`: Integration branch
- `feature/feature-name`: New features
- `bugfix/bug-description`: Bug fixes
- `hotfix/critical-fix`: Critical production fixes

### 3. Commit Convention

```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Test additions
- chore: Maintenance tasks

Examples:
- feat(auth): add OTP verification
- fix(api): resolve rate limiting issue
- docs(readme): update installation guide
```

### 4. Pull Request Process

1. Create feature branch from `develop`
2. Implement changes with tests
3. Run linting and tests: `npm run lint && npm test`
4. Update documentation if needed
5. Create PR with description
6. Code review and approval
7. Merge to `develop`
8. Deploy to staging for testing
9. Merge to `main` for production

## Coding Standards

### TypeScript

- Strict mode enabled
- Use interfaces for object types
- Use unions for variant types
- Avoid `any` type
- Use proper generic constraints

```typescript
// Good
interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'mentor';
}

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

// Avoid
interface User {
  id: any;
  email: string;
  role: string;
}
```

### React Components

- Use functional components with hooks
- Use TypeScript for props
- Follow component composition patterns
- Use custom hooks for shared logic

```tsx
// Good
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick: () => void;
}

function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Custom hook
function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, otp: string) => {
    // login logic
  };

  return { user, login };
}
```

### API Routes

- Use Next.js API routes
- Validate inputs with Zod
- Handle errors consistently
- Use proper HTTP status codes

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = requestSchema.parse(body);

    // Process request
    const result = await verifyOTP(email, otp);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
```

### Database

- Use Prisma ORM
- Follow schema naming conventions
- Use transactions for related operations
- Implement proper indexes

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  applications Application[]

  @@map("users")
}

model Application {
  id          String            @id @default(cuid())
  userId      String
  status      ApplicationStatus @default(DRAFT)
  personalInfo Json
  education   Json
  experience  Json
  motivation  Json
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("applications")
}
```

## Testing Strategy

### Unit Tests
- Test utility functions
- Test component logic
- Test API validation
- Use Jest with React Testing Library

```typescript
// Component test
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests
- Test API endpoints
- Test database operations
- Test email functionality
- Use Supertest for API testing

```typescript
// API test
import request from 'supertest';
import { app } from '../app';

describe('POST /api/auth/request-otp', () => {
  it('should send OTP to valid email', async () => {
    const response = await request(app)
      .post('/api/auth/request-otp')
      .send({ email: 'test@example.com' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('OTP sent');
  });

  it('should reject invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/request-otp')
      .send({ email: 'invalid-email' })
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});
```

### End-to-End Tests
- Test complete user flows
- Use Playwright or Cypress
- Test critical paths only

## Performance Optimization

### Frontend
- Use dynamic imports for code splitting
- Optimize images with Next.js Image
- Implement lazy loading
- Use React.memo for expensive components

### Backend
- Implement database query optimization
- Use caching where appropriate
- Optimize API response sizes
- Implement rate limiting

### Database
- Create proper indexes
- Use connection pooling
- Optimize query patterns
- Monitor slow queries

## Security Best Practices

### Authentication
- Use JWT with proper expiration
- Implement refresh token rotation
- Store tokens securely (HttpOnly cookies)
- Validate all inputs

### Authorization
- Implement role-based access control
- Check permissions on all endpoints
- Use middleware for auth checks
- Log security events

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS everywhere
- Implement CSRF protection
- Sanitize user inputs

## Deployment

### Environment Setup
- Use environment variables for secrets
- Separate environments (dev/staging/prod)
- Use managed databases
- Implement proper logging

### CI/CD Pipeline
- Run tests on every PR
- Lint code automatically
- Deploy to staging first
- Use blue-green deployments

### Monitoring
- Implement error tracking (Sentry)
- Monitor performance metrics
- Set up alerts for issues
- Log security events

## Code Reviews

### Checklist
- [ ] Code follows established patterns
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Security best practices followed
- [ ] Performance considerations addressed
- [ ] No console.logs in production code
- [ ] TypeScript types are correct
- [ ] Commit messages follow convention

### Review Process
1. Author creates PR with description
2. Automated checks run (lint, test, build)
3. Reviewer reviews code changes
4. Feedback provided and addressed
5. Approval and merge

## Documentation

- Keep README updated
- Document API changes
- Update component documentation
- Maintain changelog

## Tooling

### Development Tools
- VS Code with recommended extensions
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks

### Monitoring Tools
- Sentry for error tracking
- Vercel Analytics for performance
- Database monitoring tools
- Uptime monitoring

## Troubleshooting

### Common Issues
1. **Build Errors**: Check TypeScript types and imports
2. **Database Issues**: Verify connection and migrations
3. **Auth Problems**: Check JWT secrets and cookie settings
4. **Email Issues**: Verify SMTP configuration

### Getting Help
1. Check existing documentation
2. Search GitHub issues
3. Ask in team chat
4. Contact technical lead

## Contributing

See [Contributing Guide](contributing.md) for detailed contribution guidelines.