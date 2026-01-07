'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Calendar,
  Clock,
  Users,
  Video,
  MapPin,
  Plus,
  Filter,
  ChevronRight,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface Session {
  id: string
  slug?: string
  title: string
  description: string
  type: string
  date: string
  endDate?: string
  startTime?: string
  endTime?: string
  duration?: string
  location?: string
  meetingLink?: string
  isVirtual?: boolean
  cohorts?: string[]
  registeredCount?: number
  attendees?: number
  maxCapacity?: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  materials?: Array<{
    name: string
    url: string
  }>
}

export default function MentorSessionsPage() {
  
  useEffect(() => {
    document.title = 'Mentoring Sessions | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Manage your mentoring sessions')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Manage your mentoring sessions'
      document.head.appendChild(meta)
    }
  }, [])


  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/mentor/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data.data?.sessions || [])
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }


  const filteredSessions = sessions.filter(session => {
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus
    const matchesType = filterType === 'all' || session.type === filterType
    return matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'ongoing':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'online':
        return <Video className="h-4 w-4" />
      case 'in-person':
        return <MapPin className="h-4 w-4" />
      case 'hybrid':
        return <Users className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Training Sessions</h1>
          <p className="text-muted-foreground">
            Manage and schedule your training sessions
          </p>
        </div>
        <Link
          href="/mentor/sessions/schedule"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Schedule Session
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Types</option>
            <option value="online">Online</option>
            <option value="in-person">In-Person</option>
            <option value="hybrid">Hybrid</option>
          </select>

          <button className="px-4 py-2 border rounded-lg hover:bg-muted flex items-center gap-2 ml-auto">
            <Calendar className="h-4 w-4" />
            Calendar View
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No sessions found</p>
          </div>
        ) : (
          filteredSessions.map(session => (
            <div key={session.id} className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{session.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {session.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-muted rounded">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 hover:bg-muted rounded text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(session.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{session.duration || (session.startTime && session.endTime ? `${session.startTime} - ${session.endTime}` : 'Time TBD')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {getTypeIcon(session.type)}
                  <span className="capitalize">{session.type}</span>
                </div>
              </div>

              {session.location && (
                <div className="flex items-center gap-2 text-sm mb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{session.location}</span>
                </div>
              )}

              {session.meetingLink && (
                <div className="flex items-center gap-2 text-sm mb-4">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <a href={session.meetingLink} className="text-primary hover:underline">
                    Join Meeting
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm">
                  {(session.attendees !== undefined || session.registeredCount !== undefined) && (
                    <div>
                      <span className="text-muted-foreground">Registered: </span>
                      <span className="font-medium">
                        {session.attendees || session.registeredCount || 0}
                        {session.maxCapacity ? `/${session.maxCapacity}` : ''}
                      </span>
                    </div>
                  )}
                  {session.cohorts && session.cohorts.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Cohorts: </span>
                      <span className="font-medium">{session.cohorts.join(', ')}</span>
                    </div>
                  )}
                </div>
                {session.materials && session.materials.length > 0 && (
                  <Link
                    href={`/mentor/sessions/${session.id}`}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    View Materials
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}