# FIRST Global Team Kenya Website

A modern, responsive website for FIRST Global Team Kenya, featuring both full-stack and static versions.

## Project Overview

This website represents Kenya's national team in the FIRST Global Challenge robotics competition. It features:
- Kenyan Identity: Colors from the Kenyan flag (black, red, green, white) with African design patterns
- Modern Tech Stack: Next.js 15, TypeScript, Tailwind CSS, Node.js, PostgreSQL
- Dual Deployment: Full-stack version with backend APIs and static version for GitHub Pages
- Dark/Light Mode: Built-in theme switching
- SEO Optimized: Meta tags, structured data, and performance optimizations
- 2026 Season Application System: Complete backend for student applications, admin review, and OTP authentication

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (for full-stack version)
- Git

### Installation
```bash
# Clone the repository
git clone [your-repo-url]
cd fgc-kenya

# Run complete setup (installs deps, sets up database, seeds data)
npm run setup

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials

# Start development
npm run dev:full
```

Visit `http://localhost:3000` to see the website.

## Documentation

### Getting Started
- [Setup Guide](docs/guides/getting-started.md) - How to run the application locally

### Features
- [Authentication](docs/guides/features/authentication.md) - Login and user management
- [Applications](docs/guides/features/application-system.md) - Student application process
- [Dashboard](docs/guides/features/dashboard.md) - User interface overview
- [Admin Panel](docs/guides/features/admin-panel.md) - Administrative tools
- [File Upload](docs/guides/features/file-upload.md) - Document management
- [Email System](docs/guides/features/email-system.md) - Automated communications

### Technical
- [API Overview](docs/api/overview.md) - API information for developers
- [Development](docs/guides/development.md) - Project structure and coding standards
- [Design System](docs/guides/design-system.md) - UI components and styling
- [Security](docs/security/overview.md) - Security features and best practices
- [Deployment](docs/guides/deployment.md) - Hosting and deployment
- [Contributing](docs/contributing/contributing.md) - How to contribute

### Advanced
- [Architecture](docs/guides/architecture.md) - System architecture overview
- [Development](docs/guides/development.md) - Project structure and coding standards
- [Tailwind Theming](docs/guides/tailwind-v4-theming.md) - Theming guide for Tailwind CSS

## Features

### 2026 Season Application System
- OTP Email Authentication: Secure login without passwords using email-based OTP
- Student Applications: Complete application form with validation and file uploads
- Admin Dashboard: Review, accept, reject, and shortlist applications
- Email Notifications: Automated emails for all application status changes
- Audit Logging: Complete audit trail of all system actions
- Rate Limiting: Protection against abuse and spam
- Security: Comprehensive security measures and input validation

### Core Features
- Responsive Design: Mobile-first design that works on all devices
- Dark/Light Mode: Automatic theme switching with user preference storage
- SEO Optimization: Optimized for search engines with meta tags and structured data
- Performance: Fast loading with optimized images and code splitting
- Accessibility: WCAG 2.1 AA compliant with proper ARIA labels and keyboard navigation

## Project Structure

```
fgc-kenya/
├── app/                    # Next.js App Router pages and components
│   ├── api/                # API Routes
│   ├── components/         # Reusable React components
│   ├── lib/                # Utility functions
│   └── [pages]/            # Page routes
├── prisma/                 # Database schema
├── public/                 # Static assets
├── docs/                   # Documentation
└── types/                  # TypeScript definitions
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.9
- **UI Framework**: React 19
- **Styling**: Tailwind CSS 4.1
- **Animation**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma 7.2
- **Authentication**: JWT + OTP-based system
- **Email**: Nodemailer

### Infrastructure
- **Deployment**: Vercel (recommended)
- **Database Host**: Supabase
- **CDN**: Cloudflare (optional)

## Support

For questions or support, contact:
- Email: teamkenyarobotics254@gmail.com
- Twitter: @FGCKenya
- Website: https://fgckenya.com

## About

This is the web application for FIRST Global Team Kenya, a robotics team participating in the FIRST Global Challenge. The application handles team applications, member management, and related operations.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.