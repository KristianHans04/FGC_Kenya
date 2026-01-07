'use client'

import { useState } from 'react'
import { ChevronDown, Users, Shield, Calendar, Award } from 'lucide-react'
import TeamMemberCard from './TeamMemberCard'

interface CohortTeamSectionProps {
  cohort: {
    cohort: string
    year: string
    joinedAt: string
    isActive: boolean
    mentors: any[]
    students: any[]
    totalMembers: number
  }
  currentUserId: string
  defaultOpen?: boolean
}

export default function CohortTeamSection({ cohort, currentUserId, defaultOpen = false }: CohortTeamSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultOpen)
  
  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 md:p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-lg">FIRST Global Challenge {cohort.year}</h3>
            <div className="flex flex-wrap gap-2 md:gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {cohort.totalMembers} members
              </span>
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {cohort.mentors.length} mentor{cohort.mentors.length !== 1 ? 's' : ''}
              </span>
              {cohort.isActive && (
                <span className="flex items-center gap-1 text-green-600">
                  <Award className="h-3 w-3" />
                  Current Season
                </span>
              )}
            </div>
          </div>
        </div>
        
        <ChevronDown 
          className={`h-5 w-5 text-muted-foreground transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      {isExpanded && (
        <div className="px-4 md:px-6 pb-4 md:pb-6 border-t">
          {/* Mentors Section */}
          {cohort.mentors.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-yellow-600" />
                Mentors
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cohort.mentors.map((mentor) => (
                  <TeamMemberCard
                    key={mentor.id}
                    member={mentor}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Students Section */}
          {cohort.students.length > 0 && (
            <div className={cohort.mentors.length > 0 ? 'mt-6' : 'mt-4'}>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Members
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cohort.students.map((student) => (
                  <TeamMemberCard
                    key={student.id}
                    member={student}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            </div>
          )}
          
          {cohort.mentors.length === 0 && cohort.students.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No team members found for this cohort.
            </div>
          )}
        </div>
      )}
    </div>
  )
}