'use client'

import { useState } from 'react'
import { X, Calendar, Users, Repeat } from 'lucide-react'
import { format, addDays } from 'date-fns'

interface BulkEventFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

export default function BulkEventForm({ onSubmit, onCancel }: BulkEventFormProps) {
  const [formData, setFormData] = useState({
    title: 'Training Day',
    description: '',
    type: 'PRACTICE',
    startDate: new Date().toISOString().split('T')[0],
    numberOfDays: 1,
    skipWeekends: true,
    allDay: true,
    startTime: '09:00',
    endTime: '17:00',
    location: '',
    isVirtual: false,
    meetingLink: '',
    audience: 'ALL',
    specificEmails: '',
    roles: [] as string[]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const events = []
    let currentDate = new Date(formData.startDate)
    let dayCounter = 0
    
    while (dayCounter < formData.numberOfDays) {
      // Skip weekends if requested
      if (formData.skipWeekends) {
        while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          currentDate = addDays(currentDate, 1)
        }
      }
      
      const eventData = {
        title: `${formData.title} - Day ${dayCounter + 1}/${formData.numberOfDays}`,
        description: formData.description,
        type: formData.type,
        startDate: formData.allDay 
          ? new Date(currentDate).toISOString()
          : new Date(`${format(currentDate, 'yyyy-MM-dd')}T${formData.startTime}`).toISOString(),
        endDate: formData.allDay
          ? new Date(currentDate).toISOString()
          : new Date(`${format(currentDate, 'yyyy-MM-dd')}T${formData.endTime}`).toISOString(),
        allDay: formData.allDay,
        location: formData.location,
        isVirtual: formData.isVirtual,
        meetingLink: formData.meetingLink,
        audience: formData.audience,
        specificEmails: formData.specificEmails.split(',').map((e: string) => e.trim()).filter(Boolean),
        targetRoles: formData.roles,
        isPublic: formData.audience === 'ALL'
      }
      
      events.push(eventData)
      currentDate = addDays(currentDate, 1)
      dayCounter++
    }
    
    onSubmit({ events, bulk: true })
  }

  const audienceOptions = [
    { value: 'ALL', label: 'Everyone' },
    { value: 'STUDENTS', label: 'All Students' },
    { value: 'MENTORS', label: 'All Mentors' },
    { value: 'ALUMNI', label: 'All Alumni' },
    { value: 'ADMINS', label: 'All Admins' },
    { value: 'SPECIFIC', label: 'Specific People' },
    { value: 'ROLES', label: 'Specific Roles' }
  ]

  const roleOptions = ['SUPER_ADMIN', 'ADMIN', 'MENTOR', 'STUDENT', 'ALUMNI', 'USER']

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-red-500/10 via-black/10 to-green-500/10">
          <div className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">Bulk Event Creation</h2>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-card-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Event Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  Event Title Prefix *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Training Day"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Will be appended with "Day X/Y"
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  Event Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                >
                  <option value="PRACTICE">Practice</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="MEETING">Meeting</option>
                  <option value="COMPETITION">Competition</option>
                  <option value="DEADLINE">Deadline</option>
                  <option value="TEAM_BUILD">Team Building</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                Description (optional)
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-card-foreground">Schedule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  Number of Days *
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  required
                  value={formData.numberOfDays}
                  onChange={(e) => setFormData({ ...formData, numberOfDays: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.skipWeekends}
                    onChange={(e) => setFormData({ ...formData, skipWeekends: e.target.checked })}
                    className="rounded border-border focus:ring-2 focus:ring-green-500/30"
                  />
                  <span className="text-sm text-card-foreground">Skip weekends</span>
                </label>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={formData.allDay}
                  onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                  className="rounded border-border focus:ring-2 focus:ring-green-500/30"
                />
                <span className="text-sm text-card-foreground">All day events</span>
              </label>

              {!formData.allDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      required={!formData.allDay}
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      required={!formData.allDay}
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-card-foreground">Location</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!formData.isVirtual}
                  onChange={() => setFormData({ ...formData, isVirtual: false })}
                  className="border-border focus:ring-2 focus:ring-green-500/30"
                />
                <span className="text-sm text-card-foreground">Physical Event</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.isVirtual}
                  onChange={() => setFormData({ ...formData, isVirtual: true })}
                  className="border-border focus:ring-2 focus:ring-green-500/30"
                />
                <span className="text-sm text-card-foreground">Virtual Event</span>
              </label>

              {!formData.isVirtual ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter physical location"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                />
              ) : (
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                />
              )}
            </div>
          </div>

          {/* Audience */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-card-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Audience
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Who should see this event? *
              </label>
              <select
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
              >
                {audienceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.audience === 'SPECIFIC' && (
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  Email addresses (comma separated)
                </label>
                <textarea
                  rows={2}
                  value={formData.specificEmails}
                  onChange={(e) => setFormData({ ...formData, specificEmails: e.target.value })}
                  placeholder="john@example.com, jane@example.com"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                />
              </div>
            )}

            {formData.audience === 'ROLES' && (
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Select roles
                </label>
                <div className="space-y-2">
                  {roleOptions.map(role => (
                    <label key={role} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, roles: [...formData.roles, role] })
                          } else {
                            setFormData({ ...formData, roles: formData.roles.filter(r => r !== role) })
                          }
                        }}
                        className="rounded border-border focus:ring-2 focus:ring-green-500/30"
                      />
                      <span className="text-sm text-card-foreground">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-muted text-card-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 via-black to-green-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Create {formData.numberOfDays} Events
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}