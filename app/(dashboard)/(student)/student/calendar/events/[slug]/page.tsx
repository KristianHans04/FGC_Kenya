'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Video, Users, Clock, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export default function StudentEventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [showFeedback, setShowFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    if (resolvedParams.slug) {
      fetchEvent(resolvedParams.slug)
      fetchCurrentUser()
    }
  }, [resolvedParams.slug])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setCurrentUserId(data.data?.id || data.id)
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error)
    }
  }

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

  const handleRSVP = async (status: string) => {
    setRsvpLoading(true)
    setShowFeedback(null)
    
    try {
      const response = await fetch(`/api/calendar/events/${event.id}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      })
      
      if (response.ok) {
        // Refresh event to get updated attendance
        await fetchEvent(resolvedParams.slug)
        
        // Show success feedback
        const messages = {
          ACCEPTED: 'You\'re attending this event!',
          MAYBE: 'Your response has been marked as maybe.',
          DECLINED: 'You\'ve declined this event.'
        }
        setShowFeedback({ 
          type: 'success', 
          message: messages[status as keyof typeof messages] || 'Response updated!'
        })
        
        // Hide feedback after 3 seconds
        setTimeout(() => setShowFeedback(null), 3000)
      } else {
        setShowFeedback({ type: 'error', message: 'Failed to update response' })
        setTimeout(() => setShowFeedback(null), 3000)
      }
    } catch (error) {
      console.error('RSVP error:', error)
      setShowFeedback({ type: 'error', message: 'Failed to update response' })
      setTimeout(() => setShowFeedback(null), 3000)
    } finally {
      setRsvpLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
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
          <Link href="/student/calendar" className="text-primary hover:underline">
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
    if (!event.attendees) return { accepted: 0, declined: 0, pending: 0, maybe: 0 }
    
    return event.attendees.reduce((acc: any, attendee: any) => {
      acc[attendee.status.toLowerCase()] = (acc[attendee.status.toLowerCase()] || 0) + 1
      return acc
    }, { accepted: 0, declined: 0, pending: 0, maybe: 0 })
  }

  const stats = getAttendanceStats()
  const userAttendance = event.attendees?.find((a: any) => a.userId === currentUserId)

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/student/calendar"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-card-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Calendar
          </Link>
        </div>

        {/* Feedback Message */}
        {showFeedback && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 transition-all ${
            showFeedback.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {showFeedback.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            {showFeedback.message}
          </div>
        )}

        {/* Main Event Card */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {/* Event Header with Event Type Color */}
          <div className={`${getEventTypeColor(event.type)} p-6`}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
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
              
              {/* RSVP Section */}
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 min-w-[200px]">
                <p className="text-white/90 text-sm font-medium mb-3">Your Response:</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleRSVP('ACCEPTED')}
                    disabled={rsvpLoading}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                      userAttendance?.status === 'ACCEPTED'
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-white/20 text-white hover:bg-green-500/30'
                    } ${rsvpLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Attending
                  </button>
                  <button
                    onClick={() => handleRSVP('MAYBE')}
                    disabled={rsvpLoading}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                      userAttendance?.status === 'MAYBE'
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-white/20 text-white hover:bg-yellow-500/30'
                    } ${rsvpLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <AlertCircle className="h-4 w-4" />
                    Maybe
                  </button>
                  <button
                    onClick={() => handleRSVP('DECLINED')}
                    disabled={rsvpLoading}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                      userAttendance?.status === 'DECLINED'
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-white/20 text-white hover:bg-red-500/30'
                    } ${rsvpLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <XCircle className="h-4 w-4" />
                    Not Going
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="p-6 space-y-6">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
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
                Attendance Summary
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