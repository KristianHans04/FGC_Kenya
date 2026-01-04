'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { User, Mail, Phone, School, Calendar, Github, Linkedin, Globe, Edit } from 'lucide-react'

export default function ProfilePage() {
  const params = useParams()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (params.slug) {
      fetchProfile(params.slug as string)
    }
  }, [params.slug])

  const fetchProfile = async (slug: string) => {
    try {
      const response = await fetch(`/api/profile/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data.data)
        document.title = `${data.data.firstName || 'Profile'} | FIRST Global Team Kenya`
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-32 bg-muted rounded-lg mb-4"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-card-foreground mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground">The profile you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg border p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-sm text-muted-foreground capitalize">{profile.role.toLowerCase()}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Member since {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.school && (
                  <div className="flex items-center gap-3 text-sm">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.school}</span>
                  </div>
                )}
              </div>
            </div>

            {(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl) && (
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Social Links</h2>
                <div className="space-y-3">
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-primary hover:underline"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn Profile
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-primary hover:underline"
                    >
                      <Github className="h-4 w-4" />
                      GitHub Profile
                    </a>
                  )}
                  {profile.portfolioUrl && (
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-primary hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      Portfolio Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Activity Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Events Created</span>
                  <span className="font-medium">{profile._count?.createdEvents || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tasks Created</span>
                  <span className="font-medium">{profile._count?.createdTasks || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Resources Uploaded</span>
                  <span className="font-medium">{profile._count?.uploadedResources || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Applications</span>
                  <span className="font-medium">{profile._count?.applications || 0}</span>
                </div>
              </div>
            </div>

            {profile.lastLoginAt && (
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Last Active</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(profile.lastLoginAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}