/**
 * @file Button.tsx
 * @description Reusable button component with consistent styling and variants
 * @author Team Kenya Dev
 */

'use client'

import { forwardRef } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/app/lib/utils'

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'

/**
 * Button size types
 */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

/**
 * Button component props
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual variant */
  variant?: ButtonVariant
  /** Button size */
  size?: ButtonSize
  /** Whether the button spans full width */
  fullWidth?: boolean
  /** Loading state */
  loading?: boolean
  /** Icon to display before text */
  icon?: LucideIcon
  /** Icon to display after text */
  iconAfter?: LucideIcon
  /** Whether button contains only an icon */
  iconOnly?: boolean
  /** Custom className */
  className?: string
  /** Child elements */
  children?: React.ReactNode
}

/**
 * Get button variant classes
 */
const getVariantClasses = (variant: ButtonVariant): string => {
  const variants: Record<ButtonVariant, string> = {
    primary: `
      bg-kenya-green text-white 
      hover:bg-kenya-green/90 
      active:bg-kenya-green/80
      focus:ring-2 focus:ring-kenya-green/50
      disabled:bg-gray-400 disabled:text-gray-200
      border-2 border-kenya-green hover:border-kenya-green/90
    `,
    secondary: `
      bg-kenya-red text-white 
      hover:bg-kenya-red/90 
      active:bg-kenya-red/80
      focus:ring-2 focus:ring-kenya-red/50
      disabled:bg-gray-400 disabled:text-gray-200
      border-2 border-kenya-red hover:border-kenya-red/90
    `,
    outline: `
      bg-transparent text-kenya-green 
      border-2 border-kenya-green
      hover:bg-kenya-green hover:text-white
      active:bg-kenya-green/90
      focus:ring-2 focus:ring-kenya-green/50
      disabled:border-gray-300 disabled:text-gray-400
    `,
    ghost: `
      bg-transparent text-kenya-green 
      hover:bg-kenya-green/10 
      active:bg-kenya-green/20
      focus:ring-2 focus:ring-kenya-green/50
      disabled:text-gray-400
      border-2 border-transparent
    `,
    destructive: `
      bg-red-600 text-white 
      hover:bg-red-700 
      active:bg-red-800
      focus:ring-2 focus:ring-red-500/50
      disabled:bg-gray-400 disabled:text-gray-200
      border-2 border-red-600 hover:border-red-700
    `
  }
  
  return variants[variant]
}

/**
 * Get button size classes
 */
const getSizeClasses = (size: ButtonSize, iconOnly = false): string => {
  if (iconOnly) {
    const iconOnlySizes: Record<ButtonSize, string> = {
      sm: 'h-8 w-8 p-0',
      md: 'h-10 w-10 p-0',
      lg: 'h-12 w-12 p-0',
      xl: 'h-14 w-14 p-0'
    }
    return iconOnlySizes[size]
  }
  
  const sizes: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    xl: 'h-14 px-8 text-lg'
  }
  
  return sizes[size]
}

/**
 * Button component with Kenya theme styling
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    icon: Icon,
    iconAfter: IconAfter,
    iconOnly = false,
    className,
    children,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading
    
    const buttonClasses = cn(
      // Base classes
      'inline-flex items-center justify-center',
      'font-semibold rounded-lg',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      
      // Variant classes
      getVariantClasses(variant),
      
      // Size classes
      getSizeClasses(size, iconOnly),
      
      // Width classes
      fullWidth && 'w-full',
      
      // Loading state
      loading && 'cursor-wait',
      
      // Custom className
      className
    )
    
    const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : size === 'lg' ? 18 : 20
    
    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <svg 
              className={cn(
                'animate-spin',
                iconOnly ? '' : 'mr-2',
                size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : size === 'lg' ? 'h-5 w-5' : 'h-6 w-6'
              )}
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {!iconOnly && 'Loading...'}
          </>
        ) : (
          <>
            {Icon && (
              <Icon 
                size={iconSize} 
                className={cn(iconOnly ? '' : 'mr-2')} 
              />
            )}
            {!iconOnly && children}
            {IconAfter && (
              <IconAfter 
                size={iconSize} 
                className={cn(iconOnly ? '' : 'ml-2')} 
              />
            )}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button