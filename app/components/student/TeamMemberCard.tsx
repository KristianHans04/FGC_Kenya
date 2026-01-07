'use client'

import { useState } from 'react'
import { User, Mail, Phone, School, Globe, Github, Linkedin, ChevronRight, Shield, Users } from 'lucide-react'

interface TeamMemberCardProps {
  member: {
    id: string
    slug: string
    firstName?: string | null
    lastName?: string | null
    email?: string
    phone?: string | null
    school?: string | null
    linkedinUrl?: string | null
    githubUrl?: string | null
    portfolioUrl?: string | null
    cohortRole: 'MENTOR' | 'STUDENT'
    joinedAt: string
    isActive: boolean
  }
  currentUserId: string
}

export default function TeamMemberCard({ member, currentUserId }: TeamMemberCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const isCurrentUser = member.id === currentUserId
  const isMentor = member.cohortRole === 'MENTOR'
  
  const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Team Member'
  
  return (
    <div className={`bg-card rounded-lg border p-4 hover:shadow-md transition-all duration-200 ${
      isCurrentUser ? 'ring-2 ring-primary/20' : ''
    } ${isMentor ? 'border-yellow-600/20' : ''}`}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              isMentor ? 'bg-yellow-600/10' : 'bg-primary/10'
            }`}>
              {isMentor ? <Shield className="h-5 w-5 text-yellow-600" /> : <User className="h-5 w-5" />}
            </div>
            {member.isActive && (
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate flex items-center gap-2">
              {fullName}
              {isCurrentUser && <span className="text-xs text-muted-foreground">(You)</span>}
            </h3>
            <p className="text-xs text-muted-foreground">{isMentor ? 'Mentor' : 'Student'}</p>
          </div>
        </div>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${
          showDetails ? 'rotate-90' : ''
        }`} />
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t space-y-2 animate-in slide-in-from-top-2">
          {member.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
          
          {member.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span>{member.phone}</span>
            </div>
          )}
          
          {member.school && (
            <div className="flex items-center gap-2 text-sm">
              <School className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{member.school}</span>
            </div>
          )}
          
          {(member.linkedinUrl || member.githubUrl || member.portfolioUrl) && (
            <div className="flex gap-2 mt-3 pt-2 border-t">
              {member.linkedinUrl && (
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-muted rounded-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {member.githubUrl && (
                <a
                  href={member.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-muted rounded-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {member.portfolioUrl && (
                <a
                  href={member.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-muted rounded-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground pt-2">
            Joined: {new Date(member.joinedAt).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  )
}