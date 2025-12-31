/**
 * @file StatCard.tsx
 * @description Reusable statistics card component for displaying metrics and KPIs
 * @author Team Kenya Dev
 */

'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { Card, CardContent } from './Card'
import { Badge } from './Badge'

/**
 * Stat card variant types
 */
export type StatCardVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'kenya'

/**
 * Stat card size types
 */
export type StatCardSize = 'sm' | 'md' | 'lg'

/**
 * Trend direction types
 */
export type TrendDirection = 'up' | 'down' | 'neutral'

/**
 * Stat card component props
 */
export interface StatCardProps {
  /** Main statistic value */
  value: string | number
  /** Stat label/title */
  label: string
  /** Value suffix (e.g., '%', '+', 'K') */
  suffix?: string
  /** Value prefix (e.g., '$', '#') */
  prefix?: string
  /** Description or additional context */
  description?: string
  /** Icon to display */
  icon?: LucideIcon
  /** Custom icon element */
  iconElement?: ReactNode
  /** Card variant */
  variant?: StatCardVariant
  /** Card size */
  size?: StatCardSize
  /** Previous value for comparison */
  previousValue?: number
  /** Change percentage */
  changePercent?: number
  /** Trend direction override */
  trend?: TrendDirection
  /** Period for the change (e.g., "vs last month") */
  changePeriod?: string
  /** Whether to animate counter */
  animateValue?: boolean
  /** Whether to animate on view */
  animated?: boolean
  /** Animation delay */
  delay?: number
  /** Custom className */
  className?: string
  /** Click handler */
  onClick?: () => void
  /** Whether the card is clickable */
  clickable?: boolean
  /** Loading state */
  loading?: boolean
}

/**
 * Get card variant classes
 */
const getVariantClasses = (variant: StatCardVariant): {
  card: string
  icon: string
  value: string
  trend: { up: string; down: string; neutral: string }
} => {
  const variants: Record<StatCardVariant, {
    card: string
    icon: string
    value: string
    trend: { up: string; down: string; neutral: string }
  }> = {
    default: {
      card: 'border-border hover:border-muted-foreground/50',
      icon: 'bg-muted text-foreground',
      value: 'text-foreground',
      trend: {
        up: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        down: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
        neutral: 'text-muted-foreground bg-muted'
      }
    },
    primary: {
      card: 'border-primary/20 bg-primary/5 hover:bg-primary/10',
      icon: 'bg-primary/10 text-primary',
      value: 'text-primary',
      trend: {
        up: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        down: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
        neutral: 'text-primary/70 bg-primary/10'
      }
    },
    success: {
      card: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30',
      icon: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      value: 'text-green-700 dark:text-green-400',
      trend: {
        up: 'text-green-700 bg-green-200 dark:text-green-300 dark:bg-green-800/50',
        down: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
        neutral: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      }
    },
    warning: {
      card: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
      icon: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      value: 'text-yellow-700 dark:text-yellow-400',
      trend: {
        up: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        down: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
        neutral: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
      }
    },
    error: {
      card: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30',
      icon: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      value: 'text-red-700 dark:text-red-400',
      trend: {
        up: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        down: 'text-red-700 bg-red-200 dark:text-red-300 dark:bg-red-800/50',
        neutral: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
      }
    },
    kenya: {
      card: 'border-2 border-transparent bg-gradient-to-br from-background via-background to-background relative overflow-hidden hover:shadow-lg',
      icon: 'bg-gradient-to-br from-kenya-green/20 to-kenya-red/20 text-kenya-green',
      value: 'bg-gradient-to-r from-kenya-green via-kenya-red to-kenya-black bg-clip-text text-transparent',
      trend: {
        up: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        down: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
        neutral: 'text-kenya-green/70 bg-kenya-green/10'
      }
    }
  }
  
  return variants[variant]
}

/**
 * Get size classes
 */
const getSizeClasses = (size: StatCardSize): {
  padding: string
  iconSize: number
  valueSize: string
  labelSize: string
} => {
  const sizes: Record<StatCardSize, {
    padding: string
    iconSize: number
    valueSize: string
    labelSize: string
  }> = {
    sm: {
      padding: 'p-4',
      iconSize: 20,
      valueSize: 'text-2xl',
      labelSize: 'text-sm'
    },
    md: {
      padding: 'p-6',
      iconSize: 24,
      valueSize: 'text-3xl',
      labelSize: 'text-base'
    },
    lg: {
      padding: 'p-8',
      iconSize: 28,
      valueSize: 'text-4xl',
      labelSize: 'text-lg'
    }
  }
  
  return sizes[size]
}

/**
 * Calculate trend from values
 */
const calculateTrend = (
  current: number, 
  previous: number, 
  changePercent?: number
): { direction: TrendDirection; percent: number } => {
  if (changePercent !== undefined) {
    return {
      direction: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral',
      percent: Math.abs(changePercent)
    }
  }
  
  if (previous === 0) return { direction: 'neutral', percent: 0 }
  
  const percent = ((current - previous) / previous) * 100
  return {
    direction: percent > 0 ? 'up' : percent < 0 ? 'down' : 'neutral',
    percent: Math.abs(percent)
  }
}

/**
 * Animated Counter Component
 */
const AnimatedCounter = ({ 
  end, 
  duration = 2000,
  prefix = '',
  suffix = ''
}: { 
  end: number
  duration?: number
  prefix?: string
  suffix?: string
}) => {
  // This would typically use a counter animation library
  // For simplicity, we'll just display the end value
  return <>{prefix}{end.toLocaleString()}{suffix}</>
}

/**
 * Trend Indicator Component
 */
const TrendIndicator = ({
  direction,
  percent,
  period,
  variantClasses
}: {
  direction: TrendDirection
  percent: number
  period?: string
  variantClasses: ReturnType<typeof getVariantClasses>
}) => {
  if (direction === 'neutral' && percent === 0) return null
  
  const TrendIcon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : null
  
  return (
    <div className="flex items-center gap-1">
      <Badge
        variant="outline"
        size="sm"
        className={cn(
          'font-medium',
          variantClasses.trend[direction]
        )}
      >
        {TrendIcon && <TrendIcon size={12} className="mr-1" />}
        {percent.toFixed(1)}%
      </Badge>
      {period && (
        <span className="text-xs text-muted-foreground">
          {period}
        </span>
      )}
    </div>
  )
}

/**
 * Stat Card component
 */
export const StatCard = ({
  value,
  label,
  suffix = '',
  prefix = '',
  description,
  icon: Icon,
  iconElement,
  variant = 'default',
  size = 'md',
  previousValue,
  changePercent,
  trend: trendOverride,
  changePeriod,
  animateValue = false,
  animated = true,
  delay = 0,
  className,
  onClick,
  clickable = false,
  loading = false
}: StatCardProps) => {
  const variantClasses = getVariantClasses(variant)
  const sizeConfig = getSizeClasses(size)
  
  // Calculate trend
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value
  const trendData = previousValue !== undefined || changePercent !== undefined
    ? calculateTrend(numericValue, previousValue || 0, changePercent)
    : null
  
  const trendDirection = trendOverride || trendData?.direction || 'neutral'
  const trendPercent = trendData?.percent || 0
  
  const isInteractive = clickable || onClick
  
  const cardClasses = cn(
    'transition-all duration-300',
    variantClasses.card,
    isInteractive && 'cursor-pointer hover:shadow-md',
    loading && 'animate-pulse',
    className
  )
  
  const motionProps = animated ? {
    initial: { opacity: 0, scale: 0.95 },
    whileInView: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, delay },
    viewport: { once: true }
  } : {}
  
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
        onClick={isInteractive ? onClick : undefined}
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
        
        <CardContent className={cn('relative z-10', sizeConfig.padding)}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Value */}
              <div className={cn('font-bold mb-2', sizeConfig.valueSize, variantClasses.value)}>
                {loading ? (
                  <div className="bg-muted rounded animate-pulse h-8 w-24" />
                ) : animateValue && typeof value === 'number' ? (
                  <AnimatedCounter end={value} prefix={prefix} suffix={suffix} />
                ) : (
                  `${prefix}${typeof value === 'number' ? value.toLocaleString() : value}${suffix}`
                )}
              </div>
              
              {/* Label */}
              <div className={cn('font-medium text-muted-foreground mb-1', sizeConfig.labelSize)}>
                {label}
              </div>
              
              {/* Description */}
              {description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {description}
                </p>
              )}
              
              {/* Trend */}
              {(trendData || trendOverride) && (
                <TrendIndicator
                  direction={trendDirection}
                  percent={trendPercent}
                  period={changePeriod}
                  variantClasses={variantClasses}
                />
              )}
            </div>
            
            {/* Icon */}
            {(Icon || iconElement) && !loading && (
              <div className={cn(
                'rounded-lg p-3 flex-shrink-0',
                variantClasses.icon
              )}>
                {iconElement || (Icon && <Icon size={sizeConfig.iconSize} />)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </CardWrapper>
  )
}

/**
 * Stat Grid component for displaying multiple stat cards
 */
export interface StatGridProps {
  /** Stat cards data */
  stats: (Omit<StatCardProps, 'animated' | 'delay'> & { id?: string })[]
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

export const StatGrid = ({
  stats,
  columns = { sm: 1, md: 2, lg: 4, xl: 4 },
  staggered = true,
  staggerDelay = 0.1,
  className
}: StatGridProps) => {
  const gridClasses = cn(
    'grid gap-4 sm:gap-6',
    `grid-cols-${columns.sm || 1}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    className
  )
  
  return (
    <div className={gridClasses}>
      {stats.map((stat, index) => (
        <StatCard
          key={stat.id || index}
          {...stat}
          animated={true}
          delay={staggered ? index * staggerDelay : 0}
        />
      ))}
    </div>
  )
}

export default StatCard