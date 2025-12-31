import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 

import type { Metadata } from 'next'
import { generateMetadata } from '@/app/lib/utils/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Mentoring Sessions',
  description: 'Manage your mentoring sessions',
  noIndex: true,
})
nk'
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
  title: string
  description: string
  type: 'online' | 'in-person' | 'hybrid'
  date: string
  startTime: string
  endTime: string
  location?: string
  meetingLink?: string
  cohorts: string[]
  registeredCount: number
  maxCapacity: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  materials: Array<{
    name: string
    url: string
  }>
}

export default function MentorSessionsPage() {
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

  // Mock data
  const mockSessions: Session[] = [
    {
      id: '1',
      title: 'Advanced Programming Techniques',
      description: 'Deep dive into advanced programming patterns for robotics',
      type: 'online',
      date: '2024-03-15',
      startTime: '14:00',
      endTime: '16:00',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      cohorts: ['2024'],
      registeredCount: 18,
      maxCapacity: 25,
      status: 'upcoming',
      materials: [
        { name: 'Presentation Slides', url: '/materials/advanced-prog.pdf' },
        { name: 'Code Examples', url: '/materials/code-examples.zip' }
      ]
    },
    {
      id: '2',
      title: 'Mechanical Design Workshop',
      description: 'Hands-on workshop for robot mechanical design',
      type: 'in-person',
      date: '2024-03-20',
      startTime: '10:00',
      endTime: '13:00',
      location: 'Nairobi Tech Hub, Room 301',
      cohorts: ['2024', '2025'],
      registeredCount: 22,
      maxCapacity: 20,
      status: 'upcoming',
      materials: [
        { name: 'Design Templates', url: '/materials/design-templates.pdf' }
      ]
    },
    {
      id: '3',
      title: 'Team Building & Communication',
      description: 'Developing soft skills for effective teamwork',
      type: 'hybrid',
      date: '2024-03-10',
      startTime: '15:00',
      endTime: '17:00',
      location: 'Main Campus Hall',
      meetingLink: 'https://meet.google.com/xyz-abcd-efg',
      cohorts: ['2024'],
      registeredCount: 30,
      maxCapacity: 30,
      status: 'completed',
      materials: [
        { name: 'Workshop Materials', url: '/materials/team-building.pdf' }
      ]
    }
  ]

  const displaySessions = sessions.length > 0 ? sessions : mockSessions

  const filteredSessions = displaySessions.filter(session => {
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Sessions</span>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{displaySessions.length}</div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Upcoming</span>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {displaySessions.filter(s => s.status === 'upcoming').length}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Students</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {displaySessions.reduce((acc, s) => acc + s.registeredCount, 0)}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Completion Rate</span>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">92%</div>
        </div>
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
                  <span>{session.startTime} - {session.endTime}</span>
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
                  <div>
                    <span className="text-muted-foreground">Registered: </span>
                    <span className="font-medium">
                      {session.registeredCount}/{session.maxCapacity}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cohorts: </span>
                    <span className="font-medium">{session.cohorts.join(', ')}</span>
                  </div>
                </div>
                {session.materials.length > 0 && (
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