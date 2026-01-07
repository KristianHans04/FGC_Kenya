'use client'

import { useState, useEffect } from 'react'
import { Users, Loader2, Calendar } from 'lucide-react'
import ProfileForm from '@/app/components/profile/ProfileForm'

interface ProfileData {
  id?: string
  firstName?: string | null
  lastName?: string | null
  email: string
  phone?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  nationality?: string | null
  school?: string | null
  grade?: string | null
  county?: string | null
  homeAddress?: string | null
  parentName?: string | null
  parentPhone?: string | null
  parentEmail?: string | null
  linkedinUrl?: string | null
  githubUrl?: string | null
  portfolioUrl?: string | null
  role: string
}

interface MentorCohort {
  cohort: string
  year: string
  studentCount: number
  isActive: boolean
}

export default function MentorProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [mentorCohorts, setMentorCohorts] = useState<MentorCohort[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'My Profile | Mentor Dashboard'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Manage your mentor profile and information')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Manage your mentor profile and information'
      document.head.appendChild(meta)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
    fetchMentorCohorts()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.data || null)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMentorCohorts = async () => {
    try {
      const response = await fetch('/api/mentor/cohorts')
      if (response.ok) {
        const data = await response.json()
        setMentorCohorts(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch mentor cohorts:', error)
    }
  }

  const handleSave = async (data: ProfileData) => {
    const response = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Failed to update profile')
    }

    const result = await response.json()
    setProfile(result.data)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  const totalStudents = mentorCohorts.reduce((acc, c) => acc + c.studentCount, 0)

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-blue-600/10 flex items-center justify-center">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mentor Profile</h1>
            <p className="text-muted-foreground">
              Manage your profile and mentorship information
            </p>
          </div>
        </div>
      </div>

      {/* Mentor Info Display */}
      {profile && (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Name: </span>
              <span className="font-medium">
                {profile.firstName || profile.lastName 
                  ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
                  : 'Not set'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Email: </span>
              <span className="font-medium">{profile.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Role: </span>
              <span className="font-medium px-2 py-0.5 bg-blue-600/10 text-blue-600 rounded">
                Mentor
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Active Cohorts: </span>
              <span className="font-medium">{mentorCohorts.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Students: </span>
              <span className="font-medium">{totalStudents}</span>
            </div>
          </div>
        </div>
      )}

      {/* Cohorts Section */}
      {mentorCohorts.length > 0 && (
        <div className="mb-6 bg-card rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Your Cohorts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mentorCohorts.map(cohort => (
              <div key={cohort.cohort} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <span className="font-medium">{cohort.cohort}</span>
                  {cohort.isActive && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-600/10 text-green-600 rounded">
                      Active
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {cohort.studentCount} student{cohort.studentCount !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Form */}
      <ProfileForm
        initialData={profile}
        onSave={handleSave}
      />

      {/* Mentor Responsibilities */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">Mentor Responsibilities</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Guide and support students through their FIRST Global Challenge journey</li>
          <li>• Provide technical expertise in robotics and programming</li>
          <li>• Review and approve student projects and submissions</li>
          <li>• Create and share learning resources with your cohorts</li>
          <li>• Schedule and conduct mentoring sessions</li>
          <li>• Monitor student progress and provide feedback</li>
          <li>• Foster collaboration and teamwork among students</li>
          <li>• Prepare students for competitions and challenges</li>
        </ul>
      </div>
    </div>
  )
}