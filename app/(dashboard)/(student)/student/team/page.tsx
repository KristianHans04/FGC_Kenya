'use client'

import { useState, useEffect } from 'react'
import { Users, Loader2, Trophy, Calendar, AlertCircle } from 'lucide-react'
import CohortTeamSection from '@/app/components/student/CohortTeamSection'

interface Cohort {
  cohort: string
  year: string
  joinedAt: string
  isActive: boolean
  mentors: any[]
  students: any[]
  totalMembers: number
}

export default function StudentTeamPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'My Team | FIRST Global Challenge Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'View and connect with your FIRST Global Challenge team members across all years')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'View and connect with your FIRST Global Challenge team members across all years'
      document.head.appendChild(meta)
    }
  }, [])

  useEffect(() => {
    fetchTeamData()
  }, [])

  const fetchTeamData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/student/team')
      
      if (!response.ok) {
        throw new Error('Failed to fetch team data')
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        setCohorts(data.data.cohorts || [])
        setCurrentUserId(data.data.currentUserId || '')
      } else {
        setError(data.message || 'Failed to load team data')
      }
    } catch (error) {
      console.error('Failed to fetch team:', error)
      setError('Failed to load team data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading team information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h3 className="font-semibold">Error Loading Team</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button 
            onClick={fetchTeamData}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (cohorts.length === 0) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Teams</h1>
          <p className="text-muted-foreground">
            View and connect with your FIRST Global Challenge teammates
          </p>
        </div>
        
        <div className="bg-card rounded-lg border p-8 md:p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-card-foreground mb-2">
            No Team Membership Yet
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You are not part of any FIRST Global Challenge team yet. 
            Once you join a team, you'll see your teammates here.
          </p>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const totalTeammates = cohorts.reduce((acc, c) => acc + c.totalMembers, 0)
  const activeCohort = cohorts.find(c => c.isActive)
  const totalMentors = cohorts.reduce((acc, c) => acc + c.mentors.length, 0)
  const totalStudents = cohorts.reduce((acc, c) => acc + c.students.length, 0)

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Teams</h1>
        <p className="text-muted-foreground">
          Connect with your FIRST Global Challenge teammates across all years
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-4 text-center">
          <Trophy className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{cohorts.length}</div>
          <div className="text-xs text-muted-foreground">Competitions</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{totalTeammates}</div>
          <div className="text-xs text-muted-foreground">Total Teammates</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{totalMentors}</div>
          <div className="text-xs text-muted-foreground">Mentors</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{totalStudents}</div>
          <div className="text-xs text-muted-foreground">Students</div>
        </div>
      </div>

      {/* Cohort Sections */}
      <div className="space-y-4">
        {cohorts.map((cohort, index) => (
          <CohortTeamSection
            key={cohort.cohort}
            cohort={cohort}
            currentUserId={currentUserId}
            defaultOpen={index === 0 || cohort.isActive}
          />
        ))}
      </div>

      {/* Info Note */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Privacy Note:</strong> Contact information is only visible to team members. 
          Click on a member card to view their details and connect with them.
        </p>
      </div>
    </div>
  )
}