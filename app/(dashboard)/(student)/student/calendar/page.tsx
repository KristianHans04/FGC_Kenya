'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import CalendarView from '@/app/components/calendar/CalendarView'
import EventCard from '@/app/components/calendar/EventCard'
import EventForm from '@/app/components/calendar/EventForm'

export default function StudentCalendarPage() {
  const [events, setEvents] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Calendar | FIRST Global Team Kenya'
    fetchEvents()
  }, [])

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
    try {
      const response = await fetch(`/api/calendar/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (response.ok) {
        fetchEvents()
        setSelectedEvent(null)
      }
    } catch (error) {
      console.error('RSVP error:', error)
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
              onEventClick={setSelectedEvent}
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
                  const userAttendance = event.attendees.find((a: any) => a.userId === event.createdBy.id)
                  return (
                    <EventCard
                      key={event.id}
                      event={event}
                      onRSVP={(status) => handleRSVP(event.id, status)}
                      userStatus={userAttendance?.status}
                    />
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
