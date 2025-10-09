# FIRST Global Team Kenya Website 🇰🇪

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern, responsive website for FIRST Global Team Kenya - representing Kenya's national team in the FIRST Global Challenge robotics competition.

**🌐 Live Site**: [firstglobalkenya.org](https://firstglobalkenya.org) (when deployed)  
**📧 Contact**: info@firstglobalkenya.org  
**🐦 Twitter**: [@FGCKenya](https://twitter.com/FGCKenya)

## 🇰🇪 Project Overview

This website showcases Kenya's participation in the FIRST Global Challenge, inspiring STEM education and innovation across Kenya. 

### Key Features

- **🎨 Kenyan Identity**: Proudly displays Kenya flag colors (green, red, black, white) with African design patterns
- **⚡ Modern Tech Stack**: Built with Next.js 15, React 19, TypeScript, and Tailwind CSS
- **🌓 Theme Support**: Seamless light/dark mode switching
- **📱 Mobile-First**: Fully responsive design optimized for all devices
- **♿ Accessible**: WCAG 2.1 AA compliant with screen reader support
- **🚀 SEO Optimized**: Lighthouse score 95%+ with comprehensive meta tags
- **🔄 Dual Deployment**: Supports both full-stack (with backend API) and static export for GitHub Pages

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **npm** 9.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** 14+ (optional, only for full-stack backend development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KristianHans04/FGC_Kenya.git
   cd FGC_Kenya
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional, for backend features)
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration (if needed)
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Visit [http://localhost:3000](http://localhost:3000) to see the website.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server on port 3000 |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server (requires build first) |
| `npm run lint` | Run Next.js linting |
| `npm run export` | Export static site to `out/` directory |
| `npm run server` | Start Express backend server (TODO) |
| `npm run dev:all` | Run both frontend and backend concurrently (TODO) |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with initial data |

### Troubleshooting

**Issue**: `Module not found` errors
- **Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Issue**: Port 3000 is already in use
- **Solution**: Kill the process using port 3000 or specify a different port:
  ```bash
  PORT=3001 npm run dev
  ```

**Issue**: Build fails with TypeScript errors
- **Solution**: Ensure you're using Node.js 18+ and TypeScript 5.9+
  ```bash
  node --version
  npx tsc --version
  ```

## 📁 Project Structure

```
FGC_Kenya/
├── app/                          # Next.js App Router (v15)
│   ├── components/               # Reusable React components
│   │   ├── Header.tsx           # Navigation header with theme toggle
│   │   ├── Footer.tsx           # Site footer with links
│   │   ├── ThemeProvider.tsx    # Dark/light mode provider
│   │   ├── ThemeToggle.tsx      # Theme switch button
│   │   ├── CountUp.tsx          # Animated counter component
│   │   ├── CountdownTimer.tsx   # Countdown timer component
│   │   └── ImageSlideshow.tsx   # Image carousel component
│   ├── about/                   # About Team Kenya page ✅
│   ├── news/                    # News & Updates section ✅
│   ├── impact/                  # Impact Stories page ✅
│   ├── join/                    # How to Join page 🚧
│   ├── support/                 # Support & Donations page 🚧
│   ├── contact/                 # Contact Us page 🚧
│   ├── resources/               # Resources page 🚧
│   ├── lib/                     # Utility functions and helpers
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Homepage ✅
│   └── globals.css              # Global styles & Kenya theme colors
├── server/                      # Express backend (TODO)
│   ├── api/                    # API endpoints
│   ├── controllers/            # Request handlers
│   ├── models/                 # Database models
│   ├── routes/                 # Route definitions
│   ├── middleware/             # Express middleware
│   └── utils/                  # Backend utilities
├── prisma/                      # Database schema and migrations
│   ├── schema.prisma           # Prisma schema definition
│   └── seed.ts                 # Database seeding script
├── public/                      # Static assets
│   ├── images/                 # Image files
│   └── favicon.ico             # Site favicon
├── .github/                     # GitHub configuration
│   ├── workflows/              # CI/CD workflows (TODO)
│   └── copilot-instructions.md # AI coding guidelines
├── .env.local                   # Environment variables (not committed)
├── .gitignore                   # Git ignore rules
├── CLAUDE.md                    # AI development guidelines
├── CONTRIBUTING.md              # Contribution guidelines
├── README.md                    # This file
├── LICENSE                      # MIT License
├── next.config.mjs              # Next.js configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind CSS configuration (v4)
└── postcss.config.js            # PostCSS configuration
```

**Legend**: ✅ Completed | 🚧 In Progress | 📋 TODO

## 🎨 Design System

Our design system reflects Kenya's national identity and ensures consistency across the website.

### Color Palette

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Kenya Green** | `#006600` | Primary brand color, buttons, accents |
| **Kenya Red** | `#BB0000` | Secondary color, highlights, CTAs |
| **Kenya Black** | `#000000` | Text, strong contrast elements |
| **Kenya White** | `#FFFFFF` | Backgrounds, text on dark |
| **Gold Accent** | `#FFD700` | Special highlights, awards, achievements |

### Typography

- **Headings**: [Poppins](https://fonts.google.com/specimen/Poppins) - Bold, modern font for titles and headings
- **Body Text**: [Inter](https://fonts.google.com/specimen/Inter) - Clean, readable font for content
- **Font Loading**: Optimized via Google Fonts in `layout.tsx`

### Custom CSS Classes

Defined in `app/globals.css`:

- `.african-pattern` - Diagonal stripes using Kenya flag colors
- `.kenya-flag-gradient` - Full flag color progression
- `.btn-primary` - Primary button with Kenya green
- `.btn-secondary` - Secondary button with Kenya red
- `.font-heading` - Poppins font for headings
- `.text-gradient` - Animated text gradient effect

### Component Guidelines

- All components support **light/dark mode** via `next-themes`
- Mobile-first responsive design using Tailwind breakpoints
- Consistent spacing: `gap-4`, `p-6`, `my-8`
- Border radius: `rounded-lg` for cards, `rounded-full` for buttons
- Shadows: `shadow-lg` for cards, `shadow-xl` for modals

## 📄 Pages Status

### ✅ Completed Pages

| Page | Route | Description | Features |
|------|-------|-------------|----------|
| **Homepage** | `/` | Landing page | Hero section, stats counter, journey timeline, CTAs |
| **About** | `/about` | Team information | Mission, vision, competition history, achievements |
| **News** | `/news` | News articles | Grid layout, filtering, search functionality |
| **Impact** | `/impact` | Success stories | Story cards, metrics, outreach programs |

### 🚧 Pages In Development

These pages have been created but need full implementation:

#### 1. Join Page (`/join`)
**Purpose**: Recruit students and volunteers

**Required Features**:
- Application form for students
- Eligibility requirements section
- Timeline and deadlines
- Volunteer opportunities
- FAQ section
- Form validation with Zod
- Success/error messaging

#### 2. Support Page (`/support`)
**Purpose**: Enable donations and sponsorships

**Required Features**:
- Donation form (one-time & recurring)
- Sponsorship tiers display
- Impact visualization
- Payment gateway integration (M-Pesa, card payments)
- Donor recognition section
- Tax receipt information

#### 3. Contact Page (`/contact`)
**Purpose**: Facilitate communication

**Required Features**:
- Contact form with validation
- Office location with interactive map
- Social media links
- Response time expectations
- FAQ section
- CAPTCHA for spam prevention

#### 4. Resources Page (`/resources`)
**Purpose**: Provide learning materials

**Required Features**:
- FIRST Global official links
- Educational materials library
- Past competition videos
- Technical documentation
- Workshop schedules
- Downloadable resources

### 📋 Future Pages

- **Team Gallery**: Photos and profiles of team members
- **Blog**: Long-form articles and updates
- **Events**: Calendar of upcoming events
- **Partners**: Showcase sponsors and partners
- **Alumni**: Success stories of past participants

## 🔧 Backend Implementation (TODO)

The backend infrastructure is planned but not yet implemented. Here's the roadmap:

### Technology Stack

- **Framework**: Express.js 5.x
- **Database**: PostgreSQL 14+
- **ORM**: Prisma (preferred) or Sequelize
- **Authentication**: JWT with httpOnly cookies
- **Validation**: Zod for request/response validation
- **API Documentation**: Swagger/OpenAPI

### Database Setup

1. **Install Prisma**
   ```bash
   npm install @prisma/client prisma --save-dev
   ```

2. **Initialize Prisma**
   ```bash
   npx prisma init
   ```

3. **Define Schema** in `prisma/schema.prisma`
   ```prisma
   model User {
     id        Int      @id @default(autoincrement())
     email     String   @unique
     name      String
     role      Role     @default(USER)
     createdAt DateTime @default(now())
   }
   
   model News {
     id          Int      @id @default(autoincrement())
     title       String
     content     String
     publishedAt DateTime @default(now())
   }
   ```

4. **Run Migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

### API Endpoints to Implement

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/news` | GET, POST, PUT, DELETE | News management | High |
| `/api/stories` | GET, POST, PUT, DELETE | Impact stories | High |
| `/api/applications` | POST | Student applications | High |
| `/api/contact` | POST | Contact form submissions | High |
| `/api/donations` | POST | Donation processing | Medium |
| `/api/auth/login` | POST | User authentication | Medium |
| `/api/auth/register` | POST | User registration | Medium |
| `/api/users` | GET, PUT, DELETE | User management | Low |

### Server Setup

Create `server/index.js`:

```javascript
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use('/api/', limiter)

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/news', require('./routes/news'))
app.use('/api/auth', require('./routes/auth'))

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

### Environment Variables Required

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fgc_kenya"

# Authentication
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# API Keys
PAYPAL_CLIENT_ID="your-paypal-client-id"
MPESA_CONSUMER_KEY="your-mpesa-key"
MPESA_CONSUMER_SECRET="your-mpesa-secret"

# Email (for contact form)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-password"

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

## 🌐 Static Export for GitHub Pages

The project can be deployed as a static site to GitHub Pages or any static hosting service.

### Creating Static Export

1. **Update `next.config.mjs`** for static export:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     images: {
       unoptimized: true, // Required for static export
     },
   }
   
   export default nextConfig
   ```

2. **Build and export**:
   ```bash
   npm run build
   npm run export
   ```
   
   Static files will be generated in the `out/` directory.

3. **Test locally**:
   ```bash
   npx serve out
   ```

### GitHub Pages Deployment

**Option 1: Manual Deployment**

1. Create and switch to `gh-pages` branch:
   ```bash
   git checkout -b gh-pages
   ```

2. Copy static files to branch root:
   ```bash
   cp -r out/* .
   ```

3. Commit and push:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

4. Enable GitHub Pages in repository settings (Settings → Pages → Source: gh-pages branch)

**Option 2: GitHub Actions (Automated)**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Export
        run: npm run export
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v3
```

### Custom Domain

To use a custom domain:

1. Add a `CNAME` file to the `public/` directory with your domain:
   ```
   firstglobalkenya.org
   ```

2. Configure DNS with your domain provider:
   - Add A records pointing to GitHub Pages IPs
   - Or add a CNAME record pointing to `yourusername.github.io`

3. Enable HTTPS in GitHub Pages settings

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Next.js)

Vercel is the creators of Next.js and offers the best integration:

1. **Sign up** at [vercel.com](https://vercel.com)
2. **Import repository** from GitHub
3. **Configure**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Add environment variables** in Vercel dashboard
5. **Deploy** - Automatic on every push to main

**Advantages**:
- Zero configuration
- Automatic HTTPS
- Global CDN
- Preview deployments for PRs
- Free tier available

### Option 2: Render.com (Full-Stack)

For full-stack deployment with database:

1. **Create account** at [render.com](https://render.com)

2. **Create PostgreSQL database**:
   - Dashboard → New → PostgreSQL
   - Note the database URL

3. **Create web service**:
   - Dashboard → New → Web Service
   - Connect GitHub repository
   - Configure:
     - Name: `fgc-kenya`
     - Build Command: `npm run build && npm run db:migrate`
     - Start Command: `npm start`
     - Environment: Node

4. **Add environment variables**:
   ```
   DATABASE_URL=[from PostgreSQL service]
   NODE_ENV=production
   JWT_SECRET=[generate secure key]
   ```

5. **Deploy** - Automatic on every push

### Option 3: GitHub Pages (Static Only)

See [Static Export for GitHub Pages](#-static-export-for-github-pages) section above.

### Option 4: Netlify

1. **Sign up** at [netlify.com](https://netlify.com)
2. **Import repository** from GitHub
3. **Configure**:
   - Build Command: `npm run build`
   - Publish Directory: `.next`
4. **Deploy**

### Database Hosting Options

| Service | Free Tier | Pros | Cons |
|---------|-----------|------|------|
| **Supabase** | Yes (500MB) | PostgreSQL, Auth, Storage | Learning curve |
| **Neon** | Yes (3GB) | Serverless PostgreSQL | Limited connections |
| **Render PostgreSQL** | Yes (90 days) | Easy setup | Free tier expires |
| **Railway** | $5 credit | Simple, generous | Not free |

### Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test contact forms and submissions
- [ ] Check mobile responsiveness
- [ ] Test light/dark mode switching
- [ ] Run Lighthouse audit (target 95%+)
- [ ] Verify SSL certificate (HTTPS)
- [ ] Test API endpoints (if backend deployed)
- [ ] Configure analytics (Google Analytics, Plausible, etc.)
- [ ] Set up error monitoring (Sentry)
- [ ] Configure email notifications
- [ ] Add sitemap to Google Search Console

## 🔒 Security Best Practices

Security is paramount for protecting user data and maintaining trust.

### ✅ Implemented

- **Environment Variables**: Secrets stored in `.env.local` (not committed)
- **HTTPS Ready**: Configured for SSL/TLS encryption
- **Input Sanitization**: Basic validation placeholders
- **CORS Configuration**: Cross-origin resource sharing setup
- **TypeScript**: Type safety reduces runtime errors
- **Next.js Security**: Built-in XSS protection

### 🚧 TODO (High Priority)

#### Authentication & Authorization
- [ ] Implement JWT authentication
- [ ] Use httpOnly cookies for tokens
- [ ] Add role-based access control (RBAC)
- [ ] Implement password hashing with bcrypt (12+ rounds)
- [ ] Add OAuth 2.0 for social login

#### Input Validation & Sanitization
- [ ] Validate all user inputs with Zod
- [ ] Sanitize HTML content (use DOMPurify)
- [ ] Implement file upload validation
- [ ] Add request size limits
- [ ] Validate email formats and phone numbers

#### API Security
- [ ] Rate limiting (express-rate-limit)
  ```javascript
  const rateLimit = require('express-rate-limit')
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP
  })
  ```
- [ ] CAPTCHA on forms (reCAPTCHA v3)
- [ ] API key authentication
- [ ] Request throttling per user

#### Database Security
- [ ] SQL injection prevention (use Prisma parameterized queries)
- [ ] Database connection pooling
- [ ] Encrypted database connections
- [ ] Regular database backups
- [ ] Principle of least privilege for DB users

#### Headers & CSRF
- [ ] Security headers with Helmet.js
  ```javascript
  app.use(helmet())
  ```
- [ ] CSRF tokens for state-changing operations
- [ ] Content Security Policy (CSP)
- [ ] X-Frame-Options header

#### Monitoring & Logging
- [ ] Error logging (Winston, Pino)
- [ ] Security event logging
- [ ] Failed login attempt monitoring
- [ ] Anomaly detection
- [ ] Regular security audits

### Security Checklist for Contributors

When adding new features:

- [ ] Never commit API keys or secrets
- [ ] Validate and sanitize all user inputs
- [ ] Use parameterized queries (no string concatenation)
- [ ] Implement proper error handling (don't expose stack traces)
- [ ] Add rate limiting to new API endpoints
- [ ] Use HTTPS in production
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Test for common vulnerabilities (XSS, CSRF, SQL injection)
- [ ] Implement proper authentication checks
- [ ] Follow principle of least privilege

### Reporting Security Vulnerabilities

If you discover a security vulnerability, please email **security@firstglobalkenya.org** instead of creating a public issue. Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We take security seriously and will respond promptly.

## 🎯 SEO & Performance Optimization

Target: **95%+ Lighthouse score** across all metrics.

### ✅ Implemented

**Performance**:
- ⚡ Next.js 15 App Router with automatic code splitting
- 🖼️ Image lazy loading via Next.js Image component
- 📦 Optimized bundle size
- 🎨 CSS-in-JS with Tailwind (minimal runtime)
- 🌓 Dark mode without layout shift

**SEO**:
- 📄 Meta tags and Open Graph tags on all pages
- 🏗️ Semantic HTML5 structure
- 📱 Mobile-responsive design
- ♿ WCAG 2.1 AA accessibility compliance
- 🔗 Clean URL structure

**User Experience**:
- 🎨 Consistent design system
- 🌓 Theme switching (light/dark)
- ⚡ Fast page transitions
- 📱 Mobile-first approach

### 🚧 TODO (High Priority)

#### Core Web Vitals Optimization

Target metrics:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

Actions:
- [ ] Optimize images (convert to WebP, use `srcset`)
- [ ] Preload critical resources
- [ ] Minimize JavaScript execution time
- [ ] Reduce unused CSS
- [ ] Implement resource hints (preconnect, prefetch)

#### SEO Enhancements

- [ ] **Sitemap.xml**: Generate dynamic sitemap
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://firstglobalkenya.org/</loc>
      <lastmod>2024-01-01</lastmod>
      <priority>1.0</priority>
    </url>
  </urlset>
  ```

- [ ] **Robots.txt**: Configure crawling rules
  ```
  User-agent: *
  Allow: /
  Sitemap: https://firstglobalkenya.org/sitemap.xml
  ```

- [ ] **Structured Data**: Add JSON-LD schema
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FIRST Global Team Kenya",
    "url": "https://firstglobalkenya.org",
    "logo": "https://firstglobalkenya.org/images/logo.png"
  }
  ```

- [ ] **Canonical URLs**: Prevent duplicate content
- [ ] **Meta descriptions**: Unique for each page (150-160 chars)
- [ ] **Alt tags**: Descriptive text for all images
- [ ] **Internal linking**: Strategic link structure

#### Performance Optimizations

- [ ] **Image Optimization**:
  - Convert to WebP format
  - Implement responsive images with `srcset`
  - Use blur placeholders for better UX
  - Lazy load images below the fold

- [ ] **Font Optimization**:
  - Preload critical fonts
  - Use `font-display: swap`
  - Subset fonts for faster loading

- [ ] **Code Splitting**:
  - Dynamic imports for heavy components
  - Route-based code splitting (already implemented)
  - Lazy load third-party scripts

- [ ] **Caching Strategy**:
  - Service worker for offline support
  - Cache static assets
  - API response caching

#### PWA Features

- [ ] Web app manifest (`manifest.json`)
- [ ] Service worker for offline functionality
- [ ] Add to home screen prompt
- [ ] Push notifications
- [ ] Offline fallback page

### Performance Monitoring

**Tools to use**:
- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)

**Metrics to track**:
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)

### SEO Checklist for New Pages

- [ ] Unique, descriptive title (50-60 chars)
- [ ] Meta description (150-160 chars)
- [ ] Open Graph tags for social sharing
- [ ] Proper heading hierarchy (h1 → h6)
- [ ] Alt text for all images
- [ ] Internal links to related pages
- [ ] Mobile-responsive
- [ ] Fast loading (< 3s)
- [ ] Accessible (WCAG AA)

## 📝 Content Management

Currently, all content is hardcoded in React components. Future improvements will enable dynamic content management.

### Current State

**Advantages**:
- 🚀 Fast performance (no database queries)
- 🔒 Secure (no API vulnerabilities)
- 💰 Cost-effective (static hosting)
- 📦 Simple deployment

**Limitations**:
- ✏️ Requires code changes to update content
- 👨‍💻 Technical knowledge needed for updates
- 🔄 No content versioning
- 👥 No multi-user editing

### Future CMS Implementation

#### Option 1: Headless CMS (Recommended)

**Strapi** (Self-hosted or Cloud)
```bash
npx create-strapi-app cms
cd cms
npm run develop
```

**Advantages**:
- Full control over data
- Customizable content types
- Media library
- Role-based access
- RESTful and GraphQL APIs

**Sanity.io** (Cloud-based)
```bash
npm install @sanity/client @sanity/image-url
```

**Advantages**:
- Real-time collaboration
- Excellent image handling
- Generous free tier
- Great developer experience
- Portable text editor

**Contentful** (Cloud-based)

**Advantages**:
- Enterprise-grade
- Powerful API
- Rich content modeling
- Multi-language support

#### Option 2: Custom Admin Panel

Build a custom admin interface:

```typescript
// app/admin/news/page.tsx
'use client'

export default function AdminNews() {
  const [news, setNews] = useState([])
  
  const handleCreate = async (data) => {
    const response = await fetch('/api/news', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    // Handle response
  }
  
  return (
    <div>
      <h1>Manage News</h1>
      <NewsForm onSubmit={handleCreate} />
      <NewsList items={news} />
    </div>
  )
}
```

**Features to implement**:
- WYSIWYG editor (TipTap, Slate, or Draft.js)
- Image upload with preview
- Draft/publish workflow
- Content scheduling
- SEO meta fields
- Content versioning

#### Option 3: Git-based CMS

**Netlify CMS / Decap CMS**
```yaml
# public/admin/config.yml
backend:
  name: git-gateway
  branch: main

media_folder: "public/images/uploads"
public_folder: "/images/uploads"

collections:
  - name: "news"
    label: "News"
    folder: "content/news"
    create: true
    fields:
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Body", name: "body", widget: "markdown"}
      - {label: "Date", name: "date", widget: "datetime"}
```

**Advantages**:
- No database needed
- Version control (Git)
- Free to use
- Markdown-based
- Simple setup

### Content Types to Manage

| Content Type | Priority | Fields Needed |
|--------------|----------|---------------|
| **News Articles** | High | Title, content, image, date, author, category |
| **Impact Stories** | High | Title, story, images, metrics, date |
| **Team Members** | Medium | Name, role, photo, bio, social links |
| **Events** | Medium | Title, description, date, location, registration link |
| **Resources** | Medium | Title, description, file/link, category |
| **Partners** | Low | Name, logo, description, website |
| **Testimonials** | Low | Name, role, quote, photo |

### Migration Strategy

1. **Phase 1: Setup CMS**
   - Choose CMS platform
   - Set up content models
   - Configure API access

2. **Phase 2: Create API Layer**
   - Build API routes
   - Implement caching
   - Add error handling

3. **Phase 3: Update Components**
   - Replace hardcoded data with API calls
   - Add loading states
   - Implement error boundaries

4. **Phase 4: Admin Interface**
   - Create admin dashboard
   - Add authentication
   - Implement CRUD operations

5. **Phase 5: Content Migration**
   - Export existing content
   - Import into CMS
   - Verify data integrity

### Caching Strategy

For dynamic content, implement caching:

```typescript
// app/api/news/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  // Cache for 5 minutes
  const news = await fetchNewsFromCMS()
  
  return NextResponse.json(news, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  })
}
```

### Markdown Support

For blog posts and articles:

```bash
npm install marked gray-matter
```

```typescript
import { marked } from 'marked'
import matter from 'gray-matter'

export function parseMarkdown(content: string) {
  const { data, content: body } = matter(content)
  const html = marked(body)
  return { metadata: data, html }
}
```

## 🧪 Testing (TODO)

Testing is crucial for maintaining code quality and preventing regressions.

### Testing Strategy

#### Unit Tests
Test individual functions and components in isolation.

**Tools**: Jest + React Testing Library

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

**Configuration** (`jest.config.js`):
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

**Example test**:
```typescript
// app/components/__tests__/Header.test.tsx
import { render, screen } from '@testing-library/react'
import Header from '../Header'

describe('Header', () => {
  it('renders navigation links', () => {
    render(<Header />)
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('News')).toBeInTheDocument()
  })
  
  it('has theme toggle button', () => {
    render(<Header />)
    const themeToggle = screen.getByRole('button', { name: /theme/i })
    expect(themeToggle).toBeInTheDocument()
  })
})
```

#### Integration Tests
Test how components work together.

```typescript
// app/__tests__/home.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import Home from '../page'

describe('Homepage Integration', () => {
  it('displays hero section with stats', async () => {
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText(/Team Kenya/i)).toBeInTheDocument()
    })
    
    // Check stats are rendered
    expect(screen.getByText(/students/i)).toBeInTheDocument()
  })
})
```

#### End-to-End Tests
Test complete user workflows.

**Tools**: Playwright or Cypress

```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Example E2E test**:
```typescript
// tests/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test'

test('navigation works correctly', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  // Click About link
  await page.click('text=About')
  await expect(page).toHaveURL(/.*about/)
  
  // Check content loaded
  await expect(page.locator('h1')).toContainText('About')
})

test('contact form submission', async ({ page }) => {
  await page.goto('http://localhost:3000/contact')
  
  // Fill form
  await page.fill('input[name="name"]', 'John Doe')
  await page.fill('input[name="email"]', 'john@example.com')
  await page.fill('textarea[name="message"]', 'Test message')
  
  // Submit
  await page.click('button[type="submit"]')
  
  // Check success message
  await expect(page.locator('.success-message')).toBeVisible()
})
```

#### API Tests
Test backend endpoints.

```typescript
// server/__tests__/api/news.test.ts
import request from 'supertest'
import app from '../../index'

describe('News API', () => {
  it('GET /api/news returns news list', async () => {
    const response = await request(app)
      .get('/api/news')
      .expect(200)
    
    expect(response.body).toHaveProperty('news')
    expect(Array.isArray(response.body.news)).toBe(true)
  })
  
  it('POST /api/news creates new article', async () => {
    const newArticle = {
      title: 'Test Article',
      content: 'Test content'
    }
    
    const response = await request(app)
      .post('/api/news')
      .send(newArticle)
      .expect(201)
    
    expect(response.body).toHaveProperty('id')
  })
})
```

### Test Coverage Goals

| Type | Target Coverage |
|------|----------------|
| Unit Tests | 80%+ |
| Integration Tests | 60%+ |
| E2E Tests | Critical paths |

### Running Tests

Add to `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

Run tests:
```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Testing Best Practices

1. **Write tests first** (TDD) when possible
2. **Test behavior, not implementation**
3. **Keep tests simple and focused**
4. **Use descriptive test names**
5. **Mock external dependencies**
6. **Test edge cases and errors**
7. **Maintain test independence**
8. **Keep tests fast**

### Continuous Integration

Tests should run automatically on every push:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 🔄 CI/CD Pipeline (TODO)

Automate testing, building, and deployment with GitHub Actions.

### Continuous Integration

**Test Pipeline** (`.github/workflows/test.yml`):

```yaml
name: Test & Lint

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Check TypeScript
        run: npx tsc --noEmit

  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [lint, test]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Next.js app
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: .next/
```

### Continuous Deployment

**Deploy to Vercel** (`.github/workflows/deploy-vercel.yml`):

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**Deploy to GitHub Pages** (`.github/workflows/deploy-pages.yml`):

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build with Next.js
        run: npm run build
      
      - name: Export static site
        run: npm run export
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v3
```

**Deploy to Render** (`.github/workflows/deploy-render.yml`):

```yaml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Trigger Render deployment
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### Security Scanning

**Dependency Check** (`.github/workflows/security.yml`):

```yaml
name: Security Scan

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday

jobs:
  security:
    name: Security Audit
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Secrets Configuration

Add these secrets in GitHub repository settings (Settings → Secrets and variables → Actions):

| Secret | Description |
|--------|-------------|
| `CODECOV_TOKEN` | Code coverage reporting |
| `VERCEL_TOKEN` | Vercel deployment token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `RENDER_DEPLOY_HOOK` | Render webhook URL |
| `SNYK_TOKEN` | Security scanning token |
| `DATABASE_URL` | Production database URL |
| `JWT_SECRET` | JWT signing secret |

### Branch Protection Rules

Configure in GitHub repository settings (Settings → Branches):

- **Require pull request reviews** before merging
- **Require status checks to pass** (lint, test, build)
- **Require branches to be up to date** before merging
- **Include administrators** in restrictions
- **Require conversation resolution** before merging
- **Require signed commits** (optional)

### Automated Release Notes

```yaml
# .github/workflows/release.yml
name: Create Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
```

### Performance Monitoring

Add Lighthouse CI:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/about
            http://localhost:3000/news
          uploadArtifacts: true
```

## 📦 Dependencies

### Core Framework & Language

| Package | Version | Purpose |
|---------|---------|---------|
| **next** | 15.5.4 | React framework with App Router |
| **react** | 19.1.1 | UI library |
| **react-dom** | 19.1.1 | React DOM renderer |
| **typescript** | 5.9.2 | Type safety and tooling |

### Styling & UI

| Package | Version | Purpose |
|---------|---------|---------|
| **tailwindcss** | 4.1.13 | Utility-first CSS framework |
| **@tailwindcss/postcss** | 4.1.13 | PostCSS plugin for Tailwind v4 |
| **postcss** | 8.5.6 | CSS transformation |
| **autoprefixer** | 10.4.21 | CSS vendor prefixing |
| **framer-motion** | 12.23.22 | Animation library |
| **lucide-react** | 0.544.0 | Icon library |
| **react-icons** | 5.5.0 | Additional icon sets |

### UI Components

| Package | Version | Purpose |
|---------|---------|---------|
| **@radix-ui/react-dialog** | 1.1.15 | Accessible modal dialogs |
| **@radix-ui/react-dropdown-menu** | 2.1.16 | Dropdown menus |
| **@radix-ui/react-label** | 2.1.7 | Form labels |
| **@radix-ui/react-slot** | 1.2.3 | Component composition |
| **next-themes** | 0.4.6 | Dark/light mode theming |

### Forms & Validation

| Package | Version | Purpose |
|---------|---------|---------|
| **react-hook-form** | 7.63.0 | Form management |
| **@hookform/resolvers** | 5.2.2 | Validation resolver |
| **zod** | 4.1.11 | Schema validation |

### Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| **clsx** | 2.1.1 | Conditional className helper |
| **tailwind-merge** | 3.3.1 | Merge Tailwind classes |
| **class-variance-authority** | 0.7.1 | CSS variant utilities |
| **axios** | 1.12.2 | HTTP client |

### Backend (Planned)

| Package | Version | Purpose |
|---------|---------|---------|
| **express** | 5.1.0 | Node.js web framework |
| **cors** | 2.8.5 | CORS middleware |
| **dotenv** | 17.2.3 | Environment variables |
| **bcryptjs** | 3.0.2 | Password hashing |
| **jsonwebtoken** | 9.0.2 | JWT authentication |

### Database

| Package | Version | Purpose |
|---------|---------|---------|
| **@prisma/client** | 6.16.3 | Prisma client |
| **prisma** | 6.16.3 | Prisma CLI and migrations |
| **pg** | 8.16.3 | PostgreSQL client |
| **sequelize** | 6.37.7 | Alternative ORM |
| **@supabase/supabase-js** | 2.58.0 | Supabase client |

### Development Tools

| Package | Version | Purpose |
|---------|---------|---------|
| **concurrently** | 9.2.1 | Run multiple commands |
| **tsx** | 4.20.6 | TypeScript execution |
| **@types/node** | 24.6.0 | Node.js type definitions |
| **@types/react** | 19.1.16 | React type definitions |
| **@types/react-dom** | 19.1.9 | React DOM type definitions |
| **@types/express** | 5.0.3 | Express type definitions |
| **@types/cors** | 2.8.19 | CORS type definitions |
| **@types/jsonwebtoken** | 9.0.10 | JWT type definitions |
| **@types/bcryptjs** | 3.0.0 | Bcrypt type definitions |

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update to latest versions (respecting semver)
npm update

# Update to latest versions (including breaking changes)
npm install package@latest

# Security audit
npm audit

# Fix security vulnerabilities automatically
npm audit fix
```

### Dependency Management Best Practices

1. **Regular Updates**: Update dependencies monthly
2. **Security Audits**: Run `npm audit` before each release
3. **Version Pinning**: Use exact versions for critical packages
4. **Minimize Dependencies**: Only add what's necessary
5. **Check Bundle Size**: Use `next-bundle-analyzer` to monitor size
6. **License Compliance**: Ensure all dependencies have compatible licenses

## 🤝 Contributing

We welcome contributions from developers, designers, and content creators! Whether you're fixing bugs, adding features, improving documentation, or suggesting ideas, your help is appreciated.

### Quick Start for Contributors

1. **Read the Guidelines**: Review [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed instructions
2. **Check Issues**: Look for issues labeled `good first issue` or `help wanted`
3. **Fork & Clone**: Fork the repository and clone it locally
4. **Create Branch**: Make a feature branch from `main`
5. **Make Changes**: Follow our coding standards (see [CLAUDE.md](./CLAUDE.md))
6. **Test Thoroughly**: Test your changes on multiple devices and browsers
7. **Submit PR**: Open a pull request with a clear description

### Development Standards

**All contributions must meet these requirements:**

- ✅ **Theme Support**: Light and dark mode compatibility
- ✅ **Mobile Responsive**: Works on all screen sizes (320px+)
- ✅ **Accessible**: WCAG 2.1 AA compliant
- ✅ **SEO Optimized**: Proper meta tags and semantic HTML
- ✅ **Secure**: No security vulnerabilities or exposed secrets
- ✅ **Well Documented**: Code comments and documentation updates
- ✅ **Kenya Themed**: Uses Kenya flag colors and cultural elements

### Code Review Process

1. Automated checks run (linting, tests, build)
2. At least one maintainer reviews the code
3. Feedback is provided for improvements
4. Once approved, PR is merged by maintainers

### Ways to Contribute

- 🐛 **Report Bugs**: Create detailed bug reports
- 💡 **Suggest Features**: Propose new ideas and enhancements
- 📝 **Improve Documentation**: Fix typos, add examples, clarify instructions
- 🎨 **Design**: Create mockups, improve UI/UX
- 💻 **Write Code**: Implement features, fix bugs
- 🧪 **Test**: Help test new features and report issues
- 🌍 **Translate**: Help translate content (future)

### Priority Areas

We especially need help with:

1. **TODO Pages**: Join, Support, Contact, Resources pages
2. **Backend Implementation**: API endpoints and database setup
3. **Testing**: Unit tests, integration tests, E2E tests
4. **Accessibility**: Screen reader improvements
5. **Performance**: Image optimization, code splitting
6. **Documentation**: API docs, tutorials, examples

### Getting Help

- 📧 **Email**: info@firstglobalkenya.org
- 💬 **Issues**: Ask questions by creating an issue
- 📖 **Documentation**: Check README.md and CONTRIBUTING.md

### Code of Conduct

We are committed to fostering an inclusive and respectful community. Please:

- Be respectful and welcoming to all contributors
- Use inclusive language
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

**For full details, see [CONTRIBUTING.md](./CONTRIBUTING.md)**

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

✅ **You can**:
- Use the code commercially
- Modify the source code
- Distribute the code
- Use it privately

❌ **You cannot**:
- Hold the authors liable
- Use trademarks without permission

📋 **You must**:
- Include the original license and copyright notice

## 📞 Support & Contact

### Get in Touch

- **📧 Email**: info@firstglobalkenya.org
- **🐦 Twitter**: [@FGCKenya](https://twitter.com/FGCKenya)
- **🌐 Website**: [firstglobalkenya.org](https://firstglobalkenya.org)
- **💼 LinkedIn**: [FIRST Global Team Kenya](https://linkedin.com/company/firstglobalkenya)

### For Contributors

- **🐛 Report Bugs**: [Create an issue](https://github.com/KristianHans04/FGC_Kenya/issues/new?template=bug_report.md)
- **💡 Request Features**: [Create an issue](https://github.com/KristianHans04/FGC_Kenya/issues/new?template=feature_request.md)
- **💬 Ask Questions**: [Discussions](https://github.com/KristianHans04/FGC_Kenya/discussions)
- **🔒 Security Issues**: security@firstglobalkenya.org (private)

### For Students & Parents

- **Join the Team**: Visit `/join` page (when complete)
- **Support the Team**: Visit `/support` page (when complete)
- **Learn More**: Visit `/about` page

## 🎉 Acknowledgments

This project wouldn't be possible without:

### Organizations
- **[FIRST Global](https://first.global/)**: For organizing the international robotics competition
- **Kenya Ministry of Education**: Supporting STEM education initiatives
- **Corporate Sponsors**: Companies supporting Team Kenya (list on `/support` page)

### People
- **Team Kenya Mentors**: Dedicated educators guiding our students
- **Volunteers**: Community members contributing time and expertise
- **Student Participants**: Past and present team members representing Kenya
- **Parents & Guardians**: Supporting students' STEM education journey

### Open Source Community
- **[Next.js Team](https://nextjs.org/)**: For the amazing React framework
- **[Vercel](https://vercel.com/)**: Deployment platform and Next.js creators
- **[Tailwind CSS](https://tailwindcss.com/)**: Beautiful utility-first CSS framework
- **All Contributors**: Everyone who has contributed code, design, or documentation

### Special Thanks
- GitHub Copilot for development assistance
- Claude AI for coding guidance and documentation help
- The global FIRST community for inspiration and support

---

## 🚀 Project Status

![Build Status](https://img.shields.io/github/actions/workflow/status/KristianHans04/FGC_Kenya/test.yml?branch=main)
![License](https://img.shields.io/github/license/KristianHans04/FGC_Kenya)
![Last Commit](https://img.shields.io/github/last-commit/KristianHans04/FGC_Kenya)
![Issues](https://img.shields.io/github/issues/KristianHans04/FGC_Kenya)
![Pull Requests](https://img.shields.io/github/issues-pr/KristianHans04/FGC_Kenya)

### Current Version: 1.0.0-beta

**Status**: Active Development 🚧

- **Completed Pages**: Homepage, About, News, Impact
- **In Progress**: Join, Support, Contact, Resources pages
- **Planned**: Backend API, Database integration, Testing suite

### Roadmap

- **Q1 2025**: Complete all TODO pages, implement backend
- **Q2 2025**: Add testing suite, improve SEO
- **Q3 2025**: Launch CMS, add authentication
- **Q4 2025**: Performance optimization, PWA features

---

<div align="center">

**Built with ❤️ in Kenya 🇰🇪**

*Inspiring the next generation of Kenyan innovators through STEM education*

[Website](https://firstglobalkenya.org) • [Twitter](https://twitter.com/FGCKenya) • [GitHub](https://github.com/KristianHans04/FGC_Kenya)

**⭐ Star this project if you find it helpful!**

</div>