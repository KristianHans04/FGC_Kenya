'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, MapPin, Video, Users, Clock, Edit2, Trash2, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.slug) {
      fetchEvent(params.slug as string)
    }
  }, [params.slug])

  const fetchEvent = async (slug: string) => {
    try {
      const response = await fetch(`/api/calendar/events/${slug}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setEvent(data.data)
        document.title = `${data.data.title} | FIRST Global Team Kenya`
      } else {
        console.error('Failed to fetch event')
      }
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    try {
      const response = await fetch(`/api/calendar/events/${params.slug}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        router.push('/admin/calendar')
      } else {
        alert('Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-card-foreground mb-4">Event Not Found</h1>
          <Link href="/admin/calendar" className="text-primary hover:underline">
            Back to Calendar
          </Link>
        </div>
      </div>
    )
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'MEETING': return 'bg-blue-600'
      case 'WORKSHOP': return 'bg-purple-600'
      case 'COMPETITION': return 'bg-red-600'
      case 'PRACTICE': return 'bg-green-600'
      case 'DEADLINE': return 'bg-orange-600'
      case 'TEAM_BUILD': return 'bg-yellow-600'
      default: return 'bg-gray-600'
    }
  }

  const getAttendanceStats = () => {
    if (!event.attendees) return { accepted: 0, declined: 0, pending: 0 }
    
    return event.attendees.reduce((acc: any, attendee: any) => {
      acc[attendee.status.toLowerCase()] = (acc[attendee.status.toLowerCase()] || 0) + 1
      return acc
    }, { accepted: 0, declined: 0, pending: 0, maybe: 0 })
  }

  const stats = getAttendanceStats()

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/calendar"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-card-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Calendar
          </Link>
        </div>

        {/* Main Event Card */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {/* Event Header with Event Type Color */}
          <div className={`${getEventTypeColor(event.type)} p-6`}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur">
                    {event.type.replace('_', ' ')}
                  </span>
                  {event.isPublic && (
                    <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-white backdrop-blur">
                      Public Event
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{event.title}</h1>
                <p className="text-white/80 text-sm">
                  Created by {event.createdBy?.firstName} {event.createdBy?.lastName}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/admin/calendar/events/${params.slug}/edit`)}
                  className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 bg-white/20 hover:bg-red-600 text-white rounded-lg transition-colors backdrop-blur"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="p-6 space-y-6">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-card-foreground">
                  {event.allDay ? 'All Day Event' : 'Scheduled Event'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}
                  {!event.allDay && (
                    <>
                      {' at '}
                      {format(new Date(event.startDate), 'h:mm a')}
                      {' - '}
                      {format(new Date(event.endDate), 'h:mm a')}
                    </>
                  )}
                </p>
                {event.endDate && new Date(event.endDate).toDateString() !== new Date(event.startDate).toDateString() && (
                  <p className="text-sm text-muted-foreground">
                    Ends: {format(new Date(event.endDate), 'EEEE, MMMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              {event.isVirtual ? (
                <>
                  <Video className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-card-foreground">Virtual Event</p>
                    {event.meetingLink && (
                      <a
                        href={event.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Join Meeting
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-card-foreground">Physical Event</p>
                    <p className="text-sm text-muted-foreground">{event.location || 'Location TBD'}</p>
                  </div>
                </>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <h3 className="font-medium text-card-foreground mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {/* Attendance Stats */}
            <div>
              <h3 className="font-medium text-card-foreground mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Attendance
              </h3>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-card-foreground">
                    <strong>{stats.accepted}</strong> Attending
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-card-foreground">
                    <strong>{stats.maybe || 0}</strong> Maybe
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-card-foreground">
                    <strong>{stats.declined}</strong> Not Going
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-card-foreground">
                    <strong>{stats.pending}</strong> No Response
                  </span>
                </div>
              </div>

              {/* Attendee List */}
              {event.attendees && event.attendees.length > 0 && (
                <div className="border border-border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-card-foreground mb-3">Attendee List</h4>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border">
                        <tr>
                          <th className="text-left py-2">Name</th>
                          <th className="text-left py-2">Email</th>
                          <th className="text-left py-2">Status</th>
                          <th className="text-left py-2">Responded</th>
                        </tr>
                      </thead>
                      <tbody>
                        {event.attendees.map((attendee: any) => (
                          <tr key={attendee.id} className="border-b border-border/50">
                            <td className="py-2">
                              {attendee.user?.firstName} {attendee.user?.lastName}
                            </td>
                            <td className="py-2 text-muted-foreground">
                              {attendee.user?.email}
                            </td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                attendee.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                attendee.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
                                attendee.status === 'MAYBE' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {attendee.status}
                              </span>
                            </td>
                            <td className="py-2 text-muted-foreground">
                              {attendee.respondedAt 
                                ? format(new Date(attendee.respondedAt), 'MMM d, h:mm a')
                                : '-'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Event Metadata */}
            <div className="pt-4 border-t border-border text-sm text-muted-foreground">
              <p>Created: {format(new Date(event.createdAt), 'MMMM d, yyyy h:mm a')}</p>
              {event.updatedAt !== event.createdAt && (
                <p>Last Updated: {format(new Date(event.updatedAt), 'MMMM d, yyyy h:mm a')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}