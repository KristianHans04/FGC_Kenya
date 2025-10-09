# Contributing to FIRST Global Team Kenya Website

Welcome! 🇰🇪 We're excited that you're interested in contributing to the FIRST Global Team Kenya website. This document will guide you through the contribution process.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Issue Reporting](#issue-reporting)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## 🤝 Code of Conduct

### Our Standards

We are committed to providing a welcoming and inspiring community for all. We expect all contributors to:

- **Be Respectful**: Treat everyone with respect. Embrace diverse perspectives and experiences.
- **Be Collaborative**: Work together constructively. Help others and ask for help when needed.
- **Be Professional**: Focus on what's best for the community and the project.
- **Be Inclusive**: Welcome newcomers and encourage diverse participation.

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Any conduct inappropriate in a professional setting

If you experience or witness unacceptable behavior, please contact the project maintainers at info@firstglobalkenya.org.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** (optional, for full-stack development) ([Download](https://www.postgresql.org/))
- A code editor (we recommend [VS Code](https://code.visualstudio.com/))

### Setting Up Your Development Environment

1. **Fork the Repository**
   
   Visit the [FGC_Kenya repository](https://github.com/KristianHans04/FGC_Kenya) and click the "Fork" button in the top right.

2. **Clone Your Fork**
   
   ```bash
   git clone https://github.com/YOUR_USERNAME/FGC_Kenya.git
   cd FGC_Kenya
   ```

3. **Add Upstream Remote**
   
   ```bash
   git remote add upstream https://github.com/KristianHans04/FGC_Kenya.git
   ```

4. **Install Dependencies**
   
   ```bash
   npm install
   ```

5. **Set Up Environment Variables**
   
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your local configuration. **Never commit this file!**

6. **Run the Development Server**
   
   ```bash
   npm run dev
   ```
   
   Visit `http://localhost:3000` to see the website.

### Understanding the Project Structure

```
FGC_Kenya/
├── app/                    # Next.js App Router
│   ├── components/         # Reusable React components
│   ├── lib/               # Utility functions
│   ├── about/             # About page
│   ├── news/              # News page
│   ├── impact/            # Impact stories page
│   ├── join/              # Join page (TODO)
│   ├── support/           # Support page (TODO)
│   ├── contact/           # Contact page (TODO)
│   ├── resources/         # Resources page (TODO)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles & Kenya theme
├── server/                # Express backend (TODO)
├── prisma/                # Database schema
├── public/                # Static assets
│   └── images/           # Image files
├── .github/              # GitHub configuration
├── CLAUDE.md             # AI coding guidelines
├── CONTRIBUTING.md       # This file
└── README.md             # Project documentation
```

## 🔄 Development Workflow

### Branching Strategy

We use a simplified Git Flow:

- **`main`**: Production-ready code
- **Feature branches**: `feature/your-feature-name`
- **Bug fix branches**: `fix/bug-description`
- **Documentation branches**: `docs/what-you-changed`

### Creating a Feature Branch

```bash
# Make sure you're on main and it's up to date
git checkout main
git pull upstream main

# Create a new branch
git checkout -b feature/your-feature-name
```

### Keeping Your Branch Updated

```bash
# Fetch upstream changes
git fetch upstream

# Rebase your branch on upstream/main
git rebase upstream/main

# If there are conflicts, resolve them and continue
git rebase --continue
```

## 📝 Coding Standards

We follow strict coding standards to maintain code quality. Please review [CLAUDE.md](./CLAUDE.md) for comprehensive guidelines. Here are the key points:

### General Principles

1. **Write Clean, Readable Code**: Use descriptive variable names and keep functions small and focused.
2. **Follow TypeScript Best Practices**: Use proper typing, avoid `any` type when possible.
3. **Component Structure**: One component per file, use functional components with hooks.
4. **Separation of Concerns**: Keep business logic separate from UI components.

### Kenya Theme Requirements

**CRITICAL**: This website represents Kenya's national robotics team. All designs must reflect Kenyan identity:

- **Use Kenya Flag Colors**: 
  - Green (`#006600`), Red (`#BB0000`), Black (`#000000`), White (`#FFFFFF`), Gold accent (`#FFD700`)
- **Typography**: Poppins for headings, Inter for body text
- **Design Elements**: Incorporate African patterns and Kenyan cultural elements appropriately

### Theme Support (MANDATORY)

**EVERY component must support both light and dark modes:**

```tsx
'use client'
import { useTheme } from 'next-themes'

export function YourComponent() {
  const { theme } = useTheme()
  
  return (
    <div className="bg-background text-foreground dark:bg-card dark:text-card-foreground">
      {/* Your content */}
    </div>
  )
}
```

### Mobile Responsiveness (MANDATORY)

**ALL components must be mobile-first and responsive:**

```tsx
<div className="
  grid grid-cols-1           /* Mobile: 1 column */
  md:grid-cols-2            /* Tablet: 2 columns */
  lg:grid-cols-3            /* Desktop: 3 columns */
  gap-4 md:gap-6 lg:gap-8   /* Responsive gaps */
">
  {/* Content */}
</div>
```

Test on multiple viewport sizes: 320px, 768px, 1024px, 1440px

### Security (MANDATORY)

**ALWAYS implement these security measures:**

- **Input Validation**: Sanitize and validate ALL user inputs
- **Environment Variables**: NEVER expose API keys or secrets in code
- **SQL Injection Prevention**: Use parameterized queries (Prisma/Sequelize)
- **XSS Prevention**: Sanitize HTML output
- **CSRF Protection**: Implement CSRF tokens for state-changing operations
- **Authentication**: Use JWT with secure httpOnly cookies
- **Rate Limiting**: Implement on all API endpoints

### Accessibility (WCAG 2.1 AA)

**Required for all components:**

- **Alt Text**: Descriptive alt attributes for ALL images
- **ARIA Labels**: Use `aria-label`, `aria-describedby` where needed
- **Keyboard Navigation**: All interactive elements must be keyboard accessible
- **Color Contrast**: Maintain 4.5:1 ratio for normal text, 3:1 for large text
- **Focus Indicators**: Visible focus states for all interactive elements

Example:
```tsx
<button 
  aria-label="Open navigation menu"
  className="focus:ring-2 focus:ring-primary focus:outline-none"
>
  <Menu aria-hidden="true" />
</button>
```

### SEO Optimization (Target: 95%+ Lighthouse)

**Every page must include:**

```tsx
export const metadata: Metadata = {
  title: "Page Title - FIRST Global Team Kenya",
  description: "Descriptive 150-160 character summary",
  keywords: "relevant, kenyan, robotics, keywords",
  openGraph: {
    title: "Social media optimized title",
    description: "Social description",
    images: [{ 
      url: "/images/og-page.jpg", 
      width: 1200, 
      height: 630 
    }]
  }
}
```

### Documentation Requirements

**All code must be well-documented:**

```typescript
/**
 * Calculates the total donation amount including processing fees
 * @param amount - Base donation amount in KES
 * @param feeRate - Processing fee rate (0.0-1.0)
 * @returns Total amount including fees
 */
export function calculateTotal(amount: number, feeRate: number): number {
  // Implementation
}
```

### Code Style

- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Single quotes for strings (except JSX attributes)
- **Semicolons**: Use semicolons
- **Naming Conventions**:
  - Components: `PascalCase`
  - Functions: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Files: `PascalCase` for components, `kebab-case` for utilities

### File Organization

```
app/
├── components/         # Shared components
├── lib/               # Utility functions
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── [route]/          # Page-specific components
    └── page.tsx
```

## 🐛 Issue Reporting

### Before Creating an Issue

1. **Search Existing Issues**: Check if the issue already exists
2. **Check Documentation**: Review README.md and CLAUDE.md
3. **Verify the Bug**: Ensure you can reproduce the issue

### Creating a Good Issue

Use our issue templates when available. Include:

- **Clear Title**: Descriptive and specific
- **Description**: What happened vs. what you expected
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Environment**: 
  - OS (Windows, macOS, Linux)
  - Node.js version
  - Browser (if frontend issue)
- **Screenshots**: If applicable
- **Proposed Solution**: If you have ideas

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `priority: high`: Urgent issues
- `priority: low`: Nice to have

## 🔀 Pull Request Process

### Before Submitting a PR

1. **Ensure Your Branch is Updated**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run Tests** (when available)
   ```bash
   npm test
   ```

3. **Lint Your Code**
   ```bash
   npm run lint
   ```

4. **Build Successfully**
   ```bash
   npm run build
   ```

5. **Test Manually**: Verify your changes work as expected in the browser

### PR Title Format

Use conventional commit format:

- `feat: Add student application form to join page`
- `fix: Correct theme toggle behavior on mobile`
- `docs: Update contributing guidelines`
- `style: Format code in Header component`
- `refactor: Restructure news page components`
- `test: Add tests for donation calculator`
- `chore: Update dependencies`

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Changes Made
- List specific changes
- Be detailed and clear

## Testing
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on mobile devices
- [ ] Tests pass locally
- [ ] Build succeeds

## Screenshots (if applicable)
Add screenshots to show visual changes

## Related Issues
Closes #123 (if applicable)

## Checklist
- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Theme support (light/dark mode) is implemented
- [ ] Mobile responsiveness is verified
- [ ] Accessibility requirements are met (WCAG 2.1 AA)
- [ ] SEO meta tags are included
- [ ] Security considerations are addressed
```

### Review Process

1. **Automated Checks**: CI/CD will run linting and tests
2. **Code Review**: At least one maintainer will review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, your PR will be merged

### After Your PR is Merged

1. **Delete Your Branch**
   ```bash
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

2. **Update Your Fork**
   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

## 🧪 Testing Guidelines

### Manual Testing

Since automated tests are not yet implemented, thorough manual testing is crucial:

1. **Functionality Testing**: Verify all features work as intended
2. **Browser Testing**: Test on Chrome, Firefox, Safari, Edge
3. **Device Testing**: Test on desktop, tablet, and mobile
4. **Theme Testing**: Verify both light and dark modes
5. **Accessibility Testing**: 
   - Use keyboard navigation
   - Test with screen readers (NVDA, JAWS, VoiceOver)
   - Check color contrast
6. **Performance Testing**: Run Lighthouse audits (target 95%+)

### Future: Automated Testing

When tests are added, follow these guidelines:

```typescript
// Example test structure
describe('DonationForm', () => {
  it('should calculate total with processing fees', () => {
    // Test implementation
  })
  
  it('should validate email format', () => {
    // Test implementation
  })
})
```

## 📚 Documentation

### When to Update Documentation

Update documentation when you:

- Add new features
- Change existing functionality
- Add new dependencies
- Modify environment variables
- Update setup/installation process

### Documentation Files

- **README.md**: Project overview, setup, and general information
- **CONTRIBUTING.md**: This file - contribution guidelines
- **CLAUDE.md**: AI coding guidelines and standards
- **Code Comments**: In-code documentation for complex logic

### Writing Good Documentation

- **Be Clear and Concise**: Use simple language
- **Use Examples**: Show, don't just tell
- **Keep it Updated**: Documentation should always reflect the current state
- **Use Proper Formatting**: Follow markdown best practices

## 🌍 Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **Pull Requests**: Code contributions and discussions
- **Email**: info@firstglobalkenya.org for general inquiries
- **Twitter**: [@FGCKenya](https://twitter.com/FGCKenya)
- **Website**: [firstglobalkenya.org](https://firstglobalkenya.org)

### Getting Help

If you need help:

1. **Check Documentation**: README.md and CLAUDE.md
2. **Search Issues**: Someone may have had the same question
3. **Ask Questions**: Create a new issue with the `question` label
4. **Contact Maintainers**: Email info@firstglobalkenya.org

### Recognition

We appreciate all contributions! Contributors will be:

- Listed in the project's acknowledgments
- Credited in release notes for significant contributions
- Recognized in the community

## 🎯 Priority Areas

We especially welcome contributions in these areas:

### High Priority
- **TODO Pages**: Join, Support, Contact, Resources pages
- **Backend API**: Express server implementation
- **Database Setup**: Prisma migrations and models
- **Authentication System**: User login and authorization
- **Testing**: Unit tests, integration tests, E2E tests

### Medium Priority
- **SEO Improvements**: Sitemap, robots.txt, structured data
- **Performance Optimization**: Image optimization, code splitting
- **Accessibility Enhancements**: Screen reader improvements
- **Documentation**: API documentation, more examples

### Nice to Have
- **CMS Integration**: Content management system
- **Payment Integration**: Donation processing
- **Analytics**: User behavior tracking
- **PWA Features**: Offline support, push notifications

## 📜 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Thank you for contributing to FIRST Global Team Kenya! Your efforts help inspire the next generation of Kenyan innovators and engineers. Together, we're building something meaningful for Kenya's STEM education community.

---

**Questions?** Don't hesitate to reach out at info@firstglobalkenya.org

**Happy coding! 🚀🇰🇪**
