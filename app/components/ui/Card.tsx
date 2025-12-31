/**
 * @file Card.tsx
 * @description Reusable card component with consistent styling and variants
 * @author Team Kenya Dev
 */

'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/app/lib/utils'

/**
 * Card variant types
 */
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled' | 'kenya'

/**
 * Card padding types
 */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Card component props
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card visual variant */
  variant?: CardVariant
  /** Card padding size */
  padding?: CardPadding
  /** Whether the card is hoverable */
  hoverable?: boolean
  /** Whether to animate on hover */
  animated?: boolean
  /** Whether to show Kenya flag pattern */
  kenyaPattern?: boolean
  /** Custom className */
  className?: string
  /** Child elements */
  children?: React.ReactNode
  /** Whether to use motion wrapper */
  motion?: boolean
  /** Motion animation props */
  motionProps?: any
}

/**
 * Get card variant classes
 */
const getVariantClasses = (variant: CardVariant): string => {
  const variants: Record<CardVariant, string> = {
    default: `
      bg-background 
      border border-border 
      shadow-sm
    `,
    elevated: `
      bg-background 
      border border-border 
      shadow-lg hover:shadow-xl
      transition-shadow duration-200
    `,
    outlined: `
      bg-transparent 
      border-2 border-border 
      hover:border-primary/50
      transition-colors duration-200
    `,
    filled: `
      bg-muted/50 
      border border-muted 
      hover:bg-muted/70
      transition-colors duration-200
    `,
    kenya: `
      bg-background 
      border-2 border-transparent 
      bg-gradient-to-br from-background via-background to-background
      shadow-lg
      position-relative
      overflow-hidden
    `
  }
  
  return variants[variant]
}

/**
 * Get card padding classes
 */
const getPaddingClasses = (padding: CardPadding): string => {
  const paddings: Record<CardPadding, string> = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10'
  }
  
  return paddings[padding]
}

/**
 * Base card component without motion
 */
const BaseCard = forwardRef<HTMLDivElement, Omit<CardProps, 'motion' | 'motionProps'>>(
  ({
    variant = 'default',
    padding = 'md',
    hoverable = false,
    animated = false,
    kenyaPattern = false,
    className,
    children,
    ...props
  }, ref) => {
    const cardClasses = cn(
      // Base classes
      'rounded-lg overflow-hidden relative',
      
      // Variant classes
      getVariantClasses(variant),
      
      // Padding classes
      getPaddingClasses(padding),
      
      // Hoverable classes
      hoverable && [
        'cursor-pointer',
        'transition-all duration-200',
        variant === 'default' && 'hover:shadow-md',
        variant === 'elevated' && 'hover:shadow-2xl hover:-translate-y-1',
        variant === 'outlined' && 'hover:shadow-sm',
        variant === 'filled' && 'hover:shadow-md',
      ],
      
      // Animated classes
      animated && 'transform transition-transform duration-200',
      
      // Custom className
      className
    )
    
    return (
      <div ref={ref} className={cardClasses} {...props}>
        {/* Kenya pattern overlay */}
        {(kenyaPattern || variant === 'kenya') && (
          <>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-kenya-black via-kenya-red to-kenya-green" />
            <div className="absolute inset-0 african-pattern opacity-5 pointer-events-none" />
          </>
        )}
        
        {/* Card content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)

BaseCard.displayName = 'BaseCard'

/**
 * Motion card component with Framer Motion animations
 */
const MotionCard = forwardRef<HTMLDivElement, CardProps>(
  ({ motionProps, ...props }, ref) => {
    const defaultMotionProps = {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      transition: { duration: 0.5 },
      viewport: { once: true }
    }
    
    return (
      <motion.div
        ref={ref}
        {...defaultMotionProps}
        {...motionProps}
      >
        <BaseCard {...props} />
      </motion.div>
    )
  }
)

MotionCard.displayName = 'MotionCard'

/**
 * Main Card component that can be either static or animated
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ motion: useMotion = false, ...props }, ref) => {
    if (useMotion) {
      return <MotionCard ref={ref} {...props} />
    }
    
    return <BaseCard ref={ref} {...props} />
  }
)

Card.displayName = 'Card'

/**
 * Card Header component
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5', className)}
      {...props}
    />
  )
)

CardHeader.displayName = 'CardHeader'

/**
 * Card Title component
 */
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string
  children?: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => (
    <Component
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
)

CardTitle.displayName = 'CardTitle'

/**
 * Card Description component
 */
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string
  children?: React.ReactNode
}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
)

CardDescription.displayName = 'CardDescription'

/**
 * Card Content component
 */
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm', className)}
      {...props}
    />
  )
)

CardContent.displayName = 'CardContent'

/**
 * Card Footer component
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4', className)}
      {...props}
    />
  )
)

CardFooter.displayName = 'CardFooter'

export default Card