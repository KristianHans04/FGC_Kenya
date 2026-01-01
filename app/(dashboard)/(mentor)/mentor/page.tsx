'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import Link from 'next/link'
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  MessageSquare,
  FileText,
  CheckCircle,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Award,
  Target,
  Activity
} from 'lucide-react'

interface Student {
  id: string
  email: string
  firstName?: string
  lastName?: string
  school?: string
  year?: string
  profilePicture?: string
  joinedAt: string
  lastActive?: string
  progress: {
    completedModules: number
    totalModules: number
    averageScore: number
  }
}

interface MediaItem {
  id: string
  title: string
  author: {
    firstName?: string
    lastName?: string
    email: string
  }
  status: 'pending_approval' | 'approved' | 'rejected'
  submittedAt: string
  type: 'article' | 'video'
}

interface TrainingSession {
  id: string
  title: string
  date: string
  duration: string
  attendees: number
  status: 'upcoming' | 'ongoing' | 'completed'
}

export default function MentorDashboard() {
  
  useEffect(() => {
    document.title = 'Mentor Dashboard | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Guide and support FIRST Global students')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Guide and support FIRST Global students'
      document.head.appendChild(meta)
    }
  }, [])


  const { user } = useAuth()
  const [cohort, setCohort] = useState<string>('')
  const [students, setStudents] = useState<Student[]>([])
  const [pendingMedia, setPendingMedia] = useState<MediaItem[]>([])
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    pendingApprovals: 0,
    upcomingSessions: 0,
    completionRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMentorData()
  }, [])

  const fetchMentorData = async () => {
    setLoading(true)
    try {
      // Fetch mentor's cohort
      const cohortResponse = await fetch('/api/mentor/cohort')
      if (cohortResponse.ok) {
        const cohortData = await cohortResponse.json()
        setCohort(cohortData.data?.cohort || '')
      }

      // Fetch students in cohort
      const studentsResponse = await fetch('/api/mentor/students')
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        setStudents(studentsData.data?.students || [])
      }

      // Fetch pending media for approval
      const mediaResponse = await fetch('/api/mentor/media/pending')
      if (mediaResponse.ok) {
        const mediaData = await mediaResponse.json()
        setPendingMedia(mediaData.data?.media || [])
      }

      // Fetch training sessions
      const sessionsResponse = await fetch('/api/mentor/sessions')
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        setSessions(sessionsData.data?.sessions || [])
      }

      // Calculate stats
      setStats({
        totalStudents: students.length,
        activeStudents: students.filter((s: Student) => {
          if (!s.lastActive) return false
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          return new Date(s.lastActive) > weekAgo
        }).length,
        pendingApprovals: pendingMedia.length,
        upcomingSessions: sessions.filter((s: TrainingSession) => s.status === 'upcoming').length,
        completionRate: students.length > 0
          ? Math.round(students.reduce((sum: number, s: Student) => 
              sum + (s.progress.completedModules / s.progress.totalModules * 100), 0) / students.length)
          : 0
      })
    } catch (error) {
      console.error('Failed to fetch mentor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveMedia = async (mediaId: string) => {
    try {
      await fetch(`/api/mentor/media/${mediaId}/approve`, {
        method: 'PUT'
      })
      fetchMentorData()
    } catch (error) {
      console.error('Failed to approve media:', error)
    }
  }

  const handleRejectMedia = async (mediaId: string, feedback: string) => {
    try {
      await fetch(`/api/mentor/media/${mediaId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      })
      fetchMentorData()
    } catch (error) {
      console.error('Failed to reject media:', error)
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
          <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
          <p className="text-muted-foreground">
            {cohort} Cohort • {students.length} Students
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/mentor/resources/create"
            className="px-4 py-2 border rounded-lg hover:bg-muted"
          >
            Create Resource
          </Link>
          <Link
            href="/mentor/sessions/schedule"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Schedule Session
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="lg:col-span-2 bg-card rounded-lg border">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">Your Students</h2>
            <Link
              href="/mentor/students"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {students.slice(0, 5).map((student) => (
              <div key={student.id} className="p-4 hover:bg-muted/50">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {student.firstName?.[0] || student.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {student.firstName || student.lastName
                          ? `${student.firstName || ''} ${student.lastName || ''}`.trim()
                          : student.email.split('@')[0]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {student.school || 'No school info'} • {student.year || 'N/A'}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">
                            {student.progress.completedModules}/{student.progress.totalModules} modules
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">
                            {student.progress.averageScore}% avg
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/mentor/students/${student.id}`}
                    className="px-3 py-1 text-sm border rounded hover:bg-muted"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Pending Approvals</h2>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {pendingMedia.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No pending approvals</p>
              </div>
            ) : (
              pendingMedia.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        By {item.author.firstName || item.author.email.split('@')[0]}
                      </p>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Submitted {new Date(item.submittedAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveMedia(item.id)}
                      className="flex-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
                    >
                      <ThumbsUp className="inline h-3 w-3 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const feedback = prompt('Rejection feedback:')
                        if (feedback) handleRejectMedia(item.id, feedback)
                      }}
                      className="flex-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                    >
                      <ThumbsDown className="inline h-3 w-3 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Training Sessions */}
      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Upcoming Training Sessions</h2>
          <Link
            href="/mentor/sessions"
            className="text-sm text-primary hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sessions.filter(s => s.status === 'upcoming').slice(0, 3).map((session) => (
              <div key={session.id} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{session.title}</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{session.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>{session.attendees} registered</span>
                  </div>
                </div>
                <button className="w-full mt-3 px-3 py-1 bg-primary text-primary-foreground rounded text-sm">
                  Start Session
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
