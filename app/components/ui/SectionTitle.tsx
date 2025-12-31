/**
 * @file SectionTitle.tsx
 * @description Reusable section title component with consistent styling
 * @author Team Kenya Dev
 */

'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/app/lib/utils'

/**
 * Section title alignment types
 */
export type TitleAlignment = 'left' | 'center' | 'right'

/**
 * Section title size types
 */
export type TitleSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/**
 * Section title component props
 */
export interface SectionTitleProps {
  /** Main title text */
  title: string | ReactNode
  /** Subtitle or description */
  subtitle?: string | ReactNode
  /** Text alignment */
  alignment?: TitleAlignment
  /** Title size */
  size?: TitleSize
  /** Icon to display with title */
  icon?: LucideIcon
  /** Whether to show Kenya flag accent */
  showKenyaAccent?: boolean
  /** Whether to highlight part of the title */
  highlight?: string
  /** Highlight color variant */
  highlightVariant?: 'primary' | 'secondary' | 'kenya' | 'gradient'
  /** Whether to animate on view */
  animated?: boolean
  /** Custom className */
  className?: string
  /** Container className */
  containerClassName?: string
  /** Maximum width for centered titles */
  maxWidth?: string
}

/**
 * Get title size classes
 */
const getSizeClasses = (size: TitleSize): { title: string; subtitle: string } => {
  const sizes: Record<TitleSize, { title: string; subtitle: string }> = {
    sm: {
      title: 'text-2xl md:text-3xl',
      subtitle: 'text-base'
    },
    md: {
      title: 'text-3xl md:text-4xl',
      subtitle: 'text-lg'
    },
    lg: {
      title: 'text-4xl md:text-5xl',
      subtitle: 'text-xl'
    },
    xl: {
      title: 'text-5xl md:text-6xl',
      subtitle: 'text-xl md:text-2xl'
    },
    '2xl': {
      title: 'text-6xl md:text-7xl lg:text-8xl',
      subtitle: 'text-2xl md:text-3xl'
    }
  }
  
  return sizes[size]
}

/**
 * Get alignment classes
 */
const getAlignmentClasses = (alignment: TitleAlignment): string => {
  const alignments: Record<TitleAlignment, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }
  
  return alignments[alignment]
}

/**
 * Get highlight classes
 */
const getHighlightClasses = (variant: NonNullable<SectionTitleProps['highlightVariant']>): string => {
  const variants: Record<typeof variant, string> = {
    primary: 'text-primary',
    secondary: 'text-kenya-red',
    kenya: 'bg-gradient-to-r from-kenya-green via-kenya-red to-kenya-black bg-clip-text text-transparent',
    gradient: 'bg-gradient-to-r from-primary to-kenya-green bg-clip-text text-transparent'
  }
  
  return variants[variant]
}

/**
 * Kenya Flag Accent Component
 */
const KenyaAccent = ({ alignment, animated }: { alignment: TitleAlignment; animated: boolean }) => {
  const accentClasses = cn(
    'flex items-center space-x-2 mb-6',
    alignment === 'center' && 'justify-center',
    alignment === 'right' && 'justify-end'
  )
  
  return (
    <motion.div 
      initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
      whileInView={animated ? { opacity: 1, scale: 1 } : undefined}
      transition={animated ? { duration: 0.5 } : undefined}
      viewport={animated ? { once: true } : undefined}
      className={accentClasses}
    >
      <div className="h-1 w-8 bg-kenya-black"></div>
      <div className="h-1 w-8 bg-kenya-red"></div>
      <div className="h-1 w-8 bg-kenya-green"></div>
    </motion.div>
  )
}

/**
 * Highlight text within a string
 */
const highlightText = (
  text: string, 
  highlight: string, 
  variant: NonNullable<SectionTitleProps['highlightVariant']>
): ReactNode => {
  if (!highlight) return text
  
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
  
  return parts.map((part, index) => {
    if (part.toLowerCase() === highlight.toLowerCase()) {
      return (
        <span key={index} className={getHighlightClasses(variant)}>
          {part}
        </span>
      )
    }
    return part
  })
}

/**
 * Section Title component with Kenya branding
 */
export const SectionTitle = ({
  title,
  subtitle,
  alignment = 'center',
  size = 'lg',
  icon: Icon,
  showKenyaAccent = false,
  highlight,
  highlightVariant = 'primary',
  animated = true,
  className,
  containerClassName,
  maxWidth = '4xl'
}: SectionTitleProps) => {
  const sizeClasses = getSizeClasses(size)
  const alignmentClasses = getAlignmentClasses(alignment)
  
  const containerClasses = cn(
    'mb-12',
    alignmentClasses,
    alignment === 'center' && `max-w-${maxWidth} mx-auto`,
    containerClassName
  )
  
  const titleClasses = cn(
    'font-bold font-heading mb-4',
    sizeClasses.title,
    className
  )
  
  const subtitleClasses = cn(
    'text-muted-foreground',
    sizeClasses.subtitle
  )
  
  return (
    <div className={containerClasses}>
      {/* Kenya Flag Accent */}
      {showKenyaAccent && (
        <KenyaAccent alignment={alignment} animated={animated} />
      )}
      
      {/* Title */}
      <motion.div
        initial={animated ? { opacity: 0, y: 20 } : undefined}
        whileInView={animated ? { opacity: 1, y: 0 } : undefined}
        transition={animated ? { duration: 0.5 } : undefined}
        viewport={animated ? { once: true } : undefined}
        className="mb-4"
      >
        {typeof title === 'string' ? (
          <h2 className={titleClasses}>
            {Icon && (
              <Icon className="inline-block mr-3 mb-1" size={size === 'sm' ? 24 : size === 'md' ? 28 : size === 'lg' ? 32 : size === 'xl' ? 36 : 40} />
            )}
            {highlight ? highlightText(title, highlight, highlightVariant) : title}
          </h2>
        ) : (
          <div className={titleClasses}>
            {Icon && (
              <Icon className="inline-block mr-3 mb-1" size={size === 'sm' ? 24 : size === 'md' ? 28 : size === 'lg' ? 32 : size === 'xl' ? 36 : 40} />
            )}
            {title}
          </div>
        )}
      </motion.div>
      
      {/* Subtitle */}
      {subtitle && (
        <motion.div
          initial={animated ? { opacity: 0, y: 20 } : undefined}
          whileInView={animated ? { opacity: 1, y: 0 } : undefined}
          transition={animated ? { duration: 0.5, delay: 0.1 } : undefined}
          viewport={animated ? { once: true } : undefined}
        >
          {typeof subtitle === 'string' ? (
            <p className={subtitleClasses}>
              {subtitle}
            </p>
          ) : (
            <div className={subtitleClasses}>
              {subtitle}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

/**
 * Page Title component for page headers
 */
export interface PageTitleProps extends Omit<SectionTitleProps, 'size' | 'alignment'> {
  /** Breadcrumb items */
  breadcrumbs?: { label: string; href?: string }[]
  /** Page actions */
  actions?: ReactNode
}

export const PageTitle = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  showKenyaAccent = true,
  ...props
}: PageTitleProps) => {
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="inline-flex items-center">
                {index > 0 && (
                  <svg
                    className="w-3 h-3 text-muted-foreground mx-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-sm font-medium text-foreground">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <SectionTitle
            title={title}
            subtitle={subtitle}
            size="xl"
            alignment="left"
            showKenyaAccent={showKenyaAccent}
            {...props}
          />
        </div>
        
        {/* Page Actions */}
        {actions && (
          <div className="ml-6 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

export default SectionTitle