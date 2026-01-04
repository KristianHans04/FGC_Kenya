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
      case 'MEETING': return 'bg-blue-500 text-white'
      case 'WORKSHOP': return 'bg-purple-500 text-white'
      case 'COMPETITION': return 'bg-red-500 text-white'
      case 'PRACTICE': return 'bg-green-500 text-white'
      case 'DEADLINE': return 'bg-orange-500 text-white'
      case 'TEAM_BUILD': return 'bg-yellow-500 text-black'
      default: return 'bg-gray-500 text-white'
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
        <div className="bg-card rounded-lg border-2 border-green-500/20 overflow-hidden">
          {/* Event Header with Kenyan Flag Colors */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-red-600 to-green-600 opacity-10"></div>
            <div className="relative p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                    {event.isPublic && (
                      <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Public Event
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-card-foreground mb-2">{event.title}</h1>
                  <p className="text-muted-foreground">
                    Created by {event.createdBy?.firstName} {event.createdBy?.lastName}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/admin/calendar/events/${params.slug}/edit`)}
                    className="p-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
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
                Attendance ({event.attendees?.length || 0})
              </h3>
              
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-green-100 rounded-lg p-3 text-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-900">{stats.accepted}</p>
                  <p className="text-xs text-green-700">Accepted</p>
                </div>
                <div className="bg-yellow-100 rounded-lg p-3 text-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-yellow-900">{stats.maybe || 0}</p>
                  <p className="text-xs text-yellow-700">Maybe</p>
                </div>
                <div className="bg-red-100 rounded-lg p-3 text-center">
                  <XCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-red-900">{stats.declined}</p>
                  <p className="text-xs text-red-700">Declined</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                  <Clock className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  <p className="text-xs text-gray-700">Pending</p>
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