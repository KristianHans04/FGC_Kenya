/**
 * @file TeamMemberCard.tsx
 * @description Reusable team member card component for displaying team member information
 * @author Team Kenya Dev
 */

'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, Mail, ExternalLink, Github, Linkedin, Twitter } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/app/lib/utils'
import { Card, CardContent, CardHeader } from './Card'
import { Badge } from './Badge'
import { Button } from './Button'

/**
 * Team member card variant types
 */
export type TeamMemberCardVariant = 'default' | 'minimal' | 'detailed' | 'kenya'

/**
 * Team member card size types
 */
export type TeamMemberCardSize = 'sm' | 'md' | 'lg'

/**
 * Social link types
 */
export interface SocialLink {
  type: 'email' | 'github' | 'linkedin' | 'twitter' | 'website' | 'custom'
  url: string
  label?: string
  icon?: LucideIcon
}

/**
 * Team member data interface
 */
export interface TeamMember {
  id?: string
  name: string
  role: string
  bio?: string
  image?: string
  email?: string
  department?: string
  skills?: string[]
  achievements?: string[]
  yearsActive?: string
  location?: string
  socialLinks?: SocialLink[]
  isAlumni?: boolean
  graduationYear?: number
  currentPosition?: string
  currentCompany?: string
}

/**
 * Team member card component props
 */
export interface TeamMemberCardProps {
  /** Team member data */
  member: TeamMember
  /** Card variant */
  variant?: TeamMemberCardVariant
  /** Card size */
  size?: TeamMemberCardSize
  /** Whether to show contact button */
  showContact?: boolean
  /** Whether to show social links */
  showSocialLinks?: boolean
  /** Whether to show skills */
  showSkills?: boolean
  /** Whether to show achievements */
  showAchievements?: boolean
  /** Whether the card is clickable */
  clickable?: boolean
  /** Click handler */
  onClick?: (member: TeamMember) => void
  /** Whether to animate on view */
  animated?: boolean
  /** Animation delay */
  delay?: number
  /** Custom className */
  className?: string
  /** Maximum skills to show */
  maxSkills?: number
  /** Maximum achievements to show */
  maxAchievements?: number
  /** Whether to show full bio or truncated */
  truncateBio?: boolean
  /** Bio character limit for truncation */
  bioLimit?: number
}

/**
 * Get card variant classes
 */
const getVariantClasses = (variant: TeamMemberCardVariant): string => {
  const variants: Record<TeamMemberCardVariant, string> = {
    default: 'border-border',
    minimal: 'border-transparent shadow-none hover:border-border',
    detailed: 'border-border bg-gradient-to-b from-background to-muted/20',
    kenya: 'border-2 border-transparent bg-gradient-to-br from-background via-background to-background relative overflow-hidden'
  }
  
  return variants[variant]
}

/**
 * Get size classes
 */
const getSizeClasses = (size: TeamMemberCardSize): {
  padding: string
  imageSize: string
  nameSize: string
  roleSize: string
} => {
  const sizes: Record<TeamMemberCardSize, {
    padding: string
    imageSize: string
    nameSize: string
    roleSize: string
  }> = {
    sm: {
      padding: 'p-4',
      imageSize: 'w-16 h-16',
      nameSize: 'text-lg',
      roleSize: 'text-sm'
    },
    md: {
      padding: 'p-6',
      imageSize: 'w-20 h-20',
      nameSize: 'text-xl',
      roleSize: 'text-base'
    },
    lg: {
      padding: 'p-8',
      imageSize: 'w-24 h-24',
      nameSize: 'text-2xl',
      roleSize: 'text-lg'
    }
  }
  
  return sizes[size]
}

/**
 * Get social icon component
 */
const getSocialIcon = (type: SocialLink['type'], customIcon?: LucideIcon): LucideIcon => {
  if (customIcon) return customIcon
  
  const icons: Record<Exclude<SocialLink['type'], 'custom'>, LucideIcon> = {
    email: Mail,
    github: Github,
    linkedin: Linkedin,
    twitter: Twitter,
    website: ExternalLink
  }
  
  return icons[type as keyof typeof icons] || ExternalLink
}

/**
 * Social Links Component
 */
const SocialLinks = ({ links, size }: { links: SocialLink[]; size: 'sm' | 'md' | 'lg' }) => {
  const iconSize = size === 'sm' ? 16 : size === 'md' ? 18 : 20
  
  return (
    <div className="flex items-center gap-2">
      {links.map((link, index) => {
        const Icon = getSocialIcon(link.type, link.icon)
        
        return (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            iconOnly
            icon={Icon}
            onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
            className="h-8 w-8 p-0"
            aria-label={link.label || `${link.type} profile`}
          />
        )
      })}
    </div>
  )
}

/**
 * Skills Component
 */
const Skills = ({ 
  skills, 
  maxSkills = 5,
  variant
}: { 
  skills: string[]
  maxSkills?: number
  variant: TeamMemberCardVariant
}) => {
  const displayedSkills = skills.slice(0, maxSkills)
  const remainingCount = Math.max(0, skills.length - maxSkills)
  
  const badgeVariant = variant === 'kenya' ? 'primary' : 'outline'
  
  return (
    <div className="flex flex-wrap gap-1">
      {displayedSkills.map((skill, index) => (
        <Badge
          key={index}
          variant={badgeVariant}
          size="sm"
        >
          {skill}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" size="sm">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  )
}

/**
 * Alumni Badge Component
 */
const AlumniBadge = ({ 
  graduationYear, 
  currentPosition, 
  currentCompany 
}: {
  graduationYear?: number
  currentPosition?: string
  currentCompany?: string
}) => (
  <div className="space-y-2">
    <Badge variant="secondary" size="sm">
      Alumni {graduationYear && `'${graduationYear.toString().slice(-2)}`}
    </Badge>
    {currentPosition && (
      <div className="text-xs text-muted-foreground">
        <div className="font-medium">{currentPosition}</div>
        {currentCompany && <div>at {currentCompany}</div>}
      </div>
    )}
  </div>
)

/**
 * Team Member Card component
 */
export const TeamMemberCard = ({
  member,
  variant = 'default',
  size = 'md',
  showContact = true,
  showSocialLinks = true,
  showSkills = true,
  showAchievements = false,
  clickable = false,
  onClick,
  animated = true,
  delay = 0,
  className,
  maxSkills = 5,
  maxAchievements = 3,
  truncateBio = true,
  bioLimit = 150
}: TeamMemberCardProps) => {
  const sizeConfig = getSizeClasses(size)
  const isInteractive = clickable || onClick
  
  const cardClasses = cn(
    'h-full transition-all duration-300',
    getVariantClasses(variant),
    isInteractive && 'cursor-pointer hover:shadow-lg hover:-translate-y-1',
    className
  )
  
  const motionProps = animated ? {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
    viewport: { once: true }
  } : {}
  
  const handleClick = () => {
    if (onClick) {
      onClick(member)
    }
  }
  
  // Truncate bio if needed
  const displayBio = member.bio && truncateBio && member.bio.length > bioLimit
    ? `${member.bio.substring(0, bioLimit)}...`
    : member.bio
  
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
        
        <div className={cn('relative z-10', sizeConfig.padding)}>
          {/* Header */}
          <CardHeader className="p-0 pb-4">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className={cn('flex-shrink-0', sizeConfig.imageSize)}>
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={size === 'sm' ? 64 : size === 'md' ? 80 : 96}
                    height={size === 'sm' ? 64 : size === 'md' ? 80 : 96}
                    className="rounded-full object-cover w-full h-full"
                  />
                ) : (
                  <div className={cn(
                    'rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold',
                    sizeConfig.imageSize,
                    sizeConfig.nameSize
                  )}>
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Name and Role */}
                <h3 className={cn('font-bold font-heading mb-1 truncate', sizeConfig.nameSize)}>
                  {member.name}
                </h3>
                <p className={cn('text-primary font-medium mb-2', sizeConfig.roleSize)}>
                  {member.role}
                </p>
                
                {/* Department and Years Active */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {member.department && (
                    <span>{member.department}</span>
                  )}
                  {member.yearsActive && (
                    <>
                      {member.department && <span>•</span>}
                      <span>{member.yearsActive}</span>
                    </>
                  )}
                  {member.location && (
                    <>
                      {(member.department || member.yearsActive) && <span>•</span>}
                      <span>📍 {member.location}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Alumni Badge */}
              {member.isAlumni && (
                <AlumniBadge
                  graduationYear={member.graduationYear}
                  currentPosition={member.currentPosition}
                  currentCompany={member.currentCompany}
                />
              )}
            </div>
          </CardHeader>
          
          {/* Content */}
          <CardContent className="p-0 space-y-4">
            {/* Bio */}
            {displayBio && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {displayBio}
              </p>
            )}
            
            {/* Skills */}
            {showSkills && member.skills && member.skills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Skills</h4>
                <Skills 
                  skills={member.skills} 
                  maxSkills={maxSkills}
                  variant={variant}
                />
              </div>
            )}
            
            {/* Achievements */}
            {showAchievements && member.achievements && member.achievements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Achievements</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {member.achievements.slice(0, maxAchievements).map((achievement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary mr-2 mt-0.5">•</span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                  {member.achievements.length > maxAchievements && (
                    <li className="text-xs text-muted-foreground/70">
                      +{member.achievements.length - maxAchievements} more achievements
                    </li>
                  )}
                </ul>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              {/* Contact Button */}
              {showContact && member.email && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Mail}
                  onClick={() => window.location.href = `mailto:${member.email}`}
                >
                  Contact
                </Button>
              )}
              
              {/* Social Links */}
              {showSocialLinks && member.socialLinks && member.socialLinks.length > 0 && (
                <SocialLinks links={member.socialLinks} size={size} />
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </CardWrapper>
  )
}

/**
 * Team Grid component for displaying multiple team member cards
 */
export interface TeamGridProps {
  /** Team members data */
  members: TeamMember[]
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
  /** Props to pass to each team member card */
  cardProps?: Partial<TeamMemberCardProps>
}

export const TeamGrid = ({
  members,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  staggered = true,
  staggerDelay = 0.1,
  className,
  cardProps = {}
}: TeamGridProps) => {
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
      {members.map((member, index) => (
        <TeamMemberCard
          key={member.id || index}
          member={member}
          animated={true}
          delay={staggered ? index * staggerDelay : 0}
          {...cardProps}
        />
      ))}
    </div>
  )
}

export default TeamMemberCard