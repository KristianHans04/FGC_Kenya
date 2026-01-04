'use client'

import { useState, useMemo } from 'react'
import { X, Calendar, Users, Repeat, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWeekend, addDays, addWeeks } from 'date-fns'

interface EnhancedBulkEventFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

type RepeatPattern = 'none' | 'daily' | 'weekly' | 'monthly' | 'weekdays'

export default function EnhancedBulkEventForm({ onSubmit, onCancel }: EnhancedBulkEventFormProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [lastClickedDate, setLastClickedDate] = useState<Date | null>(null)
  const [repeatPattern, setRepeatPattern] = useState<RepeatPattern>('none')
  const [repeatCount, setRepeatCount] = useState(4)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null)
  
  const [formData, setFormData] = useState({
    titleTemplate: '{date} Training Session',
    description: '',
    type: 'PRACTICE',
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

  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })
    
    // Add padding for the first week
    const firstDayOfWeek = start.getDay()
    const paddingDays = []
    for (let i = 0; i < firstDayOfWeek; i++) {
      paddingDays.push(null)
    }
    
    return [...paddingDays, ...days]
  }, [currentMonth])

  // Handle date selection with shift-click and touch support
  const handleDateClick = (date: Date, event: React.MouseEvent | React.TouchEvent) => {
    if (!date) return

    if ('shiftKey' in event && event.shiftKey && lastClickedDate) {
      // Shift-click: select range
      const start = lastClickedDate < date ? lastClickedDate : date
      const end = lastClickedDate < date ? date : lastClickedDate
      const range = eachDayOfInterval({ start, end })
      
      const newDates = [...selectedDates]
      range.forEach(d => {
        const exists = newDates.findIndex(selected => isSameDay(selected, d))
        if (exists === -1) {
          newDates.push(d)
        }
      })
      setSelectedDates(newDates)
    } else if ('ctrlKey' in event && (event.ctrlKey || event.metaKey)) {
      // Ctrl/Cmd-click: toggle single date
      const exists = selectedDates.findIndex(d => isSameDay(d, date))
      if (exists >= 0) {
        setSelectedDates(selectedDates.filter((_, i) => i !== exists))
      } else {
        setSelectedDates([...selectedDates, date])
      }
    } else {
      // Regular click/touch: toggle single date
      const exists = selectedDates.findIndex(d => isSameDay(d, date))
      if (exists >= 0) {
        setSelectedDates(selectedDates.filter((_, i) => i !== exists))
      } else {
        setSelectedDates([...selectedDates, date])
      }
    }
    
    setLastClickedDate(date)
  }

  // Handle touch drag for mobile date range selection
  const handleTouchStart = (date: Date, event: React.TouchEvent) => {
    if (!date) return
    event.preventDefault()
    setIsDragging(true)
    setDragStartDate(date)
    
    // Start with this date selected
    const exists = selectedDates.findIndex(d => isSameDay(d, date))
    if (exists === -1) {
      setSelectedDates([...selectedDates, date])
    }
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!isDragging || !dragStartDate) return
    event.preventDefault()
    
    // Get element at touch position
    const touch = event.touches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    
    if (element && element.getAttribute('data-date')) {
      const dateStr = element.getAttribute('data-date')
      const touchedDate = new Date(dateStr!)
      
      if (!isNaN(touchedDate.getTime())) {
        // Select range from start to current
        const start = dragStartDate < touchedDate ? dragStartDate : touchedDate
        const end = dragStartDate < touchedDate ? touchedDate : dragStartDate
        const range = eachDayOfInterval({ start, end })
        
        const newDates = [...selectedDates.filter(d => !range.some(r => isSameDay(r, d)))]
        range.forEach(d => {
          const exists = newDates.findIndex(selected => isSameDay(selected, d))
          if (exists === -1) {
            newDates.push(d)
          }
        })
        setSelectedDates(newDates)
      }
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setDragStartDate(null)
  }

  // Apply repeat pattern
  const applyRepeatPattern = () => {
    if (!selectedDates.length || repeatPattern === 'none') return

    const newDates = [...selectedDates]
    const baseDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime())

    baseDates.forEach(baseDate => {
      for (let i = 1; i <= repeatCount; i++) {
        let nextDate: Date | null = null

        switch (repeatPattern) {
          case 'daily':
            nextDate = addDays(baseDate, i)
            break
          case 'weekly':
            nextDate = addWeeks(baseDate, i)
            break
          case 'monthly':
            nextDate = new Date(baseDate)
            nextDate.setMonth(nextDate.getMonth() + i)
            break
          case 'weekdays':
            let daysAdded = 0
            let currentDate = baseDate
            while (daysAdded < i) {
              currentDate = addDays(currentDate, 1)
              if (!isWeekend(currentDate)) {
                daysAdded++
              }
            }
            nextDate = currentDate
            break
        }

        if (nextDate && !newDates.find(d => isSameDay(d, nextDate!))) {
          newDates.push(nextDate)
        }
      }
    })

    setSelectedDates(newDates.sort((a, b) => a.getTime() - b.getTime()))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedDates.length === 0) {
      alert('Please select at least one date')
      return
    }
    
    const events = selectedDates.sort((a, b) => a.getTime() - b.getTime()).map((date, index) => {
      // Process title template
      const title = formData.titleTemplate
        .replace('{date}', format(date, 'MMM d'))
        .replace('{index}', (index + 1).toString())
        .replace('{total}', selectedDates.length.toString())
      
      return {
        title,
        description: formData.description,
        type: formData.type,
        startDate: formData.allDay 
          ? date.toISOString()
          : new Date(`${format(date, 'yyyy-MM-dd')}T${formData.startTime}`).toISOString(),
        endDate: formData.allDay
          ? date.toISOString()
          : new Date(`${format(date, 'yyyy-MM-dd')}T${formData.endTime}`).toISOString(),
        allDay: formData.allDay,
        location: formData.location,
        isVirtual: formData.isVirtual,
        meetingLink: formData.meetingLink,
        audience: formData.audience,
        specificEmails: formData.specificEmails.split(',').map((e: string) => e.trim()).filter(Boolean),
        targetRoles: formData.roles,
        isPublic: formData.audience === 'ALL'
      }
    })
    
    onSubmit({ events, bulk: true })
  }

  const clearAllDates = () => setSelectedDates([])
  const selectAllWeekdays = () => {
    const days = calendarDays.filter(d => d && !isWeekend(d) && isSameMonth(d, currentMonth))
    setSelectedDates(days as Date[])
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
      <div className="bg-card rounded-lg border-2 border-border w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header with Kenyan flag colors */}
        <div className="relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="relative flex items-center justify-between p-4 border-b-2 border-red-600/20">
            <div className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-card-foreground">
                Advanced Bulk Event Creation
              </h2>
            </div>
            <button onClick={onCancel} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Calendar Selection */}
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg border border-border">
                <h3 className="text-md font-medium text-card-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  Select Dates
                </h3>
                
                {/* Instructions */}
                <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="hidden sm:block">Click to select/deselect individual dates</p>
                      <p className="hidden sm:block">Hold Shift + Click to select a range</p>
                      <p className="hidden sm:block">Hold Ctrl/Cmd + Click to add to selection</p>
                      <p className="sm:hidden">Tap to select dates</p>
                      <p className="sm:hidden">Touch and drag to select multiple dates</p>
                    </div>
                  </div>
                </div>

                {/* Calendar Navigation */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h4 className="text-sm font-medium">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-center font-medium text-muted-foreground py-1">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, i) => (
                    <button
                      key={i}
                      type="button"
                      disabled={!day}
                      data-date={day ? day.toISOString() : undefined}
                      onClick={(e) => day && handleDateClick(day, e)}
                      onTouchStart={(e) => day && handleTouchStart(day, e)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      className={`
                        aspect-square flex items-center justify-center rounded-lg text-sm
                        transition-all cursor-pointer select-none
                        ${!day ? 'invisible' : ''}
                        ${day && !isSameMonth(day, currentMonth) ? 'text-muted-foreground/50' : ''}
                        ${day && selectedDates.some(d => isSameDay(d, day)) 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'hover:bg-muted'}
                        ${day && isWeekend(day) ? 'text-red-600/60' : ''}
                        ${isDragging ? 'touch-none' : ''}
                      `}
                    >
                      {day && format(day, 'd')}
                    </button>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={selectAllWeekdays}
                    className="flex-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
                  >
                    Weekdays
                  </button>
                  <button
                    type="button"
                    onClick={clearAllDates}
                    className="flex-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                {/* Selected Dates Count */}
                <div className="mt-3 p-2 bg-green-600/10 border border-green-600/20 rounded">
                  <p className="text-sm text-center font-medium text-green-600">
                    {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>

              {/* Repeat Pattern */}
              <div className="bg-muted/30 p-4 rounded-lg border border-border">
                <h3 className="text-md font-medium text-card-foreground mb-3">
                  Repeat Pattern
                </h3>
                
                <div className="space-y-3">
                  <select
                    value={repeatPattern}
                    onChange={(e) => setRepeatPattern(e.target.value as RepeatPattern)}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
                  >
                    <option value="none">No Repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="weekdays">Weekdays Only</option>
                  </select>

                  {repeatPattern !== 'none' && (
                    <>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">
                          Repeat Count
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="52"
                          value={repeatCount}
                          onChange={(e) => setRepeatCount(parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={applyRepeatPattern}
                        className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Apply Repeat Pattern
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Event Details */}
            <div className="space-y-4">
              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Event Type
                </label>
                <div className="grid grid-cols-2 gap-2">
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

              {/* Title Template */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  Title Template *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titleTemplate}
                  onChange={(e) => setFormData({ ...formData, titleTemplate: e.target.value })}
                  placeholder="e.g., {date} Training Session"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Variables: {'{date}'}, {'{index}'}, {'{total}'}
                </p>
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
                  placeholder="Event details..."
                />
              </div>

              {/* Time Settings */}
              <div className="bg-muted/30 p-3 rounded-lg border border-border">
                <label className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={formData.allDay}
                    onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-green-600 focus:ring-2 focus:ring-green-600/30"
                  />
                  <span className="text-sm font-medium">All day events</span>
                </label>

                {!formData.allDay && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        required={!formData.allDay}
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-2 py-1 text-sm bg-muted border border-border rounded focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        required={!formData.allDay}
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-2 py-1 text-sm bg-muted border border-border rounded focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-card-foreground">
                  Location
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isVirtual: false })}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      !formData.isVirtual 
                        ? 'border-green-600 bg-green-600/10' 
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    Physical
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isVirtual: true })}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      formData.isVirtual 
                        ? 'border-green-600 bg-green-600/10' 
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    Virtual
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

              {/* Audience */}
              <div className="space-y-3 p-3 bg-red-600/5 border border-red-600/20 rounded-lg">
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
                          checked={formData.roles.includes(role)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, roles: [...formData.roles, role] })
                            } else {
                              setFormData({ ...formData, roles: formData.roles.filter(r => r !== role) })
                            }
                          }}
                          className="rounded border-border text-red-600 focus:ring-2 focus:ring-red-600/30"
                        />
                        <span className="text-sm">{role}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-border bg-muted/30">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-muted text-card-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedDates.length === 0}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create {selectedDates.length} Event{selectedDates.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}