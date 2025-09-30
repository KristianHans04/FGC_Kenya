# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Development Standards

### 1. Theme Support
- **ALWAYS** implement both light and dark mode support using next-themes
- Test all components in both themes before completion
- Use CSS variables for theme-aware colors

### 2. Mobile Responsiveness
- **ALWAYS** use responsive Tailwind classes (sm:, md:, lg:, xl:, 2xl:)
- Design mobile-first, then enhance for larger screens
- Test on multiple viewport sizes (320px, 768px, 1024px, 1440px)
- Use responsive units (rem, em, %, vw/vh) appropriately

### 3. Security Best Practices
**ALWAYS** implement these security measures:
- **Input Validation**: Sanitize and validate all user inputs
- **Rate Limiting**: Use express-rate-limit for API endpoints
- **DDoS Protection**: Implement request throttling and connection limits
- **SQL Injection Prevention**: Use parameterized queries with Prisma/Sequelize
- **XSS Prevention**: Sanitize HTML output, use React's built-in escaping
- **CSRF Protection**: Implement CSRF tokens for state-changing operations
- **Authentication**: Use JWT with secure httpOnly cookies
- **Authorization**: Implement role-based access control (RBAC)
- **Headers Security**: Use helmet.js for security headers
- **CORS**: Configure strict CORS policies
- **Data Encryption**: Use bcrypt for passwords, encrypt sensitive data
- **File Upload Security**: Validate file types, size limits, scan for malware
- **Session Security**: Implement secure session management
- **API Security**: Use API keys, OAuth 2.0 where appropriate
- **Dependency Security**: Regular npm audit, keep dependencies updated
- **Error Handling**: Never expose stack traces or sensitive info in production

### 4. SEO Optimization (Target: 95%+ Lighthouse Score)
- **Meta Tags**: Implement comprehensive meta tags in each page
- **Structured Data**: Add JSON-LD schema markup
- **Sitemap**: Generate and maintain sitemap.xml
- **Robots.txt**: Configure proper crawling rules
- **Performance**: Optimize images (WebP format, lazy loading, srcset)
- **Core Web Vitals**: Monitor and optimize LCP, FID, CLS
- **Semantic HTML**: Use proper heading hierarchy (h1-h6)
- **URL Structure**: Use clean, descriptive URLs
- **Open Graph**: Implement OG tags for social media
- **Canonical URLs**: Set canonical tags to avoid duplicate content

### 5. Accessibility (WCAG 2.1 AA Compliance)
- **Alt Text**: ALWAYS provide descriptive alt attributes for images
- **ARIA Labels**: Use aria-label, aria-describedby where needed
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Focus Management**: Implement visible focus indicators
- **Color Contrast**: Maintain WCAG AA contrast ratios (4.5:1 for normal text)
- **Screen Reader Support**: Test with screen readers
- **Form Labels**: Associate all form inputs with labels
- **Error Messages**: Provide clear, accessible error messages
- **Skip Links**: Implement skip-to-content links
- **Language**: Declare page language with lang attribute

### 6. Environment Variables & Secrets
- **NEVER** commit .env files to version control
- **ALWAYS** use process.env for sensitive data
- Store secrets in .env.local (already in .gitignore)
- Use different keys for development/staging/production
- Document required env variables in .env.local.example

### 7. Modern Coding Practices
- **Code Organization**:
  - Components in /app/components
  - API routes in /app/api
  - Utilities in /app/lib or /app/utils
  - Types in /app/types
  - Hooks in /app/hooks
- **Script Placement**:
  - NO inline scripts in HTML/JSX
  - Use Next.js Script component for third-party scripts
  - Place analytics in appropriate Next.js locations
- **Component Structure**:
  - One component per file
  - Use TypeScript interfaces for props
  - Implement proper error boundaries
- **State Management**:
  - Use React hooks appropriately
  - Consider Context API or Zustand for global state
- **Performance**:
  - Use React.memo for expensive components
  - Implement code splitting with dynamic imports
  - Optimize bundle size

### 8. Documentation & Comments
- **File Headers**: Include purpose and author at top of complex files
```typescript
/**
 * @file ComponentName.tsx
 * @description Brief description of component purpose
 * @author Team Kenya Dev
 */
```
- **Function Documentation**: Use JSDoc for all exported functions
```typescript
/**
 * Calculates the total donation amount
 * @param {number} amount - Base donation amount
 * @param {number} taxRate - Applicable tax rate
 * @returns {number} Total amount including tax
 */
```
- **Complex Logic**: Comment WHY, not WHAT
- **API Documentation**: Document all endpoints with request/response examples
- **Component Props**: Document all props with TypeScript interfaces
- **README Updates**: Keep README.md current with setup changes

## Commands

### Development
- **Run development server**: `npm run dev` - Starts Next.js dev server on port 3000
- **Run backend server**: `npm run server` - Starts Express server (once server/index.js is created)
- **Run both servers**: `npm run dev:all` - Runs frontend and backend concurrently

### Build & Production
- **Build application**: `npm run build` - Creates optimized production build
- **Start production**: `npm start` - Runs production server
- **Export static site**: `npm run export` - Creates static export for GitHub Pages

### Code Quality
- **Lint**: `npm run lint` - Run Next.js linting
- **Type check**: Run TypeScript compiler with `npx tsc --noEmit`

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4 with PostCSS
- **Backend**: Express.js (to be implemented in server/)
- **Database**: PostgreSQL with Sequelize ORM (Prisma setup started)
- **UI Components**: Radix UI primitives, Framer Motion for animations
- **Icons**: Lucide React, React Icons

### Project Structure
- `/app` - Next.js App Router with file-based routing
  - `/components` - Reusable React components (Header, Footer, ThemeProvider, etc.)
  - `/lib` - Utility functions and helpers
  - `/api` - API route handlers (currently empty, to be implemented)
  - Page directories: `/about`, `/news`, `/impact`, `/join`, `/support`, `/contact`, `/resources`
- `/server` - Express backend structure (not yet implemented)
  - Organized into `/api`, `/controllers`, `/models`, `/routes`, `/middleware`, `/utils`
- `/prisma` - Database schema and migrations (to be set up)
- `/public` - Static assets and images

### Routing Pattern
Uses Next.js 15 App Router with file-based routing. Each directory under `/app` with a `page.tsx` file becomes a route.

### Component Patterns
- Components use TypeScript with proper typing
- Tailwind CSS for styling with utility classes
- Dark mode support via next-themes and ThemeProvider
- Components follow functional component patterns with hooks

### Path Aliases
- `@/*` maps to repository root for clean imports

## Kenya Theme Design System
- **Colors**: Kenya flag colors - Green (#006600), Red (#BB0000), Black (#000000), White (#FFFFFF), Gold accent (#FFD700)
- **Typography**: Poppins for headings, Inter for body text
- **Dark mode**: Implemented with next-themes, toggle in header

## Incomplete Features
The following pages/features need implementation:
- `/join` - Application form for students
- `/support` - Donation and sponsorship page
- `/contact` - Contact form with validation
- `/resources` - Learning materials and links
- Backend API endpoints in `/app/api` or Express server
- Database setup with Prisma migrations
- Authentication system
- Payment integration for donations