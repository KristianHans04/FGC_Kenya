'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar, CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import CalendarView from '@/app/components/calendar/CalendarView'
import EventCard from '@/app/components/calendar/EventCard'
import EventForm from '@/app/components/calendar/EventForm'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function StudentCalendarPage() {
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState<{ eventId: string, type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    document.title = 'Calendar | FIRST Global Team Kenya'
    fetchCurrentUser()
    fetchEvents()
  }, [])

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

  const fetchEvents = async () => {
    try {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 3)

      const response = await fetch(
        `/api/calendar/events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )
      if (response.ok) {
        const data = await response.json()
        setEvents(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRSVP = async (eventId: string, status: string) => {
    setRsvpLoading(eventId)
    setShowFeedback(null)
    
    try {
      const response = await fetch(`/api/calendar/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      })
      
      if (response.ok) {
        await fetchEvents()
        
        const messages = {
          ACCEPTED: 'You\'re attending!',
          MAYBE: 'Marked as maybe',
          DECLINED: 'Not attending'
        }
        
        setShowFeedback({ 
          eventId,
          type: 'success', 
          message: messages[status as keyof typeof messages] || 'Response updated!'
        })
        
        setTimeout(() => setShowFeedback(null), 2000)
      } else {
        setShowFeedback({ eventId, type: 'error', message: 'Failed to update' })
        setTimeout(() => setShowFeedback(null), 2000)
      }
    } catch (error) {
      console.error('RSVP error:', error)
      setShowFeedback({ eventId, type: 'error', message: 'Failed to update' })
      setTimeout(() => setShowFeedback(null), 2000)
    } finally {
      setRsvpLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-card-foreground">Team Calendar</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CalendarView
              events={events}
              onEventClick={(event: any) => {
                // Navigate to event detail page
                router.push(`/student/calendar/events/${event.slug || event.id}`)
              }}
              onDateClick={(date) => console.log('Date clicked:', date)}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-card-foreground mb-4">Upcoming Events</h2>
            <div className="space-y-4">
              {events
                .filter((e: any) => new Date(e.startDate) >= new Date())
                .slice(0, 5)
                .map((event: any) => {
                  const userAttendance = event.attendees?.find((a: any) => a.userId === currentUserId)
                  return (
                    <div key={event.id} className="bg-card border border-border rounded-lg p-4">
                      <Link 
                        href={`/student/calendar/events/${event.slug || event.id}`}
                        className="block hover:bg-muted/50 -m-4 p-4 rounded-lg transition-colors"
                      >
                        <h3 className="font-semibold text-card-foreground mb-2">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {new Date(event.startDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      </Link>
                      
                      {/* RSVP Buttons */}
                      <div className="space-y-2">
                        {showFeedback?.eventId === event.id && (
                          <div className={`p-2 rounded-lg text-xs flex items-center gap-1 ${
                            showFeedback?.type === 'success' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {showFeedback?.type === 'success' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            {showFeedback?.message}
                          </div>
                        )}
                        <div className="flex gap-2 pt-3 border-t border-border">
                          <button
                            onClick={() => handleRSVP(event.id, 'ACCEPTED')}
                            disabled={rsvpLoading === event.id}
                            className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-all flex items-center justify-center gap-1 ${
                              userAttendance?.status === 'ACCEPTED'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-muted hover:bg-green-600/20 hover:text-green-600'
                            } ${rsvpLoading === event.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Attending
                          </button>
                          <button
                            onClick={() => handleRSVP(event.id, 'MAYBE')}
                            disabled={rsvpLoading === event.id}
                            className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-all flex items-center justify-center gap-1 ${
                              userAttendance?.status === 'MAYBE'
                                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                : 'bg-muted hover:bg-yellow-600/20 hover:text-yellow-600'
                            } ${rsvpLoading === event.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <HelpCircle className="h-4 w-4" />
                            Maybe
                          </button>
                          <button
                            onClick={() => handleRSVP(event.id, 'DECLINED')}
                            disabled={rsvpLoading === event.id}
                            className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-all flex items-center justify-center gap-1 ${
                              userAttendance?.status === 'DECLINED'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-muted hover:bg-red-600/20 hover:text-red-600'
                            } ${rsvpLoading === event.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <XCircle className="h-4 w-4" />
                            Not Going
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              {events.filter((e: any) => new Date(e.startDate) >= new Date()).length === 0 && (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
          <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <EventCard
              event={selectedEvent}
              onRSVP={(status) => handleRSVP(selectedEvent.id, status)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
