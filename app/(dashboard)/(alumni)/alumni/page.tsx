'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Award, Calendar, Briefcase, User, BookOpen, TrendingUp, MessageSquare } from 'lucide-react'

interface AlumniStats {
  totalAlumni: number
  activeMembers: number
  jobPostings: number
  upcomingEvents: number
}

interface RecentActivity {
  id: string
  type: 'job_posted' | 'event_created' | 'story_shared' | 'profile_updated'
  title: string
  timestamp: string
  user: {
    name: string
    avatar?: string
  }
}

export default function AlumniDashboard() {

  useEffect(() => {
    document.title = 'Alumni Dashboard | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Connect, collaborate, and grow with fellow FIRST Global alumni')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Connect, collaborate, and grow with fellow FIRST Global alumni'
      document.head.appendChild(meta)
    }
  }, [])


  const [stats, setStats] = useState<AlumniStats>({
    totalAlumni: 0,
    activeMembers: 0,
    jobPostings: 0,
    upcomingEvents: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlumniData()
  }, [])

  const fetchAlumniData = async () => {
    setLoading(true)
    try {
      // Fetch stats from various alumni endpoints
      const [networkRes, jobsRes, eventsRes] = await Promise.all([
        fetch('/api/alumni/network'),
        fetch('/api/alumni/jobs'),
        fetch('/api/alumni/events')
      ])

      const networkData = networkRes.ok ? await networkRes.json() : { data: [] }
      const jobsData = jobsRes.ok ? await jobsRes.json() : { data: [] }
      const eventsData = eventsRes.ok ? await eventsRes.json() : { data: [] }

      setStats({
        totalAlumni: networkData.data?.length || 0,
        activeMembers: Math.floor((networkData.data?.length || 0) * 0.7), // Mock active percentage
        jobPostings: jobsData.data?.length || 0,
        upcomingEvents: eventsData.data?.filter((e: any) => new Date(e.date) > new Date()).length || 0
      })

      // Mock recent activity data
      setRecentActivity([
        {
          id: '1',
          type: 'job_posted',
          title: 'Software Engineer position at TechCorp',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: { name: 'Alice Johnson' }
        },
        {
          id: '2',
          type: 'event_created',
          title: 'Alumni Networking Mixer',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          user: { name: 'Bob Smith' }
        },
        {
          id: '3',
          type: 'story_shared',
          title: 'My journey from FIRST Robotics to Google',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          user: { name: 'Carol Davis' }
        }
      ])
    } catch (error) {
      console.error('Failed to fetch alumni data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'job_posted': return <Briefcase className="h-4 w-4" />
      case 'event_created': return <Calendar className="h-4 w-4" />
      case 'story_shared': return <BookOpen className="h-4 w-4" />
      case 'profile_updated': return <User className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold">Alumni Dashboard</h1>
          <p className="text-muted-foreground">
            Connect, collaborate, and grow with fellow FIRST Global alumni
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/alumni/profile"
            className="px-4 py-2 border rounded-lg hover:bg-muted"
          >
            Update Profile
          </Link>
          <Link
            href="/alumni/network"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Explore Network
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalAlumni}</p>
              <p className="text-sm text-muted-foreground">Total Alumni</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activeMembers}</p>
              <p className="text-sm text-muted-foreground">Active Members</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.jobPostings}</p>
              <p className="text-sm text-muted-foreground">Job Postings</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
              <p className="text-sm text-muted-foreground">Upcoming Events</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-3">
            <Link
              href="/alumni/jobs"
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors"
            >
              <Briefcase className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Browse Job Opportunities</p>
                <p className="text-sm text-muted-foreground">Find career opportunities posted by alumni</p>
              </div>
            </Link>

            <Link
              href="/alumni/events"
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors"
            >
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Upcoming Events</p>
                <p className="text-sm text-muted-foreground">Join networking events and meetups</p>
              </div>
            </Link>

            <Link
              href="/alumni/mentorship"
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors"
            >
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Mentorship Program</p>
                <p className="text-sm text-muted-foreground">Connect with mentors and mentees</p>
              </div>
            </Link>

            <Link
              href="/alumni/stories"
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors"
            >
              <BookOpen className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium">Success Stories</p>
                <p className="text-sm text-muted-foreground">Read inspiring stories from fellow alumni</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                <p>No recent activity</p>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-muted/50">
                  <div className="flex gap-3">
                    <div className="p-1.5 bg-muted rounded">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.user.name} • {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}