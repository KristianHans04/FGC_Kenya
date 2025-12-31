/**
 * @file index.ts
 * @description Main export file for reusable UI components
 * @author Team Kenya Dev
 */

// Base UI Components
export { Button } from './Button'
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button'

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from './Card'
export type { 
  CardProps, 
  CardVariant, 
  CardPadding,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps
} from './Card'

export { Badge, StatusBadge, CountyBadge } from './Badge'
export type { 
  BadgeProps, 
  BadgeVariant, 
  BadgeSize,
  StatusBadgeProps,
  CountyBadgeProps
} from './Badge'

// Layout Components
export { HeroSection } from './HeroSection'
export type { 
  HeroSectionProps, 
  HeroLayout, 
  HeroSize, 
  HeroBackground 
} from './HeroSection'

export { SectionTitle, PageTitle } from './SectionTitle'
export type { 
  SectionTitleProps, 
  PageTitleProps,
  TitleAlignment, 
  TitleSize 
} from './SectionTitle'

// Feature Components
export { FeatureCard, FeatureGrid } from './FeatureCard'
export type { 
  FeatureCardProps, 
  FeatureCardVariant, 
  FeatureCardSize,
  FeatureGridProps
} from './FeatureCard'

// Data Display Components
export { StatCard, StatGrid } from './StatCard'
export type { 
  StatCardProps, 
  StatCardVariant, 
  StatCardSize,
  TrendDirection,
  StatGridProps
} from './StatCard'

export { TeamMemberCard, TeamGrid } from './TeamMemberCard'
export type { 
  TeamMemberCardProps, 
  TeamMemberCardVariant, 
  TeamMemberCardSize,
  TeamMember,
  SocialLink,
  TeamGridProps
} from './TeamMemberCard'

/**
 * Component categories for organization
 */
export const UI_CATEGORIES = {
  BASE: 'base',
  LAYOUT: 'layout', 
  FEATURE: 'feature',
  DATA: 'data'
} as const

export type UICategory = typeof UI_CATEGORIES[keyof typeof UI_CATEGORIES]

/**
 * Available UI components registry
 */
export const UI_COMPONENTS = {
  // Base Components
  Button: {
    name: 'Button',
    category: UI_CATEGORIES.BASE,
    description: 'Interactive button component with variants and states'
  },
  Card: {
    name: 'Card',
    category: UI_CATEGORIES.BASE,
    description: 'Container component for content with consistent styling'
  },
  Badge: {
    name: 'Badge',
    category: UI_CATEGORIES.BASE,
    description: 'Small label component for statuses and categories'
  },
  
  // Layout Components
  HeroSection: {
    name: 'HeroSection',
    category: UI_CATEGORIES.LAYOUT,
    description: 'Hero section component with Kenya branding'
  },
  SectionTitle: {
    name: 'SectionTitle',
    category: UI_CATEGORIES.LAYOUT,
    description: 'Consistent section titles with Kenya styling'
  },
  
  // Feature Components  
  FeatureCard: {
    name: 'FeatureCard',
    category: UI_CATEGORIES.FEATURE,
    description: 'Card component for showcasing features and services'
  },
  
  // Data Display Components
  StatCard: {
    name: 'StatCard',
    category: UI_CATEGORIES.DATA,
    description: 'Statistics card with trends and metrics'
  },
  TeamMemberCard: {
    name: 'TeamMemberCard',
    category: UI_CATEGORIES.DATA,
    description: 'Team member display card with social links and info'
  }
} as const

export type UIComponentName = keyof typeof UI_COMPONENTS

/**
 * Kenya theme variants for components
 */
export const KENYA_VARIANTS = {
  PRIMARY: 'kenya-green',
  SECONDARY: 'kenya-red', 
  ACCENT: 'kenya-black',
  LIGHT: 'kenya-white'
} as const

export type KenyaVariant = typeof KENYA_VARIANTS[keyof typeof KENYA_VARIANTS]

/**
 * Common component sizes
 */
export const COMPONENT_SIZES = {
  SM: 'sm',
  MD: 'md', 
  LG: 'lg',
  XL: 'xl',
  XXL: '2xl'
} as const

export type ComponentSize = typeof COMPONENT_SIZES[keyof typeof COMPONENT_SIZES]

/**
 * Animation presets for components
 */
export const ANIMATION_PRESETS = {
  FADE_IN: {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    transition: { duration: 0.5 },
    viewport: { once: true }
  },
  SLIDE_UP: {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
    viewport: { once: true }
  },
  SLIDE_DOWN: {
    initial: { opacity: 0, y: -20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
    viewport: { once: true }
  },
  SCALE_IN: {
    initial: { opacity: 0, scale: 0.95 },
    whileInView: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 },
    viewport: { once: true }
  },
  STAGGER_CHILDREN: {
    transition: {
      staggerChildren: 0.1
    }
  }
} as const

export type AnimationPreset = keyof typeof ANIMATION_PRESETS

/**
 * Helper function to create staggered animation delays
 */
export const createStaggerDelay = (index: number, baseDelay = 0.1): number => {
  return index * baseDelay
}

/**
 * Helper function to get Kenya-themed colors
 */
export const getKenyaColor = (variant: KenyaVariant): string => {
  const colors: Record<KenyaVariant, string> = {
    'kenya-green': '#006600',
    'kenya-red': '#BB0000', 
    'kenya-black': '#000000',
    'kenya-white': '#FFFFFF'
  }
  
  return colors[variant]
}

/**
 * Default props for Kenya-themed components
 */
export const KENYA_DEFAULT_PROPS = {
  showKenyaAccent: true,
  variant: 'kenya' as const,
  animated: true,
  responsive: true
} as const