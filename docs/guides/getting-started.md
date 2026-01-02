# Getting Started

This guide covers the complete setup and installation process for the FIRST Global Team Kenya website.

## Prerequisites

- **Node.js 18+**: Required for Next.js 15
- **PostgreSQL**: Database for full-stack version (Supabase recommended for development)
- **Git**: Version control
- **npm or yarn**: Package manager

## Installation Options

### Automated Setup (Recommended)

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

### Manual Setup

```bash
# Clone the repository
git clone [your-repo-url]
cd fgc-kenya

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database and email credentials

# Set up database
npx prisma generate
npx prisma db push
npm run db:seed

# Start development
npm run dev:full
```

## Development Environment

### Quick Start (Single Command)
```bash
npm run dev
```
This starts the Next.js development server on http://localhost:3000.

### Full Development Setup
For the complete development experience with email testing:

**Terminal 1 - Next.js Application:**
```bash
npm run dev:next
# Application runs on http://localhost:3000
```

**Terminal 2 - Email Testing:**
```bash
npm run maildev:dev
# Email testing interface at http://localhost:1080
```

**Available Services:**
- Frontend Application: http://localhost:3000
- Email Testing Interface: http://localhost:1080 (when Maildev is running)
- Admin Login: admin@example.com (OTP sent to email)

## Environment Configuration

Copy `.env.example` to `.env.local` and configure:

### Database (Required)
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/fgc_kenya"
```

### Authentication (Required)
```bash
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-refresh-token-secret-change-this-in-production"
```

### Email Configuration (Required for OTP)
For local development (recommended):
```bash
EMAIL_HOST=localhost
EMAIL_PORT=1025
EMAIL_USER=""
EMAIL_PASS=""
```

For production (Gmail example):
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

### Admin Notifications (Optional)
```bash
ADMIN_NOTIFICATION_EMAILS="admin@example.com,another-admin@example.com"
```

## Email Testing

For local development, emails are intercepted by Maildev:
- Web Interface: http://localhost:1080
- SMTP Server: localhost:1025
- All emails sent by the application will appear in Maildev instead of being delivered

## Additional Commands

```bash
# Start only Next.js (without Maildev)
npm run dev:next

# Run tests
npm test

# Run database migrations
npx prisma db push

# Seed database with sample data (includes admin@example.com)
npm run db:seed
```

## Database Setup

### Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed database with initial data
npm run db:seed
```

### Database Configuration
The system uses PostgreSQL with Prisma ORM. For development, we recommend using Supabase for easy setup.

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify DATABASE_URL in .env.local
   - Ensure PostgreSQL is running
   - Check database credentials

2. **Email Not Working**
   - For development, ensure Maildev is running on port 1080
   - Check EMAIL_* variables in .env.local

3. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check Node.js version (must be 18+)

4. **TypeScript Errors**
   - Run `npm run build` to check for type errors
   - Ensure all imports are correct

### Getting Help

If you encounter issues:
1. Check the [Development Guide](development.md) for detailed information
2. Review the [Application System](application-system.md) documentation
3. Check existing GitHub issues
4. Contact the development team

## Next Steps

Once setup is complete:
1. Visit http://localhost:3000 to see the website
2. Explore the [Application System](application-system.md) features
3. Review the [API Documentation](api.md) for backend integration
4. Check the [Development Guide](development.md) for coding standards