/**
 * @file Badge.tsx
 * @description Reusable badge component for status indicators and labels
 * @author Team Kenya Dev
 */

'use client'

import { forwardRef } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/app/lib/utils'

/**
 * Badge variant types
 */
export type BadgeVariant = 
  | 'default' 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info'
  | 'outline'
  | 'kenya'

/**
 * Badge size types
 */
export type BadgeSize = 'sm' | 'md' | 'lg'

/**
 * Badge component props
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Badge visual variant */
  variant?: BadgeVariant
  /** Badge size */
  size?: BadgeSize
  /** Icon to display before text */
  icon?: LucideIcon
  /** Icon to display after text */
  iconAfter?: LucideIcon
  /** Whether badge contains only an icon */
  iconOnly?: boolean
  /** Whether the badge is removable */
  removable?: boolean
  /** Callback when remove button is clicked */
  onRemove?: () => void
  /** Custom className */
  className?: string
  /** Child elements */
  children?: React.ReactNode
}

/**
 * Get badge variant classes
 */
const getVariantClasses = (variant: BadgeVariant): string => {
  const variants: Record<BadgeVariant, string> = {
    default: `
      bg-muted text-muted-foreground
      border border-border
    `,
    primary: `
      bg-kenya-green text-white
      border border-kenya-green
    `,
    secondary: `
      bg-kenya-red text-white
      border border-kenya-red
    `,
    success: `
      bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200
      border border-green-200 dark:border-green-800
    `,
    warning: `
      bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200
      border border-yellow-200 dark:border-yellow-800
    `,
    error: `
      bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200
      border border-red-200 dark:border-red-800
    `,
    info: `
      bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200
      border border-blue-200 dark:border-blue-800
    `,
    outline: `
      bg-transparent text-foreground
      border-2 border-border
      hover:bg-muted/50
    `,
    kenya: `
      bg-gradient-to-r from-kenya-black via-kenya-red to-kenya-green
      text-white border-0
      relative overflow-hidden
    `
  }
  
  return variants[variant]
}

/**
 * Get badge size classes
 */
const getSizeClasses = (size: BadgeSize, iconOnly = false): string => {
  if (iconOnly) {
    const iconOnlySizes: Record<BadgeSize, string> = {
      sm: 'h-5 w-5 p-1',
      md: 'h-6 w-6 p-1.5',
      lg: 'h-8 w-8 p-2'
    }
    return iconOnlySizes[size]
  }
  
  const sizes: Record<BadgeSize, string> = {
    sm: 'px-2 py-1 text-xs h-5',
    md: 'px-2.5 py-1.5 text-sm h-6',
    lg: 'px-3 py-2 text-base h-8'
  }
  
  return sizes[size]
}

/**
 * Badge component with Kenya theme styling
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({
    variant = 'default',
    size = 'md',
    icon: Icon,
    iconAfter: IconAfter,
    iconOnly = false,
    removable = false,
    onRemove,
    className,
    children,
    ...props
  }, ref) => {
    const badgeClasses = cn(
      // Base classes
      'inline-flex items-center justify-center',
      'font-medium rounded-full',
      'transition-all duration-200 ease-in-out',
      'whitespace-nowrap',
      
      // Variant classes
      getVariantClasses(variant),
      
      // Size classes
      getSizeClasses(size, iconOnly),
      
      // Custom className
      className
    )
    
    const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16
    
    return (
      <span ref={ref} className={badgeClasses} {...props}>
        {/* Kenya pattern for kenya variant */}
        {variant === 'kenya' && (
          <div className="absolute inset-0 african-pattern opacity-20 pointer-events-none" />
        )}
        
        <span className="relative z-10 flex items-center">
          {Icon && (
            <Icon 
              size={iconSize} 
              className={cn(iconOnly ? '' : 'mr-1')} 
            />
          )}
          
          {!iconOnly && children}
          
          {IconAfter && (
            <IconAfter 
              size={iconSize} 
              className={cn(iconOnly ? '' : 'ml-1')} 
            />
          )}
          
          {removable && (
            <button
              onClick={onRemove}
              className={cn(
                'ml-1 rounded-full p-0.5',
                'hover:bg-black/20 transition-colors',
                'focus:outline-none focus:ring-1 focus:ring-white/50'
              )}
              type="button"
              aria-label="Remove badge"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </span>
      </span>
    )
  }
)

Badge.displayName = 'Badge'

/**
 * Status Badge component for application statuses
 */
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: string
  statusMapping?: Record<string, BadgeVariant>
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, statusMapping, ...props }, ref) => {
    const defaultStatusMapping: Record<string, BadgeVariant> = {
      // Application statuses
      DRAFT: 'outline',
      SUBMITTED: 'info',
      UNDER_REVIEW: 'warning',
      SHORTLISTED: 'primary',
      INTERVIEW_SCHEDULED: 'secondary',
      INTERVIEWED: 'warning',
      ACCEPTED: 'success',
      REJECTED: 'error',
      WAITLISTED: 'info',
      WITHDRAWN: 'error',
      
      // Generic statuses
      active: 'success',
      inactive: 'error',
      pending: 'warning',
      completed: 'success',
      cancelled: 'error',
      draft: 'outline',
      published: 'primary'
    }
    
    const mapping = statusMapping || defaultStatusMapping
    const variant = mapping[status.toUpperCase()] || mapping[status.toLowerCase()] || 'default'
    
    return (
      <Badge
        ref={ref}
        variant={variant}
        {...props}
      >
        {status.replace('_', ' ')}
      </Badge>
    )
  }
)

StatusBadge.displayName = 'StatusBadge'

/**
 * County Badge component for Kenyan counties
 */
export interface CountyBadgeProps extends Omit<BadgeProps, 'variant'> {
  county: string
}

export const CountyBadge = forwardRef<HTMLSpanElement, CountyBadgeProps>(
  ({ county, ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        variant="kenya"
        size="sm"
        {...props}
      >
        📍 {county}
      </Badge>
    )
  }
)

CountyBadge.displayName = 'CountyBadge'

export default Badge