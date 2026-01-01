'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import Link from 'next/link'
import {
  BookOpen,
  FileText,
  Users,
  Trophy,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Award,
  Edit,
  Eye,
  MessageSquare,
  Video,
  Image,
  PlusCircle
} from 'lucide-react'

interface TeamMember {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  profilePicture?: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
  progress: number
  maxProgress: number
}

interface TrainingModule {
  id: string
  title: string
  description: string
  status: 'not_started' | 'in_progress' | 'completed'
  progress: number
  dueDate?: string
}

interface MediaDraft {
  id: string
  title: string
  type: 'article' | 'video' | 'image'
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'published'
  lastModified: string
  feedback?: string
}

export default function StudentDashboard() {
  
  useEffect(() => {
    document.title = 'Student Dashboard | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Your FIRST Global learning journey')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Your FIRST Global learning journey'
      document.head.appendChild(meta)
    }
  }, [])


  const { user } = useAuth()
  const [cohort, setCohort] = useState<string>('')
  const [team, setTeam] = useState<TeamMember[]>([])
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [mediaDrafts, setMediaDrafts] = useState<MediaDraft[]>([])
  const [stats, setStats] = useState({
    completedModules: 0,
    totalModules: 0,
    teamSize: 0,
    achievements: 0,
    publishedMedia: 0,
    overallProgress: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudentData()
  }, [])

  // Calculate stats when data changes
  useEffect(() => {
    const completedModules = modules.filter(m => m.status === 'completed').length
    const totalModules = modules.length
    const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

    setStats({
      completedModules,
      totalModules,
      teamSize: team.length,
      achievements: achievements.filter(a => a.unlockedAt).length,
      publishedMedia: mediaDrafts.filter(m => m.status === 'published').length,
      overallProgress
    })
  }, [modules, team, achievements, mediaDrafts])

  const fetchStudentData = async () => {
    setLoading(true)
    try {
      // Fetch student's cohort
      const cohortResponse = await fetch('/api/student/cohort')
      if (cohortResponse.ok) {
        const cohortData = await cohortResponse.json()
        setCohort(cohortData.data?.cohort || '')
      }

      // Fetch team members
      const teamResponse = await fetch('/api/student/team')
      if (teamResponse.ok) {
        const teamData = await teamResponse.json()
        setTeam(teamData.data?.members || [])
      }

      // Fetch training modules
      const modulesResponse = await fetch('/api/student/modules')
      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json()
        setModules(modulesData.data?.modules || [])
      }

      // Fetch achievements
      const achievementsResponse = await fetch('/api/student/achievements')
      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json()
        setAchievements(achievementsData.data?.achievements || [])
      }

      // Fetch media drafts
      const mediaResponse = await fetch('/api/student/media')
      if (mediaResponse.ok) {
        const mediaData = await mediaResponse.json()
        setMediaDrafts(mediaData.data?.media || [])
      }

      // Stats will be calculated in a separate useEffect
    } catch (error) {
      console.error('Failed to fetch student data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitForApproval = async (mediaId: string) => {
    try {
      await fetch(`/api/student/media/${mediaId}/submit`, {
        method: 'PUT'
      })
      fetchStudentData()
    } catch (error) {
      console.error('Failed to submit media:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">
            {cohort} Cohort • Team {team.length > 0 ? team[0].role : 'Member'}
          </p>
        </div>
        <Link
          href="/student/media/create"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Create Content
        </Link>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Progress</h2>
          <span className="text-3xl font-bold">{stats.overallProgress}%</span>
        </div>
        <div className="w-full bg-background/50 rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all duration-500"
            style={{ width: `${stats.overallProgress}%` }}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div>
            <p className="text-2xl font-bold">{stats.completedModules}</p>
            <p className="text-sm text-muted-foreground">Modules Complete</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalModules}</p>
            <p className="text-sm text-muted-foreground">Total Modules</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.achievements}</p>
            <p className="text-sm text-muted-foreground">Achievements</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.publishedMedia}</p>
            <p className="text-sm text-muted-foreground">Published Content</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.teamSize}</p>
            <p className="text-sm text-muted-foreground">Team Members</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Training Modules */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">Training Modules</h2>
              <Link
                href="/student/training"
                className="text-sm text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="divide-y">
              {modules.slice(0, 4).map((module) => (
                <div key={module.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium">{module.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {module.description}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      module.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : module.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {module.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {module.status !== 'completed' && (
                    <>
                      <div className="w-full bg-muted rounded-full h-2 mb-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>
                      {module.dueDate && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due {new Date(module.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </>
                  )}
                  
                  <Link
                    href={`/student/training/${module.id}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {module.status === 'completed' ? 'Review' : 'Continue'}
                    <BookOpen className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Media Drafts */}
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">Your Content</h2>
              <Link
                href="/student/media"
                className="text-sm text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="divide-y">
              {mediaDrafts.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No content created yet</p>
                  <Link
                    href="/student/media/create"
                    className="inline-flex items-center gap-2 mt-3 text-primary hover:underline"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Create your first content
                  </Link>
                </div>
              ) : (
                mediaDrafts.slice(0, 3).map((draft) => (
                  <div key={draft.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {draft.type === 'article' && <FileText className="h-4 w-4" />}
                          {draft.type === 'video' && <Video className="h-4 w-4" />}
                          {draft.type === 'image' && <Image className="h-4 w-4" />}
                          <h3 className="font-medium">{draft.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last modified {new Date(draft.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        draft.status === 'published' 
                          ? 'bg-green-100 text-green-800'
                          : draft.status === 'approved'
                          ? 'bg-blue-100 text-blue-800'
                          : draft.status === 'pending_approval'
                          ? 'bg-yellow-100 text-yellow-800'
                          : draft.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {draft.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {draft.status === 'rejected' && draft.feedback && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs">
                        <p className="font-medium text-red-900 dark:text-red-100">Feedback:</p>
                        <p className="text-red-700 dark:text-red-300">{draft.feedback}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-3">
                      <Link
                        href={`/student/media/${draft.id}/edit`}
                        className="text-sm text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      {draft.status === 'draft' && (
                        <button
                          onClick={() => handleSubmitForApproval(draft.id)}
                          className="text-sm text-primary hover:underline"
                        >
                          Submit for Approval
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Team */}
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Your Team</h2>
            </div>
            <div className="p-4 space-y-3">
              {team.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {member.firstName?.[0] || member.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {member.firstName || member.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                  <Link
                    href={`/student/team/${member.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">Achievements</h2>
              <Link
                href="/student/achievements"
                className="text-sm text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {achievements.slice(0, 4).map((achievement) => (
                <div key={achievement.id} className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    achievement.unlockedAt 
                      ? 'bg-yellow-100 text-yellow-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      !achievement.unlockedAt && 'text-muted-foreground'
                    }`}>
                      {achievement.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.unlockedAt 
                        ? `Unlocked ${new Date(achievement.unlockedAt).toLocaleDateString()}`
                        : `${achievement.progress}/${achievement.maxProgress} progress`
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Upcoming Events</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Team Meeting</p>
                  <p className="text-xs text-muted-foreground">Tomorrow, 3:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Training Session</p>
                  <p className="text-xs text-muted-foreground">Friday, 2:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
