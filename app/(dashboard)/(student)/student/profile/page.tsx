'use client'

import { useState, useEffect } from 'react'
import { User, Loader2 } from 'lucide-react'
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

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'My Profile | FIRST Global Challenge Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Manage your student profile information')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Manage your student profile information'
      document.head.appendChild(meta)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
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

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information and settings
            </p>
          </div>
        </div>
      </div>

      {/* Profile Information Display */}
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
              <span className="font-medium capitalize">{profile.role.toLowerCase()}</span>
            </div>
            {profile.school && (
              <div>
                <span className="text-muted-foreground">School: </span>
                <span className="font-medium">{profile.school}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Form */}
      <ProfileForm
        initialData={profile}
        onSave={handleSave}
      />
    </div>
  )
}