'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar as CalendarIcon, Repeat } from 'lucide-react'
import CalendarView from '@/app/components/calendar/CalendarView'
import EnhancedEventForm from '@/app/components/calendar/EnhancedEventForm'
import EnhancedBulkEventForm from '@/app/components/calendar/EnhancedBulkEventForm'
import Link from 'next/link'

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showBulkForm, setShowBulkForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Calendar Management | FIRST Global Team Kenya'
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setError(null)
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 2)
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 6)

      const response = await fetch(
        `/api/calendar/events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setEvents(data.data || [])
      } else {
        const errorData = await response.json()
        console.error('[Calendar] Failed to fetch events:', errorData)
        setError(errorData.error || 'Failed to fetch events')
        
        // If unauthorized, show more helpful message
        if (response.status === 401) {
          setError('You need to log in to view the calendar. Please refresh the page and log in.')
        }
      }
    } catch (error) {
      console.error('[Calendar] Error fetching events:', error)
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (formData: any) => {
    try {
      setError(null)
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setShowForm(false)
        fetchEvents()
      } else {
        console.error('[Calendar] Create event error:', result)
        const errorMessage = result.details || result.error || 'Failed to create event'
        alert(`Error: ${errorMessage}`)
        
        if (response.status === 401) {
          setError('Session expired. Please refresh the page and log in again.')
        }
      }
    } catch (error) {
      console.error('[Calendar] Failed to create event:', error)
      alert('Network error. Please check your connection.')
    }
  }

  const handleBulkCreate = async (data: any) => {
    try {
      setError(null)
      const response = await fetch('/api/calendar/events/bulk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (response.ok) {
        alert(result.message)
        setShowBulkForm(false)
        fetchEvents()
      } else {
        console.error('[Calendar] Bulk create error:', result)
        const errorMessage = result.details || result.error || 'Failed to create events'
        alert(`Error: ${errorMessage}`)
      }
    } catch (error) {
      console.error('[Calendar] Failed to create bulk events:', error)
      alert('Network error. Please check your connection.')
    }
  }

  const handleEventClick = (event: any) => {
    // Navigate to event detail page
    window.location.href = `/admin/calendar/events/${event.slug || event.id}`
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Clean Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-6 w-6 text-green-600" />
              <h1 className="text-2xl font-bold text-card-foreground">Calendar Management</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowBulkForm(true)}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Repeat className="h-5 w-5" />
                <span>Bulk Create</span>
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create Event</span>
              </button>
            </div>
          </div>
        </div>

        {/* Event Types Legend */}
        <div className="mb-4 p-3 bg-card border border-border rounded-lg overflow-x-auto">
          <div className="flex items-center gap-3 sm:gap-4 text-sm min-w-max">
            <span className="font-medium text-card-foreground">Event Types:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span className="text-muted-foreground">Meeting</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-600"></div>
              <span className="text-muted-foreground">Workshop</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span className="text-muted-foreground">Competition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span className="text-muted-foreground">Practice</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              <span className="text-muted-foreground">Deadline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
              <span className="text-muted-foreground">Team Building</span>
            </div>
          </div>
        </div>

        {/* Main Calendar */}
        {loading ? (
          <div className="animate-pulse">
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-4">
            <CalendarView
              events={events}
              onEventClick={handleEventClick}
              onDateClick={() => {
                setShowForm(true)
              }}
            />
          </div>
        )}

        {/* Upcoming Events List */}
        <div className="mt-6 bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Upcoming Events</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events
              .filter(e => new Date(e.startDate) >= new Date())
              .slice(0, 6)
              .map(event => (
                <Link
                  key={event.id}
                  href={`/admin/calendar/events/${event.slug || event.id}`}
                  className="block p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors border border-border hover:border-green-600/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-card-foreground line-clamp-2">{event.title}</h3>
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ml-2 ${getEventColor(event.type)}`}></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  {event._count?.attendees > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {event._count.attendees} attendee{event._count.attendees !== 1 ? 's' : ''}
                    </p>
                  )}
                </Link>
              ))}
          </div>
          {events.filter(e => new Date(e.startDate) >= new Date()).length === 0 && (
            <p className="text-muted-foreground text-center py-8">No upcoming events</p>
          )}
        </div>
      </div>

      {showForm && (
        <EnhancedEventForm
          onSubmit={handleCreateEvent}
          onCancel={() => setShowForm(false)}
          isAdmin={true}
        />
      )}

      {showBulkForm && (
        <EnhancedBulkEventForm
          onSubmit={handleBulkCreate}
          onCancel={() => setShowBulkForm(false)}
        />
      )}
    </div>
  )
}

function getEventColor(type: string) {
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