# development-standards.md

This file contains the comprehensive guidelines for all AI assistants working with code in this repository.

## Critical Development Standards

### 1. Security Best Practices

- **MANDATORY** security measures for every feature:
  - **SQL Injection Prevention:** Use parameterized queries, never string concatenation.
  - **XSS Protection:** Sanitize all user input and escape output.
  - **CSRF Protection:** Implement anti-CSRF tokens in all forms and API requests.
  - **Rate Limiting:** Enforce limits on login (e.g., 5/min) and API access (e.g., 100/hour).
  - **DDoS Protection:** Use request throttling, firewalls, and CAPTCHA for public endpoints.
  - **Input Validation:** Whitelist allowed parameters and enforce data formats.
  - **Authentication:** Secure sessions and account lockout after repeated failures.
  - **Authorization:** Always check user permissions before granting access.
  - **File Upload Security:** Validate file types, scan for malware, and restrict file sizes.
  - **Dependency Security:** Regularly audit dependencies for vulnerabilities.
  - **Content Security Policy (CSP):** Apply strict CSP headers.
  - **Secure Headers:** Implement strict HTTP security headers.
  - **API Security:** Use token-based authentication (e.g., JWT) with expiration and refresh tokens.
  - **Password Security:** Hash and salt all credentials securely.
  - **Sensitive Data Logging:** Exclude sensitive fields from logs.
  - **Session Security:** Set cookies with `secure`, `httpOnly`, and `sameSite` attributes.
  - **Directory Traversal Protection:** Sanitize and validate file paths.
  - **Mass Assignment Protection:** Explicitly control allowed data inputs.
  - **Information Disclosure Prevention:** Use custom error pages; no stack traces in production.
  - **Clickjacking Protection:** Use `X-Frame-Options` or `frame-ancestors` headers.

## Summary of Key Guidelines

Prioritize security with mandatory measures including SQL injection prevention, XSS protection, CSRF tokens, rate limiting, DDoS protection, input validation, secure authentication/authorization, file upload scanning, dependency audits, CSP headers, JWT API security, password hashing, session cookies, and information disclosure prevention. Manage API keys securely by never committing them, using environment variables, rotating regularly, separating by environment, and enforcing least-privilege access. Protect databases by never destroying data through destructive commands, using safe migrations, backups, soft deletes, and archiving. Enforce mandatory testing with 80% coverage minimum (100% for critical code), unit/integration/functional/security/performance tests, and passing CI/CD with linting, scans, and reversible migrations. Optimize algorithms and data structures for efficiency, using Big O analysis, appropriate structures like HashMap for lookups, and avoiding inefficient nesting. Organize code modularly with ES6+ imports/exports, separate components for modals, files under 1000 lines, code reuse for DRY principles, utility-first CSS, reusable templates, single-responsibility modules, and logical folder/subfolder structures. Maintain documentation in docs/ directory with api/, guides/, architecture/ subfolders, architecture details in PROJECT_ARCHITECTURE.md, and temporary docs in temp_docs/ added to .gitignore. Ensure global website support by avoiding region-specific references like Nigeria, supporting multi-currency/USD primary, international formats/timezones/languages/payment gateways, and neutral examples. Guarantee mobile responsiveness with mobile-first design, responsive frameworks, viewport testing (320px-1440px), 44x44px touch targets, and adaptive images. Achieve WCAG 2.1 AA accessibility with descriptive alt text, labeled forms, clear errors, ARIA labels, 4.5:1 contrast, keyboard navigation, screen reader testing, skip links, lang attributes, focus management, and proper heading hierarchy. Implement light/dark theme support using CSS variables, data-theme attribute, local storage persistence, and consistent component styling. Optimize SEO for 95%+ Lighthouse scores with unique meta tags, semantic HTML, Schema.org markup, lazy/preloaded assets, WebP/AVIF images, critical CSS inlining, deferred JS, compression, cache headers, Core Web Vitals (LCP<2.5s, FID<100ms, CLS<0.1), clean URLs, XML sitemap, robots.txt, and canonical URLs. Avoid bad practices like hardcoding values, relying on auto-incremented IDs/URLs, and using guessable codes/timestamps. Prohibit emojis entirely in UI, data, emails, messages, forms, logs, APIs, SEO, and everywhere else, favoring professional text and SVG/font icons. Follow UI design with the golden 60/30/10 rule allocating 60% to dominant colors, 30% to secondary, and 10% to accents for visual harmony.

### 2. API Keys & Secrets Management

- **NEVER** commit API keys or secrets to repositories.
- Use environment variables or secure key management systems.
- Rotate keys regularly.
- Use separate keys for development, staging, and production.
- Implement least-privilege access (e.g., read-only vs. write).
- Encrypt secrets at rest and in transit.

### 3. Database Protection – NEVER DESTROY DATA

- **NEVER** run destructive database commands such as:
  - Dropping the database.
  - Resetting the database.
  - Reloading schema.
  - Any command that causes data loss.
- **ONLY** use safe migrations or schema updates.
- **ALWAYS** backup before major changes.
- **NEVER** truncate or delete production data.
- If data needs cleanup, use soft deletes or archiving strategies.

### 4. Testing & CI/CD Requirements – MANDATORY

- **MUST** write comprehensive tests for all code:
  - Unit tests for core logic and utilities.
  - Integration tests for APIs and components.
  - Functional tests for user workflows.
  - Security tests for authentication and authorization.
  - Performance tests for critical features.
- **Test Coverage Requirements:**
  - Minimum 80% overall test coverage.
  - 100% for payment and security-critical code.
- Write tests before or alongside implementation.
- **CI/CD Pipeline MUST PASS:**
  - All tests must pass before merging.
  - Code linting and style checks must pass.
  - Security scans for dependencies must pass.
  - Database migrations must be reversible.

### 5. Data Structures & Algorithms (DSA) Best Practices

- **Prioritize Efficiency:** Always consider the time and space complexity of your algorithms. Strive for optimal solutions.
- **Big O Notation:** Understand and use Big O notation to analyze and compare the efficiency of different approaches.
- **Data Structure Selection:** Choose data structures that fit the problem. For example:
  - Use `HashMap` (or `dict` in Python) for fast lookups (O(1) on average).
  - Use `Array` for ordered data with fast index-based access.
  - Use `Set` for storing unique elements and fast membership testing.
  - Use `Queue` for FIFO (First-In, First-Out) processing.
  - Use `Stack` for LIFO (Last-In, First-Out) processing.
- **Algorithm Optimization:**
  - Avoid nested loops that can lead to O(n^2) or worse complexity if a more optimal algorithm exists.
  - Consider trade-offs between time and space complexity. Sometimes, using more memory can lead to a faster algorithm.
  - Use sorting and searching algorithms efficiently.
- **Code Reviews:** During code reviews, pay close attention to the efficiency of the implemented algorithms and data structures.

### 6. Code Organization & Modern Practices

- **JavaScript or Frontend Code:**
  - Use modular architecture (imports/exports).
  - Follow ES6+ syntax and best practices.
  - Avoid inline scripts.
  - Always modularize code, e.g., modals etc. should all be separate components.
  - No individual code files should exceed 1000 lines.
  - Always try to reuse codes where possible to promote DRY (Don't Repeat Yourself) principles.
- **CSS/Styling:**
  - Use utility-first or modular CSS approaches.
  - Keep styles organized by component or feature.
  - Avoid inline styles unless necessary.
- **HTML/Templates:**
  - Use reusable components or partials.
  - No business logic in templates.
  - No emojis in any view.
- **Services/Modules:**
  - Follow the Single Responsibility Principle.
  - Keep clear and well-defined public interfaces.
- **File Organization:**
  - Create folders and subfolders to sort and organize code logically, improving maintainability and navigation.
  - Group related components, utilities, and assets into appropriate directories.

### 7. Documentation Best Practices

- All documentation belongs in a dedicated `docs/` directory.
- Never place documentation files in the project root.
- **Recommended structure:**
  - `docs/` – Main documentation directory.
  - `docs/api/` – API documentation.
  - `docs/guides/` – Development guides.
  - `docs/architecture/` – System architecture documents.
- Architecture details should be stored in `docs/PROJECT_ARCHITECTURE.md`.
- **Temporary documentation** (like project summaries, quick references) should be placed in `temp_docs/` folder which must be added to `.gitignore`.

### 8. Global Website Requirements

- This is a global website — not specific to any country or region.
- **DO NOT** use region-specific references:
  - Never use Nigeria or nigerian stuff as references.
  - Avoid local currencies — support USD or multi-currency.
  - Avoid regional statistics, demographics, or examples.
  - Avoid country-specific phone number formats or addresses as defaults.
- **MUST** support international usage:
  - Multiple currencies with USD as primary.
  - International phone number formats.
  - Global time zones.
  - Multi-language support.
  - International payment gateways.
- Use neutral, global examples and references.

### 9. Mobile Responsiveness

- Every UI component must be mobile-first and responsive.
- Use responsive design techniques or frameworks.
- Test at viewport widths: 320px, 768px, 1024px, 1440px.
- Ensure touch targets are at least 44x44px.
- Use responsive images (`srcset`, `sizes`) and adaptive layouts.

### 10. Accessibility Requirements

- Minimum WCAG 2.1 Level AA compliance.
- **Images:** Provide descriptive `alt` text.
- **Forms:**
  - Use labels for inputs.
  - Display clear error messages.
  - Support keyboard navigation and focus states.
- **ARIA Labels:** Use when necessary for non-semantic elements.
- **Color Contrast:** Minimum 4.5:1 for normal text.
- **Keyboard Navigation:** Ensure all interactive elements are accessible.
- **Screen Reader Support:** Test with screen reader software.
- **Skip Links:** Include "Skip to main content" link.
- **Language Attribute:** Set correct `lang` on the `<html>` element.
- **Focus Management:** Maintain logical tab order and visible focus states.
- **Headings:** Maintain proper hierarchy (no skipped levels).

### 11. Theme Support (Light/Dark Mode)

- All UI components must support both light and dark themes.
- Use CSS variables for colors (e.g., `--color-primary`, `--color-bg`).
- Implement theme switching via a global attribute (e.g., `data-theme`).
- Store user preference in local storage or database.
- Ensure consistent appearance across all components.

### 12. SEO Optimization (Target: 95%+ Lighthouse Score)

- **Meta Tags:** Unique `<title>` and `<description>` for every page.
- **Semantic HTML:** Proper heading hierarchy, use of `<article>`, `<nav>`, `<main>`.
- **Structured Data:** Add Schema.org markup for rich snippets.
- **Performance:**
  - Lazy load images.
  - Preload critical assets.
  - Use modern image formats (WebP, AVIF).
  - Inline critical CSS.
  - Defer non-essential JavaScript.
  - Enable compression (gzip/brotli).
  - Set proper cache headers.
- **Core Web Vitals:**
  - LCP < 2.5s.
  - FID < 100ms.
  - CLS < 0.1.
- **URLs:** Use clean, descriptive slugs.
- **Sitemap:** Generate and maintain XML sitemap.
- **Robots.txt:** Properly configured for search indexing.
- **Canonical URLs:** Set to prevent duplicate content.

### 13. Bad Practices

Avoid these common pitfalls that can compromise security, usability, and maintainability:
- **Never hardcode anything unless required**: Avoid hardcoding values like URLs, API endpoints, configuration settings, or constants directly in code. Use environment variables, configuration files, or constants modules instead to ensure flexibility and maintainability.
- **Never rely on auto-incremented IDs as default identifiers especially for the URLs**: Code always defaults to sequential integer IDs, which can leak information about record counts or creation order. Always implement slugs or UUIDs for public-facing references to prevent enumeration attacks and improve URL readability.
- **Avoid easily guessable or predictable codes**: Do not generate reference numbers or tokens using patterns like timestamps (e.g., YYYYMMDDHHMMSS) or simple sequences, as these can be easily guessed or brute-forced. Use cryptographically secure random generators or UUIDs instead to ensure unpredictability and security.

### 14. No Emojis Policy

- **ABSOLUTELY NO EMOJIS** in any part of the application.
- This applies to:
  - User interfaces, templates, components.
  - Database seeds and sample data.
  - Emails and notifications.
  - Error and success messages.
  - Forms, labels, and placeholders.
  - Console or log messages.
  - API responses and documentation.
  - SEO content and metadata.
- Use clear, professional text only.
- Use SVG or font-based icons, not emoji characters.

### 15. UI Design Rules

- **Always follow the golden UI rule (60/30/10)**: Allocate 60% of the design to the dominant color (usually the background or primary elements), 30% to secondary colors (supporting elements), and 10% to accent colors (highlights, calls-to-action, or emphasis). This creates visual harmony and prevents color overload while maintaining a professional appearance.
- **Avoid stereotypical AI-generated stat cards**: Do not use the common pattern of 4 cards per view displaying stats with generic SVG icons. Stats should be subtle if necessary, often omitted entirely, and when present, integrated discreetly without prominent card layouts.