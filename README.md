# FIRST Global Team Kenya Website

A modern, responsive website for FIRST Global Team Kenya, featuring both full-stack and static versions.

## 🇰🇪 Project Overview

This website represents Kenya's national team in the FIRST Global Challenge robotics competition. It features:
- **Kenyan Identity**: Colors from the Kenyan flag (black, red, green, white) with African design patterns
- **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind CSS, Node.js, PostgreSQL
- **Dual Deployment**: Full-stack version with backend APIs and static version for GitHub Pages
- **Dark/Light Mode**: Built-in theme switching
- **SEO Optimized**: Meta tags, structured data, and performance optimizations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL (for full-stack version)
- Git

### Installation

```bash
# Clone the repository
git clone [your-repo-url]
cd fgc-kenya

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your database credentials

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the website.

## 📁 Project Structure

```
fgc-kenya/
├── app/                    # Next.js App Router pages and components
│   ├── components/         # Reusable React components
│   │   ├── Header.tsx     # Navigation header
│   │   ├── Footer.tsx     # Site footer
│   │   ├── ThemeProvider.tsx  # Dark/light mode provider
│   │   └── ThemeToggle.tsx    # Theme switch button
│   ├── about/             # About Team Kenya page
│   ├── news/              # News & Updates section
│   ├── impact/            # Impact Stories page
│   ├── join/              # How to Join page (TODO)
│   ├── support/           # Support & Donations page (TODO)
│   ├── contact/           # Contact Us page (TODO)
│   ├── resources/         # Resources page (TODO)
│   ├── lib/               # Utility functions
│   ├── styles/            # Additional styles
│   └── layout.tsx         # Root layout
├── server/                # Backend API (TODO)
│   ├── api/              # API endpoints
│   ├── controllers/      # Request handlers
│   ├── models/           # Database models
│   ├── routes/           # Route definitions
│   └── middleware/       # Express middleware
├── public/               # Static assets
│   └── images/           # Image files
└── prisma/               # Database schema (TODO)
```

## 🎨 Design System

### Colors
- **Primary (Kenya Green)**: `#006600`
- **Secondary (Kenya Red)**: `#BB0000`
- **Accent (Gold)**: `#FFD700`
- **Kenya Black**: `#000000`
- **Kenya White**: `#FFFFFF`

### Typography
- **Headings**: Poppins font
- **Body**: Inter font

### Components
All components use Tailwind CSS with custom utility classes defined in `globals.css`.

## 📄 Pages Status

### ✅ Completed
- **Homepage** (`/`): Hero section, stats, journey timeline, CTAs
- **About** (`/about`): Mission, vision, competition history, achievements
- **News** (`/news`): News grid with filtering and search
- **Impact** (`/impact`): Success stories, metrics, outreach programs

### 🚧 TODO Pages

#### 1. Join Page (`/join`)
Create a page with:
- Application form for students
- Eligibility requirements
- Timeline and deadlines
- Volunteer opportunities
- FAQ section

#### 2. Support Page (`/support`)
Create a page with:
- Donation options (one-time, recurring)
- Sponsorship tiers
- Impact of donations
- Payment integration placeholder
- Donor recognition

#### 3. Contact Page (`/contact`)
Create a page with:
- Contact form with validation
- Office location map
- Social media links
- Response time expectations
- FAQ section

#### 4. Resources Page (`/resources`)
Create a page with:
- FIRST Global official links
- Learning materials
- Past competition videos
- Technical resources
- Workshop schedules

## 🔧 Backend Implementation (TODO)

### 1. Database Setup
```bash
# Install Prisma
npm install @prisma/client prisma

# Initialize Prisma
npx prisma init

# Create schema in prisma/schema.prisma
# Run migrations
npx prisma migrate dev
```

### 2. API Endpoints Needed
- `/api/news` - CRUD for news articles
- `/api/stories` - Impact stories management
- `/api/applications` - Student applications
- `/api/donations` - Donation processing
- `/api/contact` - Contact form submissions
- `/api/auth` - Authentication endpoints

### 3. Server Setup
Create `server/index.js`:
```javascript
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

// Add routes here

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

## 🌐 Static Version for GitHub Pages

### Creating Static Export
```bash
# Update next.config.mjs for static export
# output: 'export'

# Build static version
npm run build
npm run export

# Files will be in 'out' directory
```

### GitHub Pages Deployment
1. Create `gh-pages` branch
2. Copy static files to branch
3. Enable GitHub Pages in repository settings
4. Set custom domain if available

## 🚀 Deployment

### Full-Stack Deployment (Render)
1. Create account on Render.com
2. Connect GitHub repository
3. Configure build command: `npm run build`
4. Configure start command: `npm start`
5. Add environment variables
6. Deploy

### Database (PostgreSQL)
- Use Render's PostgreSQL service
- Or use Supabase/Neon for free tier

## 🔒 Security Considerations

### Implemented
- Environment variables for secrets
- HTTPS enforcement ready
- Input sanitization placeholders
- CORS configuration

### TODO
- Rate limiting on API endpoints
- CAPTCHA on forms
- SQL injection prevention
- XSS protection
- CSRF tokens
- Authentication & authorization

## 🎯 SEO & Performance

### Implemented
- Meta tags and Open Graph
- Semantic HTML
- Image lazy loading
- Code splitting
- Dark mode support

### TODO
- Add sitemap.xml
- Add robots.txt
- Implement image optimization
- Add structured data (JSON-LD)
- Implement PWA features

## 📝 Content Management

Currently, content is hardcoded. Future improvements:
1. Implement CMS (Strapi, Sanity, or custom)
2. Create admin panel for content updates
3. Add markdown support for blog posts
4. Implement draft/publish workflow

## 🧪 Testing (TODO)

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Add test scripts to package.json
# Create test files
# Run tests
npm test
```

## 🔄 CI/CD Pipeline (TODO)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - run: npm test
      # Add deployment steps
```

## 📦 Dependencies

### Core
- Next.js 15 - React framework
- React 19 - UI library
- TypeScript - Type safety
- Tailwind CSS - Styling

### UI/UX
- Framer Motion - Animations
- Lucide React - Icons
- Radix UI - Accessible components
- next-themes - Dark mode

### Backend (when implemented)
- Express - Node.js framework
- PostgreSQL - Database
- Sequelize/Prisma - ORM
- JWT - Authentication

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions or support, contact:
- Email: info@firstglobalkenya.org
- Twitter: @FGCKenya
- Website: https://firstglobalkenya.org

## 🎉 Acknowledgments

- FIRST Global organization
- Team Kenya mentors and volunteers
- Supporting partners and sponsors
- All student participants