'use client'

import { useState } from 'react'
import { X, Calendar, MapPin, Video, Users } from 'lucide-react'

interface EnhancedEventFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  initialData?: any
  isAdmin?: boolean
}

export default function EnhancedEventForm({ onSubmit, onCancel, initialData, isAdmin = false }: EnhancedEventFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'MEETING',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
    allDay: initialData?.allDay || false,
    location: initialData?.location || '',
    isVirtual: initialData?.isVirtual || false,
    meetingLink: initialData?.meetingLink || '',
    audience: initialData?.audience || 'ALL',
    specificEmails: initialData?.specificEmails?.join(', ') || '',
    targetRoles: initialData?.targetRoles || []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // For all-day events, use only the date part
    let startDate = formData.startDate
    let endDate = formData.endDate || formData.startDate // Default to start date if no end date
    
    if (formData.allDay) {
      startDate = formData.startDate.split('T')[0]
      endDate = formData.endDate ? formData.endDate.split('T')[0] : startDate
    }
    
    onSubmit({
      ...formData,
      startDate,
      endDate: formData.endDate ? endDate : undefined, // Only send if explicitly set
      specificEmails: formData.specificEmails.split(',').map((e: string) => e.trim()).filter(Boolean),
      isPublic: formData.audience === 'ALL'
    })
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

  const eventTypes = [
    { value: 'MEETING', label: 'Meeting', color: 'bg-blue-500' },
    { value: 'WORKSHOP', label: 'Workshop', color: 'bg-purple-500' },
    { value: 'COMPETITION', label: 'Competition', color: 'bg-red-500' },
    { value: 'PRACTICE', label: 'Practice', color: 'bg-green-500' },
    { value: 'DEADLINE', label: 'Deadline', color: 'bg-orange-500' },
    { value: 'TEAM_BUILD', label: 'Team Building', color: 'bg-yellow-500' },
    { value: 'OTHER', label: 'Other', color: 'bg-gray-500' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border-2 border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header with Kenyan flag gradient - black to red to green */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-red-600 to-green-600 opacity-10"></div>
          <div className="relative flex items-center justify-between p-4 border-b-2 border-red-600/20">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-card-foreground">
                {initialData ? 'Edit Event' : 'Create Event'}
              </h2>
            </div>
            <button 
              type="button"
              onClick={onCancel} 
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Event Type with color indicators */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Event Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {eventTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    formData.type === type.value 
                      ? 'border-green-600 bg-green-600/20 shadow-lg shadow-green-600/20' 
                      : 'border-border hover:border-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${type.color} ${
                      formData.type === type.value ? 'ring-2 ring-offset-2 ring-green-600' : ''
                    }`}></div>
                    <span className={`text-sm ${
                      formData.type === type.value ? 'font-semibold text-green-600' : ''
                    }`}>{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
              placeholder="Enter event title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
              placeholder="Add event details..."
            />
          </div>

          {/* All Day Toggle */}
          <div className="bg-muted/50 p-3 rounded-lg border border-border">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.allDay}
                onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                className="w-4 h-4 rounded border-border text-green-600 focus:ring-2 focus:ring-green-600/30"
              />
              <span className="text-sm text-card-foreground font-medium">All day event</span>
            </label>
            <p className="text-xs text-muted-foreground mt-1 ml-7">
              {formData.allDay ? 'Event spans the entire day' : 'Event has specific start and end times'}
            </p>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                {formData.allDay ? 'Start Date' : 'Start Date & Time'} *
              </label>
              <input
                type={formData.allDay ? 'date' : 'datetime-local'}
                required
                value={formData.allDay ? formData.startDate.split('T')[0] : formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                {formData.allDay ? 'End Date' : 'End Date & Time'} <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                type={formData.allDay ? 'date' : 'datetime-local'}
                value={formData.allDay ? formData.endDate.split('T')[0] : formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to use start date
              </p>
            </div>
          </div>

          {/* Location Type */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Event Location *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isVirtual: false })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  !formData.isVirtual 
                    ? 'border-green-600 bg-gradient-to-r from-black/5 via-red-600/5 to-green-600/10 shadow-lg' 
                    : 'border-border hover:border-muted-foreground hover:bg-muted/50'
                }`}
              >
                <MapPin className={`h-5 w-5 mb-1 mx-auto ${!formData.isVirtual ? 'text-green-600' : ''}`} />
                <span className={`text-sm ${!formData.isVirtual ? 'font-semibold text-green-600' : ''}`}>Physical</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isVirtual: true })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.isVirtual 
                    ? 'border-green-600 bg-gradient-to-r from-black/5 via-red-600/5 to-green-600/10 shadow-lg' 
                    : 'border-border hover:border-muted-foreground hover:bg-muted/50'
                }`}
              >
                <Video className={`h-5 w-5 mb-1 mx-auto ${formData.isVirtual ? 'text-green-600' : ''}`} />
                <span className={`text-sm ${formData.isVirtual ? 'font-semibold text-green-600' : ''}`}>Virtual</span>
              </button>
            </div>

            {!formData.isVirtual ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter venue/address"
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
              />
            ) : (
              <input
                type="url"
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
              />
            )}
          </div>

          {/* Audience (Admin only) */}
          {isAdmin && (
            <div className="space-y-3 p-4 bg-red-600/5 border border-red-600/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-red-600" />
                <label className="text-sm font-medium text-card-foreground">
                  Target Audience
                </label>
              </div>
              
              <select
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600"
              >
                {audienceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {formData.audience === 'SPECIFIC' && (
                <textarea
                  rows={2}
                  value={formData.specificEmails}
                  onChange={(e) => setFormData({ ...formData, specificEmails: e.target.value })}
                  placeholder="john@example.com, jane@example.com"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600"
                />
              )}

              {formData.audience === 'ROLES' && (
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.map(role => (
                    <label key={role} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.targetRoles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, targetRoles: [...formData.targetRoles, role] })
                          } else {
                            setFormData({ ...formData, targetRoles: formData.targetRoles.filter((r: string) => r !== role) })
                          }
                        }}
                        className="rounded border-border text-red-600 focus:ring-2 focus:ring-red-600/30"
                      />
                      <span className="text-sm text-card-foreground">{role}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-muted text-card-foreground rounded-lg hover:bg-muted/80 transition-colors border border-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {initialData ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}