# Project Architecture - FIRST Global Team Kenya

## Technology Stack

### Frontend
- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5.9.3
- **UI Framework**: React 19.2.3
- **Styling**: Tailwind CSS 4.1.18
- **Animation**: Framer Motion 12.23.26
- **Icons**: Lucide React, React Icons
- **Theme**: next-themes for dark/light mode support

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma 7.2.0 with PostgreSQL adapter
- **Authentication**: JWT + OTP-based system
- **Email**: Nodemailer with Mailtrap

### Infrastructure
- **Deployment**: Vercel (recommended)
- **Database Host**: Supabase
- **File Storage**: Local (future: cloud storage)
- **CDN**: Cloudflare (optional)

## Project Structure

```
FGC_Kenya/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── admin/           # Admin endpoints
│   │   ├── applications/   # Application management
│   │   └── auth/           # Authentication endpoints
│   ├── components/          # React components
│   ├── lib/                 # Utility libraries
│   │   ├── auth/           # Auth utilities
│   │   ├── email/          # Email templates
│   │   ├── middleware/     # Middleware functions
│   │   ├── security/       # Security utilities
│   │   └── validations/    # Zod schemas
│   ├── types/              # TypeScript definitions
│   └── [pages]/            # Page routes
├── docs/                    # Documentation
│   ├── api/                # API documentation
│   ├── architecture/       # Architecture docs
│   └── guides/            # Development guides
├── prisma/                 # Database schema
├── public/                 # Static assets
└── temp_docs/             # Temporary docs (gitignored)
```

## Security Architecture

### Authentication Flow
1. User requests OTP via email
2. OTP generated with SHA-256 hashing
3. User verifies OTP (max 5 attempts)
4. JWT access token (15min) + refresh token (7d) issued
5. Session stored in database
6. Token refresh via refresh endpoint

### Security Measures
- **SQL Injection**: Prevented via Prisma ORM
- **XSS**: React escaping + CSP headers with nonce
- **CSRF**: Token-based protection for state changes
- **Rate Limiting**: IP-based with tiered limits
- **DDoS**: Request throttling and size limits
- **Input Validation**: Zod schemas for all inputs
- **Session Security**: HttpOnly, Secure, SameSite cookies
- **Password Security**: OTP-based (no passwords stored)
- **Audit Logging**: All sensitive actions tracked

### Security Headers
- Content-Security-Policy with nonce
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS)
- Referrer-Policy: strict-origin-when-cross-origin

## Database Architecture

### Core Models
- **User**: Authentication and profile
- **Application**: Student applications for team
- **Session**: JWT session management
- **OTPCode**: One-time password codes
- **AuditLog**: Security audit trail

### Supporting Models
- **TeamMember**: Team member profiles
- **NewsArticle**: News and updates
- **Competition**: Competition history
- **Resource**: Learning materials
- **ImpactStory**: Success stories
- **Partner**: Sponsors and partners

### Database Security
- Row-level security (RLS) via Prisma
- Soft deletes for data preservation
- Audit trail for all changes
- Regular backups (handled by Supabase)

## API Architecture

### Endpoints Structure
```
/api/auth/
  - request-otp     [POST] Request OTP
  - verify-otp      [POST] Verify OTP and login
  - refresh         [POST] Refresh access token
  - logout          [POST] Logout user

/api/applications/
  - [GET]           List user applications
  - [POST]          Create application
  - [id]            Application CRUD

/api/admin/
  - users/          User management
  - applications/   Application review
  - dashboard/      Admin analytics
```

### API Security
- JWT authentication required
- Role-based access control (RBAC)
- Request validation with Zod
- Rate limiting per endpoint
- CSRF protection on mutations
- Audit logging for admin actions

## Performance Optimizations

### Frontend
- Static generation for public pages
- Dynamic imports for code splitting
- Image optimization with Next.js Image
- Font optimization with next/font
- Lazy loading for heavy components

### Backend
- Database connection pooling
- Query optimization with Prisma
- Response caching where appropriate
- Pagination for list endpoints

### SEO & Performance
- Target: 95+ Lighthouse score
- Core Web Vitals optimized
- Structured data implementation
- XML sitemap generation
- Meta tags for all pages

## Deployment Strategy

### Environment Variables
```env
DATABASE_URL          # PostgreSQL connection
JWT_SECRET           # JWT signing secret
JWT_REFRESH_SECRET   # Refresh token secret
EMAIL_*              # Email configuration
NEXT_PUBLIC_*        # Public environment vars
```

### Deployment Process
1. Run tests and linting
2. Security audit (npm audit)
3. Build optimization
4. Deploy to staging
5. Run E2E tests
6. Deploy to production

### Monitoring
- Error tracking (recommended: Sentry)
- Performance monitoring
- Uptime monitoring
- Security scanning
- Analytics tracking

## Development Guidelines

### Code Standards
- TypeScript strict mode
- ESLint + Prettier formatting
- Component-based architecture
- Atomic design principles
- DRY (Don't Repeat Yourself)

### Testing Strategy
- Unit tests for utilities
- Integration tests for APIs
- Component tests with React Testing Library
- E2E tests for critical flows
- Minimum 80% coverage

### Security Requirements
- Follow OWASP Top 10
- Regular dependency updates
- Security headers on all responses
- Input validation on all endpoints
- Secure session management

## Scaling Considerations

### Horizontal Scaling
- Stateless application design
- Database connection pooling
- CDN for static assets
- Load balancing ready

### Vertical Scaling
- Optimized database queries
- Efficient caching strategies
- Background job processing
- Resource optimization

## Maintenance

### Regular Tasks
- Weekly dependency updates
- Monthly security audits
- Database optimization
- Performance monitoring
- Backup verification

### Documentation
- Keep API docs updated
- Update architecture diagrams
- Document configuration changes
- Maintain changelog