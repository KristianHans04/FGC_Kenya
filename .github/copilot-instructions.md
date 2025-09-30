# AI Coding Instructions for FIRST Global Team Kenya Website

## 🚨 CRITICAL REQUIREMENTS - READ FIRST

### Non-Negotiable Standards
1. **Theme Support**: EVERY component must support light/dark mode via `next-themes`
2. **Mobile-First**: ALL code must be mobile responsive using Tailwind breakpoints
3. **Security**: Implement comprehensive security practices (see Security section)
4. **SEO**: Target 95%+ Lighthouse scores with full SEO optimization
5. **Accessibility**: WCAG 2.1 AA compliance with proper alt tags, ARIA labels
6. **Environment Security**: NEVER expose API keys - use `.env.local` only
7. **Modern Practices**: Scripts in separate files, proper TypeScript typing
8. **Documentation**: Extensive comments and JSDoc for ALL functions/components

## 🏗️ Architecture Overview

This is a **dual-purpose Next.js 15 application** designed for both full-stack deployment and static export:
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS with App Router
- **Backend**: Express.js server (in development) with PostgreSQL database
- **Deployment**: Can be deployed as full-stack app OR exported as static site for GitHub Pages

### Key Components Structure
```
app/
├── components/          # Shared React components with Kenyan branding
├── [page-routes]/      # File-based routing (about, news, impact, etc.)
├── globals.css         # Kenya flag colors + design system
└── layout.tsx          # Root layout with theme provider
server/                 # Express backend (TODO - structure exists)
```

## 🇰🇪 Design System & Branding

**Critical**: This project represents Kenya's national robotics team. ALL designs must reflect Kenyan identity:

### Colors (defined in `app/globals.css`)
```css
--color-kenya-green: #006600     /* Primary brand color */
--color-kenya-red: #BB0000       /* Secondary/accent */
--color-kenya-black: #000000     /* Text/contrast */
--color-kenya-white: #FFFFFF     /* Backgrounds */
--color-accent: #FFD700          /* Gold highlights */
```

### Typography
- **Headings**: Poppins font (`font-heading` class)
- **Body text**: Inter font (default)
- Both fonts loaded via Google Fonts in `layout.tsx`

### Custom Classes
- `.african-pattern`: Diagonal stripes using Kenya flag colors
- `.kenya-flag-gradient`: Full flag color progression
- `.btn-primary`, `.btn-secondary`: Pre-styled buttons with Kenya colors

## 🔧 Development Workflows

### Essential Commands
```bash
npm run dev              # Start Next.js dev server (port 3000)
npm run dev:all          # Start both frontend AND backend servers
npm run build            # Production build
npm run export           # Static export for GitHub Pages
npm run server           # Backend only (requires server/index.js)
```

### Dual Architecture Pattern
- **Full-stack mode**: Uses API routes in `app/api/` + separate Express server
- **Static mode**: All content hardcoded, no server-side features
- Switch via `next.config.mjs` output setting

## 📄 Page Implementation Patterns

### Completed Pages (Reference Examples)
- `app/page.tsx`: Hero with animations, stats counters, Kenya flag elements
- `app/about/page.tsx`: Mission/vision with timeline components
- `app/news/page.tsx`: Grid layout with filtering
- `app/impact/page.tsx`: Story cards with metrics

### TODO Pages (High Priority)
Per README.md, these pages need implementation:
1. **Join Page** (`app/join/page.tsx`): Application forms, eligibility
2. **Support Page** (`app/support/page.tsx`): Donations, sponsorship tiers
3. **Contact Page** (`app/contact/page.tsx`): Contact forms, maps
4. **Resources Page** (`app/resources/page.tsx`): Learning materials, videos

## 🎨 Component Patterns

### Animation Standards
- Use `framer-motion` for page transitions and hover effects
- Kenya flag colors in animated backgrounds (see homepage examples)
- Stagger animations for lists/grids

### Responsive Design
- Mobile-first approach with Tailwind breakpoints
- Navigation collapses to hamburger menu on mobile
- All components must work on phones (primary user base in Kenya)

### Theme Support
- Dark/light mode via `next-themes`
- Theme toggle in header component
- Colors automatically switch via CSS custom properties

## 🔌 Backend Integration (When Implementing)

### API Endpoints Needed
```
/api/news        # CRUD for news articles
/api/stories     # Impact stories management  
/api/applications # Student application forms
/api/contact     # Contact form submissions
/api/donations   # Payment processing
```

### Database Setup
- PostgreSQL via Prisma or Sequelize
- Environment variables in `.env.local`
- Development: Local PostgreSQL
- Production: Render.com or Supabase

## 🚀 Deployment Patterns

### Static Export (Current)
```bash
npm run build && npm run export
# Output: `out/` directory for GitHub Pages
```

### Full-Stack Deployment
- Platform: Render.com (recommended)
- Environment: Node.js with PostgreSQL addon
- Build: `npm run build`, Start: `npm start`

## 💡 Code Standards

### File Organization
- Page components in route folders (Next.js App Router)
- Reusable components in `app/components/`
- Utilities in `app/lib/`
- Global styles in `app/globals.css`

### TypeScript Patterns
- Strict mode enabled
- Path aliases: `@/` maps to project root
- Component props always typed
- API responses typed for backend integration

## 🔒 Security Requirements

### Environment & API Security
- **NEVER** expose API keys, database credentials, or secrets in code
- Use `.env.local` for all sensitive data (add to `.gitignore`)
- Validate all environment variables at startup
- Use different API keys for development/staging/production

### Backend Security (When Implementing)
- **Rate Limiting**: Implement on all API endpoints (express-rate-limit)
- **SQL Injection Prevention**: Use parameterized queries/ORM only
- **CORS**: Configure strict CORS policies for production
- **Input Validation**: Validate/sanitize ALL user inputs (Zod/Joi)
- **Authentication**: Implement JWT with secure httpOnly cookies
- **CSRF Protection**: Use CSRF tokens for state-changing operations
- **XSS Prevention**: Sanitize HTML content, use Content Security Policy
- **HTTPS Enforcement**: Redirect HTTP to HTTPS in production
- **Request Size Limits**: Limit payload sizes to prevent DoS
- **Error Handling**: Never expose internal errors to clients
- **Logging**: Log security events without exposing sensitive data

## ♿ Accessibility Standards (WCAG 2.1 AA)

### Required Implementation
- **Alt Tags**: Descriptive alt text for ALL images
- **ARIA Labels**: Proper ARIA attributes for interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Visible focus indicators, logical tab order
- **Color Contrast**: Minimum 4.5:1 ratio for normal text, 3:1 for large text
- **Screen Reader Support**: Semantic HTML, proper heading hierarchy
- **Motion**: Respect `prefers-reduced-motion` for animations

### Code Examples
```tsx
// ✅ Good - Accessible button
<button 
  aria-label="Open navigation menu"
  className="focus:ring-2 focus:ring-primary focus:outline-none"
>
  <Menu aria-hidden="true" />
</button>

// ✅ Good - Accessible image
<Image 
  src="/team-photo.jpg"
  alt="FIRST Global Team Kenya students working on robot at 2024 competition"
  className="rounded-lg"
/>
```

## 🚀 SEO & Performance (Target: 95%+ Lighthouse)

### Core Web Vitals
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms  
- **Cumulative Layout Shift (CLS)**: < 0.1

### Implementation Requirements
- **Metadata**: Complete meta tags, Open Graph, Twitter Cards
- **Structured Data**: JSON-LD for events, organizations, articles
- **Image Optimization**: Next.js Image component with proper sizing
- **Font Loading**: Preload critical fonts, font-display: swap
- **Code Splitting**: Dynamic imports for heavy components
- **Caching**: Appropriate cache headers for static assets
- **Compression**: Enable gzip/brotli compression

### SEO Checklist Per Page
```tsx
// ✅ Required metadata structure
export const metadata: Metadata = {
  title: "Specific Page Title - FIRST Global Team Kenya",
  description: "Descriptive 150-160 character summary",
  keywords: "relevant, kenyan, robotics, keywords",
  openGraph: {
    title: "Social media optimized title",
    description: "Social description",
    images: [{ url: "/images/og-specific-page.jpg", width: 1200, height: 630 }]
  }
}
```

## 📱 Mobile-First Responsive Design

### Breakpoint Strategy
```css
/* Mobile first - default styles for mobile */
.component { /* Mobile styles */ }

/* Tablet and up */
@media (min-width: 768px) { /* md: styles */ }

/* Desktop and up */  
@media (min-width: 1024px) { /* lg: styles */ }

/* Large desktop */
@media (min-width: 1280px) { /* xl: styles */ }
```

### Tailwind Responsive Patterns
```tsx
// ✅ Mobile-first responsive classes
<div className="
  grid grid-cols-1           // Mobile: 1 column
  md:grid-cols-2            // Tablet: 2 columns  
  lg:grid-cols-3            // Desktop: 3 columns
  gap-4 md:gap-6 lg:gap-8   // Responsive gaps
">
```

## 🌓 Theme Support Implementation

### Required for ALL Components
```tsx
// ✅ Theme-aware component example
'use client'
import { useTheme } from 'next-themes'

export function Component() {
  const { theme } = useTheme()
  
  return (
    <div className="
      bg-background text-foreground      // Auto theme colors
      dark:bg-card dark:text-card-foreground  // Dark mode specific
    ">
      {/* Content */}
    </div>
  )
}
```

### CSS Custom Properties Pattern
```css
/* ✅ Define both light and dark mode colors */
:root {
  --color-primary: #006600;
  --color-background: #ffffff;
}

.dark {
  --color-primary: #008800;  
  --color-background: #0a0a0a;
}
```

## 💡 Code Standards

### File Organization
- Page components in route folders (Next.js App Router)
- Reusable components in `app/components/`
- Utilities in `app/lib/`
- Global styles in `app/globals.css`

### Modern Coding Practices
- **Separation of Concerns**: Scripts in separate `.ts/.js` files, never inline
- **Type Safety**: Full TypeScript coverage with strict mode
- **JSDoc Documentation**: All functions and components documented
- **Component Architecture**: Small, single-responsibility components
- **Custom Hooks**: Extract logic into reusable hooks
- **Error Boundaries**: Implement proper error handling

### Documentation Requirements
```tsx
/**
 * Kenya-themed hero section component with flag animations
 * @param title - Main headline text
 * @param subtitle - Supporting description text
 * @param showStats - Whether to display statistics counter
 * @returns Fully responsive hero section with theme support
 */
export function HeroSection({ 
  title, 
  subtitle, 
  showStats = true 
}: HeroSectionProps) {
  // Implementation with extensive inline comments
}
```

### Environment Configuration
```typescript
// ✅ Good - Environment validation
const requiredEnvVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  API_KEY: process.env.API_KEY,
} as const

// Validate at startup
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
})
```

## 🎯 Content Guidelines

### Writing Tone
- Professional but inspiring
- Focus on STEM education impact in Kenya
- Highlight student achievements and community outreach
- Include success stories and metrics

### Images & Assets
- Store in `public/images/`
- Use Kenya flag colors in graphics
- Include diverse representation of Kenyan students
- Optimize for web (Next.js Image component handles this)

## 🔍 Project Context

This website serves Kenya's national team in the FIRST Global Challenge robotics competition. Understanding this context is crucial:
- **Audience**: Students, parents, educators, sponsors in Kenya
- **Goal**: Inspire STEM participation and showcase impact
- **Unique Value**: Represents Kenya's growing tech ecosystem and robotics education

When implementing features, always consider the local context and accessibility for users across Kenya with varying internet speeds and device capabilities.