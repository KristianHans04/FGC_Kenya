'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import CalendarView from '@/app/components/calendar/CalendarView'
import EventForm from '@/app/components/calendar/EventForm'

export default function AdminCalendarPage() {
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Calendar Management | FIRST Global Team Kenya'
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 2)
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 6)

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

  const handleCreateEvent = async (formData: any) => {
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        setShowForm(false)
        fetchEvents()
      }
    } catch (error) {
      console.error('Failed to create event:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-card-foreground">Calendar Management</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create Event</span>
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse">
            <div className="h-96 bg-muted rounded"></div>
          </div>
        ) : (
          <CalendarView
            events={events}
            onEventClick={(event) => console.log('Event:', event)}
            onDateClick={(date) => console.log('Date:', date)}
          />
        )}
      </div>

      {showForm && (
        <EventForm
          onSubmit={handleCreateEvent}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
