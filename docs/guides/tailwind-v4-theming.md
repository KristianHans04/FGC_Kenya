# Tailwind V4 Theming Guide

## Overview
This guide documents the key differences in theming between Tailwind V3 and V4, and how to properly implement light/dark themes in your Next.js 16 application.

## The Issue
When migrating from Tailwind V3 to V4, you may encounter theme color issues where:
- Colors work in dark mode but not light mode (or vice versa)
- Text becomes invisible against backgrounds
- Components don't respond to theme changes properly

## Key Differences: Tailwind V3 vs V4

### Tailwind V3 Approach
```css
/* In tailwind.config.js */
theme: {
  extend: {
    colors: {
      primary: '#006600',
      // ... other colors
    }
  }
}
```

```jsx
// In components
<div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900">
```

### Tailwind V4 Approach
```css
/* In globals.css */
@theme {
  /* Define CSS variables for colors */
  --color-primary: #006600;
  --color-background: #FFFFFF;
  --color-foreground: #000000;
  --color-muted: #F5F5F5;
  --color-muted-foreground: #737373;
  --color-border: #E5E7EB;
  --color-card: #FFFFFF;
  --color-card-foreground: #000000;
}

/* Dark mode overrides */
.dark {
  --color-background: #0A0A0A;
  --color-foreground: #E0E0E0;
  --color-card: #1A1A1A;
  --color-card-foreground: #E0E0E0;
  --color-muted: #262626;
  --color-muted-foreground: #A3A3A3;
  --color-border: #262626;
}

/* Define semantic classes */
.text-foreground { color: var(--color-foreground); }
.bg-background { background-color: var(--color-background); }
.bg-card { background-color: var(--color-card); }
/* ... etc */
```

```jsx
// In components - Use semantic color names
<div className="text-foreground bg-background">
  <div className="bg-card text-card-foreground border-border">
    <p className="text-muted-foreground">Secondary text</p>
  </div>
</div>
```

## The Solution

### 1. Define Theme Variables in CSS
Create a proper theme structure in your `globals.css`:

```css
@theme {
  /* Light mode defaults */
  --color-background: #FFFFFF;
  --color-foreground: #000000;
  --color-primary: #006600;
  --color-primary-light: #008800;
  --color-muted: #F5F5F5;
  --color-muted-foreground: #737373;
  --color-border: #E5E7EB;
  --color-card: #FFFFFF;
  --color-card-foreground: #000000;
}

/* Dark mode overrides */
.dark {
  --color-background: #0A0A0A;
  --color-foreground: #E0E0E0;
  --color-primary: #008800;
  --color-primary-light: #00AA00;
  --color-muted: #262626;
  --color-muted-foreground: #A3A3A3;
  --color-border: #262626;
  --color-card: #1A1A1A;
  --color-card-foreground: #E0E0E0;
}
```

### 2. Create Utility Classes
Define utility classes that reference your CSS variables:

```css
/* Text colors */
.text-foreground { color: var(--color-foreground); }
.text-muted-foreground { color: var(--color-muted-foreground); }
.text-primary { color: var(--color-primary); }

/* Background colors */
.bg-background { background-color: var(--color-background); }
.bg-card { background-color: var(--color-card); }
.bg-muted { background-color: var(--color-muted); }
.bg-primary { background-color: var(--color-primary); }

/* Border colors */
.border-border { border-color: var(--color-border); }
```

### 3. Use Semantic Names in Components
Instead of hardcoding colors with dark mode variants, use semantic names:

```jsx
// ❌ WRONG - Hardcoded colors
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <p className="text-gray-600 dark:text-gray-400">Secondary text</p>
</div>

// ✅ CORRECT - Semantic colors
<div className="bg-card text-card-foreground">
  <p className="text-muted-foreground">Secondary text</p>
</div>
```

### 4. Setup Theme Provider
Ensure your theme provider is configured correctly in `layout.tsx`:

```jsx
import { ThemeProvider } from '@/app/components/ThemeProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## Common Pitfalls to Avoid

### 1. Mixing Approaches
Don't mix Tailwind V3 and V4 theming approaches:
```jsx
// ❌ Inconsistent - mixing semantic and explicit colors
<div className="bg-background text-gray-900 dark:text-white">
```

### 2. Forgetting to Define Both Modes
Always define colors for both light and dark modes:
```css
/* ❌ Missing dark mode definition */
@theme {
  --color-special: #FF0000;
}

/* ✅ Complete definition */
@theme {
  --color-special: #FF0000;
}
.dark {
  --color-special: #FF6666;
}
```

### 3. Using Non-Semantic Names
Use meaningful, semantic names for colors:
```css
/* ❌ Poor naming */
--color-gray-50: #F9FAFB;
--color-gray-900: #111827;

/* ✅ Semantic naming */
--color-background: #F9FAFB;
--color-foreground: #111827;
```

## Testing Your Theme

1. **Toggle Between Modes**: Always test your components in both light and dark modes
2. **Check Contrast**: Ensure text is readable against backgrounds in both modes
3. **Validate Borders**: Borders should be visible but subtle in both modes
4. **Test Hover States**: Interactive elements should have clear hover states

## Migration Checklist

When migrating components from Tailwind V3 to V4:

- [ ] Replace `text-gray-*` with semantic colors (`text-foreground`, `text-muted-foreground`)
- [ ] Replace `bg-white dark:bg-gray-*` with `bg-background` or `bg-card`
- [ ] Replace `border-gray-*` with `border-border`
- [ ] Remove all `dark:` prefixes when using semantic colors
- [ ] Test in both light and dark modes
- [ ] Check for any remaining hardcoded color values

## Example Component Migration

### Before (Tailwind V3)
```jsx
function Card({ children }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="text-gray-900 dark:text-white font-semibold">Title</h3>
      <p className="text-gray-600 dark:text-gray-400 mt-2">{children}</p>
    </div>
  )
}
```

### After (Tailwind V4)
```jsx
function Card({ children }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-card-foreground font-semibold">Title</h3>
      <p className="text-muted-foreground mt-2">{children}</p>
    </div>
  )
}
```

## Summary

The key to successful theming in Tailwind V4 is:
1. Use CSS variables for all color definitions
2. Create semantic color names that make sense for your application
3. Define both light and dark mode values
4. Use the semantic classes consistently throughout your components
5. Avoid mixing V3 and V4 approaches

This approach ensures your theme is:
- Consistent across the application
- Easy to maintain and update
- Automatically responsive to theme changes
- More readable and semantic in your code