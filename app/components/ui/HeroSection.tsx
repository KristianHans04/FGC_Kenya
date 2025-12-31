/**
 * @file HeroSection.tsx
 * @description Reusable hero section component with Kenya branding
 * @author Team Kenya Dev
 */

'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/app/lib/utils'

/**
 * Hero section layout types
 */
export type HeroLayout = 'centered' | 'left' | 'right' | 'split'

/**
 * Hero section size types
 */
export type HeroSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'

/**
 * Hero section background types
 */
export type HeroBackground = 'none' | 'pattern' | 'gradient' | 'image' | 'video'

/**
 * Hero section component props
 */
export interface HeroSectionProps {
  /** Hero section layout */
  layout?: HeroLayout
  /** Hero section size */
  size?: HeroSize
  /** Background type */
  background?: HeroBackground
  /** Background image URL */
  backgroundImage?: string
  /** Background video URL */
  backgroundVideo?: string
  /** Background overlay opacity (0-100) */
  overlayOpacity?: number
  /** Whether to show Kenya flag accent */
  showKenyaFlag?: boolean
  /** Whether to show animated shapes */
  showAnimatedShapes?: boolean
  /** Whether to enable parallax scrolling */
  parallax?: boolean
  /** Main heading */
  title: string | ReactNode
  /** Subtitle or description */
  subtitle?: string | ReactNode
  /** Hero actions/buttons */
  actions?: ReactNode
  /** Additional content */
  children?: ReactNode
  /** Custom className */
  className?: string
  /** Whether to animate on mount */
  animated?: boolean
  /** Stats or metrics to display */
  stats?: {
    value: number | string
    label: string
    icon?: ReactNode
    suffix?: string
  }[]
}

/**
 * Get hero size classes
 */
const getSizeClasses = (size: HeroSize): string => {
  const sizes: Record<HeroSize, string> = {
    sm: 'min-h-[50vh] py-12',
    md: 'min-h-[60vh] py-16',
    lg: 'min-h-[80vh] py-20',
    xl: 'min-h-[90vh] py-24',
    fullscreen: 'min-h-screen py-32'
  }
  
  return sizes[size]
}

/**
 * Get layout classes
 */
const getLayoutClasses = (layout: HeroLayout): string => {
  const layouts: Record<HeroLayout, string> = {
    centered: 'text-center items-center justify-center',
    left: 'text-left items-center justify-start',
    right: 'text-right items-center justify-end',
    split: 'text-left items-center'
  }
  
  return layouts[layout]
}

/**
 * Kenya Flag Accent Component
 */
const KenyaFlagAccent = ({ animated = true }: { animated?: boolean }) => (
  <motion.div 
    initial={animated ? { opacity: 0, y: -20 } : undefined}
    animate={animated ? { opacity: 1, y: 0 } : undefined}
    transition={animated ? { duration: 0.5 } : undefined}
    className="flex items-center justify-center space-x-2 mb-8"
  >
    <div className="h-1 w-12 bg-kenya-black"></div>
    <div className="h-1 w-12 bg-kenya-red"></div>
    <div className="h-1 w-12 bg-kenya-white border border-gray-200 dark:border-gray-700"></div>
    <div className="h-1 w-12 bg-kenya-green"></div>
  </motion.div>
)

/**
 * Animated Background Shapes Component
 */
const AnimatedShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-kenya-green/10 rounded-full blur-3xl"
    />
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        rotate: [360, 180, 0],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute bottom-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-kenya-red/10 rounded-full blur-3xl"
    />
  </div>
)

/**
 * Background Component
 */
const HeroBackground = ({ 
  type, 
  image, 
  video, 
  overlayOpacity = 40, 
  showPattern = false 
}: {
  type: HeroBackground
  image?: string
  video?: string
  overlayOpacity?: number
  showPattern?: boolean
}) => {
  if (type === 'none') return null
  
  return (
    <div className="absolute inset-0">
      {/* Background Image */}
      {type === 'image' && image && (
        <Image
          src={image}
          alt="Hero Background"
          fill
          className="object-cover"
          priority
        />
      )}
      
      {/* Background Video */}
      {type === 'video' && video && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={video} type="video/mp4" />
        </video>
      )}
      
      {/* Background Gradient */}
      {type === 'gradient' && (
        <div className="absolute inset-0 bg-gradient-to-br from-kenya-green/20 via-kenya-red/10 to-kenya-black/20" />
      )}
      
      {/* Pattern Overlay */}
      {(showPattern || type === 'pattern') && (
        <div className="absolute inset-0 african-pattern opacity-5" />
      )}
      
      {/* Dark Overlay */}
      {(type === 'image' || type === 'video') && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity / 100 }}
        />
      )}
    </div>
  )
}

/**
 * Stats Display Component
 */
const StatsDisplay = ({ stats, animated = true }: { 
  stats: NonNullable<HeroSectionProps['stats']>
  animated?: boolean 
}) => (
  <motion.div
    initial={animated ? { opacity: 0, y: 20 } : undefined}
    animate={animated ? { opacity: 1, y: 0 } : undefined}
    transition={animated ? { duration: 0.5, delay: 0.4 } : undefined}
    className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
  >
    {stats.map((stat, index) => (
      <div key={index} className="text-center">
        {stat.icon && (
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full mb-2">
            {stat.icon}
          </div>
        )}
        <div className="text-3xl font-bold text-white">
          {stat.value}{stat.suffix}
        </div>
        <div className="text-sm text-white/90">{stat.label}</div>
      </div>
    ))}
  </motion.div>
)

/**
 * Hero Section component with Kenya branding
 */
export const HeroSection = ({
  layout = 'centered',
  size = 'lg',
  background = 'gradient',
  backgroundImage,
  backgroundVideo,
  overlayOpacity = 40,
  showKenyaFlag = true,
  showAnimatedShapes = false,
  parallax = false,
  title,
  subtitle,
  actions,
  children,
  className,
  animated = true,
  stats
}: HeroSectionProps) => {
  const sectionClasses = cn(
    // Base classes
    'relative flex overflow-hidden',
    
    // Size classes
    getSizeClasses(size),
    
    // Layout classes
    getLayoutClasses(layout),
    
    // Custom className
    className
  )
  
  const containerClasses = cn(
    'container relative z-10 px-4 sm:px-6 lg:px-8',
    layout === 'split' ? 'grid lg:grid-cols-2 gap-12 items-center' : 'max-w-5xl mx-auto'
  )
  
  return (
    <section className={sectionClasses}>
      {/* Background */}
      <HeroBackground
        type={background}
        image={backgroundImage}
        video={backgroundVideo}
        overlayOpacity={overlayOpacity}
        showPattern={background === 'pattern'}
      />
      
      {/* Animated Background Shapes */}
      {showAnimatedShapes && <AnimatedShapes />}
      
      {/* Content Container */}
      <div className={containerClasses}>
        <div className={layout === 'split' ? '' : 'w-full'}>
          {/* Kenya Flag Accent */}
          {showKenyaFlag && layout !== 'split' && (
            <KenyaFlagAccent animated={animated} />
          )}
          
          {/* Title */}
          <motion.div
            initial={animated ? { opacity: 0, y: 20 } : undefined}
            animate={animated ? { opacity: 1, y: 0 } : undefined}
            transition={animated ? { duration: 0.5, delay: 0.1 } : undefined}
            className="mb-6"
          >
            {typeof title === 'string' ? (
              <h1 className="text-5xl md:text-7xl font-bold font-heading">
                {title}
              </h1>
            ) : (
              title
            )}
          </motion.div>
          
          {/* Subtitle */}
          {subtitle && (
            <motion.div
              initial={animated ? { opacity: 0, y: 20 } : undefined}
              animate={animated ? { opacity: 1, y: 0 } : undefined}
              transition={animated ? { duration: 0.5, delay: 0.2 } : undefined}
              className="mb-8"
            >
              {typeof subtitle === 'string' ? (
                <p className="text-xl md:text-2xl text-white/90 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
                  {subtitle}
                </p>
              ) : (
                subtitle
              )}
            </motion.div>
          )}
          
          {/* Actions */}
          {actions && (
            <motion.div
              initial={animated ? { opacity: 0, y: 20 } : undefined}
              animate={animated ? { opacity: 1, y: 0 } : undefined}
              transition={animated ? { duration: 0.5, delay: 0.3 } : undefined}
              className="mb-12"
            >
              {actions}
            </motion.div>
          )}
          
          {/* Stats */}
          {stats && layout !== 'split' && (
            <StatsDisplay stats={stats} animated={animated} />
          )}
          
          {/* Additional Children */}
          {children}
        </div>
        
        {/* Split Layout Right Side Content */}
        {layout === 'split' && (
          <div className="relative">
            {/* Kenya Flag Accent for split layout */}
            {showKenyaFlag && (
              <KenyaFlagAccent animated={animated} />
            )}
            
            {/* Stats for split layout */}
            {stats && (
              <StatsDisplay stats={stats} animated={animated} />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default HeroSection