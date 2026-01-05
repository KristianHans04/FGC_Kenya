'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, MapPin, Video, Save, X } from 'lucide-react'
import { EventType } from '@prisma/client'

export default function EditEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [event, setEvent] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'MEETING' as EventType,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    allDay: false,
    location: '',
    isVirtual: false,
    meetingLink: '',
    isPublic: true
  })

  useEffect(() => {
    fetchEvent()
  }, [])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/calendar/events/${resolvedParams.slug}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const eventData = data.data
        setEvent(eventData)
        
        const startDate = new Date(eventData.startDate)
        const endDate = eventData.endDate ? new Date(eventData.endDate) : startDate
        
        setFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          type: eventData.type || 'MEETING',
          startDate: startDate.toISOString().split('T')[0],
          startTime: eventData.allDay ? '' : startDate.toTimeString().slice(0, 5),
          endDate: endDate.toISOString().split('T')[0],
          endTime: eventData.allDay ? '' : endDate.toTimeString().slice(0, 5),
          allDay: eventData.allDay || false,
          location: eventData.location || '',
          isVirtual: eventData.isVirtual || false,
          meetingLink: eventData.meetingLink || '',
          isPublic: eventData.isPublic !== false
        })
        
        document.title = `Edit ${eventData.title} | FIRST Global Team Kenya`
      } else {
        console.error('Failed to fetch event')
        router.push('/admin/calendar')
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      router.push('/admin/calendar')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const startDateTime = formData.allDay
        ? new Date(formData.startDate)
        : new Date(`${formData.startDate}T${formData.startTime}`)
      
      const endDateTime = formData.endDate
        ? (formData.allDay
            ? new Date(formData.endDate)
            : new Date(`${formData.endDate}T${formData.endTime || formData.startTime}`))
        : startDateTime

      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        allDay: formData.allDay,
        location: formData.location || undefined,
        isVirtual: formData.isVirtual,
        meetingLink: formData.isVirtual && formData.meetingLink ? formData.meetingLink : null,
        isPublic: formData.isPublic
      }

      const response = await fetch(`/api/calendar/events/${resolvedParams.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      })

      if (response.ok) {
        router.push(`/admin/calendar/events/${resolvedParams.slug}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update event')
      }
    } catch (error) {
      console.error('Error updating event:', error)
      alert('Failed to update event')
    } finally {
      setSaving(false)
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'MEETING': return 'bg-blue-600 hover:bg-blue-700'
      case 'WORKSHOP': return 'bg-purple-600 hover:bg-purple-700'
      case 'COMPETITION': return 'bg-red-600 hover:bg-red-700'
      case 'PRACTICE': return 'bg-green-600 hover:bg-green-700'
      case 'DEADLINE': return 'bg-orange-600 hover:bg-orange-700'
      case 'TEAM_BUILD': return 'bg-yellow-600 hover:bg-yellow-700'
      default: return 'bg-gray-600 hover:bg-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/admin/calendar/events/${resolvedParams.slug}`)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-card-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Event
          </button>
          <h1 className="text-2xl font-bold text-card-foreground">Edit Event</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-card-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Event Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-card-foreground"
              required
            >
              <option value="MEETING">Meeting</option>
              <option value="WORKSHOP">Workshop</option>
              <option value="COMPETITION">Competition</option>
              <option value="PRACTICE">Practice</option>
              <option value="DEADLINE">Deadline</option>
              <option value="TEAM_BUILD">Team Building</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-card-foreground min-h-[100px] resize-none"
              placeholder="Event description..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allDay"
                checked={formData.allDay}
                onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                className="rounded border-border"
              />
              <label htmlFor="allDay" className="text-sm text-card-foreground">
                All Day Event
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-card-foreground"
                  required
                />
              </div>
              {!formData.allDay && (
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-card-foreground"
                    required={!formData.allDay}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  End Date (optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-card-foreground"
                />
              </div>
              {!formData.allDay && formData.endDate && (
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-card-foreground"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isVirtual"
                checked={formData.isVirtual}
                onChange={(e) => setFormData({ ...formData, isVirtual: e.target.checked })}
                className="rounded border-border"
              />
              <label htmlFor="isVirtual" className="text-sm text-card-foreground">
                Virtual Event
              </label>
            </div>

            {formData.isVirtual ? (
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  <Video className="h-4 w-4 inline mr-2" />
                  Meeting Link
                </label>
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-card-foreground"
                  placeholder="https://..."
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-card-foreground"
                  placeholder="Event location..."
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="rounded border-border"
            />
            <label htmlFor="isPublic" className="text-sm text-card-foreground">
              Public Event (visible to all users)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
                saving ? 'bg-gray-400' : getEventTypeColor(formData.type)
              }`}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/admin/calendar/events/${resolvedParams.slug}`)}
              className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}