/**
 * @file FeatureCard.tsx
 * @description Reusable feature card component for showcasing services and features
 * @author Team Kenya Dev
 */

'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { Card, CardContent, CardHeader } from './Card'
import { Badge } from './Badge'

/**
 * Feature card variant types
 */
export type FeatureCardVariant = 'default' | 'highlighted' | 'minimal' | 'kenya'

/**
 * Feature card size types
 */
export type FeatureCardSize = 'sm' | 'md' | 'lg'

/**
 * Feature card component props
 */
export interface FeatureCardProps {
  /** Feature title */
  title: string
  /** Feature description */
  description: string
  /** Feature icon */
  icon?: LucideIcon
  /** Custom icon element */
  iconElement?: ReactNode
  /** Feature image URL */
  image?: string
  /** Badge text */
  badge?: string
  /** Badge variant */
  badgeVariant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  /** Card variant */
  variant?: FeatureCardVariant
  /** Card size */
  size?: FeatureCardSize
  /** Whether the card is clickable */
  clickable?: boolean
  /** Click handler */
  onClick?: () => void
  /** Link href */
  href?: string
  /** Whether to open link in new tab */
  external?: boolean
  /** Whether to animate on view */
  animated?: boolean
  /** Animation delay */
  delay?: number
  /** Custom className */
  className?: string
  /** Additional features list */
  features?: string[]
  /** Call to action text */
  ctaText?: string
  /** Footer content */
  footer?: ReactNode
  /** Whether to show hover effects */
  hoverable?: boolean
}

/**
 * Get card variant classes
 */
const getVariantClasses = (variant: FeatureCardVariant): string => {
  const variants: Record<FeatureCardVariant, string> = {
    default: 'border-border',
    highlighted: 'border-primary bg-primary/5 dark:bg-primary/10',
    minimal: 'border-transparent shadow-none hover:border-border',
    kenya: 'border-2 border-transparent bg-gradient-to-br from-background via-background to-background relative overflow-hidden'
  }
  
  return variants[variant]
}

/**
 * Get size classes
 */
const getSizeClasses = (size: FeatureCardSize): { 
  padding: string
  iconSize: number
  titleSize: string
} => {
  const sizes: Record<FeatureCardSize, { 
    padding: string
    iconSize: number
    titleSize: string
  }> = {
    sm: {
      padding: 'p-4',
      iconSize: 24,
      titleSize: 'text-lg'
    },
    md: {
      padding: 'p-6',
      iconSize: 32,
      titleSize: 'text-xl'
    },
    lg: {
      padding: 'p-8',
      iconSize: 40,
      titleSize: 'text-2xl'
    }
  }
  
  return sizes[size]
}

/**
 * Feature Icon Component
 */
const FeatureIcon = ({ 
  icon: Icon, 
  iconElement, 
  variant, 
  size 
}: {
  icon?: LucideIcon
  iconElement?: ReactNode
  variant: FeatureCardVariant
  size: number
}) => {
  if (iconElement) return <>{iconElement}</>
  
  if (!Icon) return null
  
  const iconClasses = cn(
    'flex-shrink-0 rounded-lg p-3 mb-4',
    variant === 'highlighted' && 'bg-primary/10 text-primary',
    variant === 'default' && 'bg-muted text-foreground',
    variant === 'minimal' && 'bg-primary/10 text-primary',
    variant === 'kenya' && 'bg-gradient-to-br from-kenya-green/20 to-kenya-red/20 text-kenya-green'
  )
  
  return (
    <div className={iconClasses}>
      <Icon size={size} />
    </div>
  )
}

/**
 * Feature Card component
 */
export const FeatureCard = ({
  title,
  description,
  icon,
  iconElement,
  image,
  badge,
  badgeVariant = 'default',
  variant = 'default',
  size = 'md',
  clickable = false,
  onClick,
  href,
  external = false,
  animated = true,
  delay = 0,
  className,
  features,
  ctaText,
  footer,
  hoverable = true
}: FeatureCardProps) => {
  const sizeConfig = getSizeClasses(size)
  const isInteractive = clickable || onClick || href
  
  const cardClasses = cn(
    'h-full transition-all duration-300',
    getVariantClasses(variant),
    isInteractive && hoverable && [
      'cursor-pointer',
      'hover:shadow-lg hover:-translate-y-1',
      variant === 'highlighted' && 'hover:shadow-primary/25',
    ],
    className
  )
  
  const motionProps = animated ? {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
    viewport: { once: true }
  } : {}
  
  const handleClick = () => {
    if (href) {
      if (external) {
        window.open(href, '_blank', 'noopener,noreferrer')
      } else {
        window.location.href = href
      }
    } else if (onClick) {
      onClick()
    }
  }
  
  const CardWrapper = ({ children }: { children: ReactNode }) => {
    if (animated) {
      return (
        <motion.div {...motionProps}>
          {children}
        </motion.div>
      )
    }
    return <>{children}</>
  }
  
  return (
    <CardWrapper>
      <Card
        className={cardClasses}
        onClick={isInteractive ? handleClick : undefined}
        variant="default"
        padding="none"
      >
        {/* Kenya pattern overlay for kenya variant */}
        {variant === 'kenya' && (
          <>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-kenya-black via-kenya-red to-kenya-green" />
            <div className="absolute inset-0 african-pattern opacity-5 pointer-events-none" />
          </>
        )}
        
        {/* Image */}
        {image && (
          <div className="aspect-video bg-muted overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className={cn('relative z-10', sizeConfig.padding)}>
          {/* Header */}
          <CardHeader className="p-0">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                {/* Icon */}
                <FeatureIcon
                  icon={icon}
                  iconElement={iconElement}
                  variant={variant}
                  size={sizeConfig.iconSize}
                />
              </div>
              
              {/* Badge */}
              {badge && (
                <Badge variant={badgeVariant} size="sm">
                  {badge}
                </Badge>
              )}
            </div>
            
            {/* Title */}
            <h3 className={cn('font-bold font-heading mb-2', sizeConfig.titleSize)}>
              {title}
            </h3>
          </CardHeader>
          
          {/* Content */}
          <CardContent className="p-0 space-y-4">
            {/* Description */}
            <p className="text-muted-foreground">
              {description}
            </p>
            
            {/* Features List */}
            {features && features.length > 0 && (
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-muted-foreground">
                    <span className="text-primary mr-2 mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {/* CTA Text */}
            {ctaText && (
              <div className="pt-2">
                <span className="text-primary font-medium text-sm hover:underline">
                  {ctaText} →
                </span>
              </div>
            )}
          </CardContent>
          
          {/* Footer */}
          {footer && (
            <div className="mt-4 pt-4 border-t border-border">
              {footer}
            </div>
          )}
        </div>
      </Card>
    </CardWrapper>
  )
}

/**
 * Feature Grid component for displaying multiple feature cards
 */
export interface FeatureGridProps {
  /** Feature cards data */
  features: (Omit<FeatureCardProps, 'animated' | 'delay'> & { id?: string })[]
  /** Grid columns configuration */
  columns?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  /** Whether to stagger animations */
  staggered?: boolean
  /** Animation delay between cards */
  staggerDelay?: number
  /** Container className */
  className?: string
}

export const FeatureGrid = ({
  features,
  columns = { sm: 1, md: 2, lg: 3, xl: 3 },
  staggered = true,
  staggerDelay = 0.1,
  className
}: FeatureGridProps) => {
  const gridClasses = cn(
    'grid gap-6',
    `grid-cols-${columns.sm || 1}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    className
  )
  
  return (
    <div className={gridClasses}>
      {features.map((feature, index) => (
        <FeatureCard
          key={feature.id || index}
          {...feature}
          animated={true}
          delay={staggered ? index * staggerDelay : 0}
        />
      ))}
    </div>
  )
}

export default FeatureCard