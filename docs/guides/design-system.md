# Design System

This document outlines the design system, theming, and visual guidelines for the FIRST Global Team Kenya website.

## Design Principles

### Kenyan Identity
- **Colors**: Kenyan flag colors (black, red, green, white)
- **Patterns**: African-inspired geometric patterns
- **Typography**: Clean, modern fonts with cultural sensitivity

### Accessibility
- **WCAG 2.1 AA Compliance**: Minimum accessibility standard
- **Inclusive Design**: Works for all users regardless of ability
- **Mobile-First**: Responsive design starting from mobile

### Performance
- **Fast Loading**: Optimized images and assets
- **Efficient Code**: Minimal CSS and JavaScript
- **SEO Friendly**: Semantic HTML and structured data

## Color Palette

### Primary Colors
```css
--color-primary: #006600;      /* Kenyan Green */
--color-primary-light: #008800; /* Light Green */
--color-secondary: #BB0000;    /* Kenyan Red */
--color-accent: #FFD700;       /* Gold */
```

### Neutral Colors
```css
--color-black: #000000;        /* Kenyan Black */
--color-white: #FFFFFF;        /* Kenyan White */
--color-gray-50: #F9FAFB;      /* Very Light Gray */
--color-gray-100: #F3F4F6;     /* Light Gray */
--color-gray-200: #E5E7EB;     /* Medium Light Gray */
--color-gray-300: #D1D5DB;     /* Light Medium Gray */
--color-gray-400: #9CA3AF;     /* Medium Gray */
--color-gray-500: #6B7280;     /* Dark Medium Gray */
--color-gray-600: #4B5563;     /* Medium Dark Gray */
--color-gray-700: #374151;     /* Dark Gray */
--color-gray-800: #1F2937;     /* Very Dark Gray */
--color-gray-900: #111827;     /* Almost Black */
```

### Semantic Colors
```css
--color-background: #FFFFFF;   /* Page background */
--color-foreground: #000000;   /* Primary text */
--color-muted: #F5F5F5;        /* Muted background */
--color-muted-foreground: #737373; /* Secondary text */
--color-border: #E5E7EB;       /* Borders */
--color-card: #FFFFFF;         /* Card backgrounds */
--color-card-foreground: #000000; /* Card text */
```

### Dark Mode Colors
```css
--color-background: #0A0A0A;   /* Dark background */
--color-foreground: #E0E0E0;   /* Light text */
--color-muted: #262626;        /* Dark muted */
--color-muted-foreground: #A3A3A3; /* Light muted text */
--color-border: #262626;       /* Dark borders */
--color-card: #1A1A1A;         /* Dark cards */
--color-card-foreground: #E0E0E0; /* Light card text */
```

## Typography

### Font Families
```css
--font-heading: 'Poppins', sans-serif;  /* Headings */
--font-body: 'Inter', sans-serif;       /* Body text */
```

### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
```

### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Line Heights
```css
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

## Spacing Scale

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

## Border Radius

```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;   /* Fully rounded */
```

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

## Component Library

### Buttons

#### Primary Button
```css
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

#### Secondary Button
```css
.btn-secondary {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: var(--color-primary);
  color: var(--color-white);
}
```

### Cards

#### Basic Card
```css
.card {
  background-color: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}
```

#### Featured Card
```css
.card-featured {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: var(--color-white);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-xl);
}
```

### Forms

#### Input Field
```css
.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-background);
  color: var(--color-foreground);
  font-size: var(--text-base);
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgb(0 102 0 / 0.1);
}
```

#### Form Label
```css
.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: var(--font-medium);
  color: var(--color-foreground);
  font-size: var(--text-sm);
}
```

### Navigation

#### Header
```css
.header {
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-4) 0;
  position: sticky;
  top: 0;
  z-index: 50;
}
```

#### Navigation Link
```css
.nav-link {
  color: var(--color-foreground);
  text-decoration: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: var(--color-muted);
  color: var(--color-primary);
}

.nav-link.active {
  background-color: var(--color-primary);
  color: var(--color-white);
}
```

## Layout Patterns

### Container
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (min-width: 768px) {
  .container {
    padding: 0 var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 var(--space-8);
  }
}
```

### Grid System
```css
.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (max-width: 768px) {
  .grid-cols-2,
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
```

### Flex Utilities
```css
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.flex-col {
  flex-direction: column;
}

.gap-4 {
  gap: var(--space-4);
}
```

## Responsive Design

### Breakpoints
```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Responsive Utilities
```css
/* Hide on mobile, show on desktop */
.hidden-mobile {
  display: none;
}

@media (min-width: 768px) {
  .hidden-mobile {
    display: block;
  }
}

/* Show on mobile, hide on desktop */
.visible-mobile {
  display: block;
}

@media (min-width: 768px) {
  .visible-mobile {
    display: none;
  }
}
```

## Theme Implementation

### CSS Variables Setup
```css
:root {
  /* Light theme colors */
  --color-background: #FFFFFF;
  --color-foreground: #000000;
  --color-primary: #006600;
  /* ... other variables */
}

.dark {
  /* Dark theme overrides */
  --color-background: #0A0A0A;
  --color-foreground: #E0E0E0;
  --color-primary: #008800;
  /* ... other overrides */
}
```

### Theme Toggle Component
```tsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-muted"
    >
      {theme === 'dark' ? 'Light' : 'Dark'} Mode
    </button>
  );
}
```

## Accessibility Guidelines

### Color Contrast
- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio
- Interactive elements: Clear focus indicators

### Focus Management
```css
.focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Screen Reader Support
- Semantic HTML elements
- ARIA labels where needed
- Skip links for navigation

### Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order
- Keyboard shortcuts documented

## Performance Optimization

### CSS Optimization
- Use CSS variables for theming
- Minimize CSS bundle size
- Use CSS Grid and Flexbox efficiently

### Image Optimization
- WebP format with fallbacks
- Responsive images with srcset
- Lazy loading for below-fold images

### Animation Performance
- Use transform and opacity for animations
- Avoid animating layout properties
- Respect prefers-reduced-motion

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Guidelines

### CSS Architecture
- Use utility-first approach with Tailwind
- Custom CSS for complex components
- Consistent naming conventions
- Document custom classes

### Component Development
- Use design system components first
- Extend existing components rather than creating new ones
- Document component variants and props
- Test components across themes and screen sizes

### Theme Testing
- Test all components in both light and dark modes
- Verify color contrast ratios
- Check responsive behavior
- Validate accessibility compliance

## Resources

### Design Tools
- Figma for design mockups
- Storybook for component documentation
- Chromatic for visual regression testing

### Color Tools
- Contrast checker: https://webaim.org/resources/contrastchecker/
- Color palette generator: https://coolors.co/

### Accessibility Tools
- WAVE accessibility evaluator
- Axe DevTools browser extension
- Lighthouse accessibility audit

This design system provides a solid foundation for maintaining consistency across the application while allowing for flexibility and growth.