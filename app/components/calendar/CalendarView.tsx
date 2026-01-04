'use client'

import { useState } from 'react'
import { cn } from '@/app/lib/utils/cn'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import EventCard from './EventCard'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  type: string
  startDate: string
  endDate: string
  allDay: boolean
  location?: string
  isVirtual: boolean
  meetingLink?: string
  isPublic: boolean
  createdBy: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  }
  attendees: any[]
}

interface CalendarViewProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
}

export default function CalendarView({ events, onEventClick, onDateClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week'>('month')

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - monthStart.getDay())
  const endDate = new Date(monthEnd)
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()))

  const weeks = []
  let currentWeek = []
  let day = new Date(startDate)

  while (day <= endDate) {
    currentWeek.push(new Date(day))
    if (day.getDay() === 6) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    day.setDate(day.getDate() + 1)
  }

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      return eventStart <= dayEnd && eventEnd >= dayStart
    })
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const today = () => {
    setCurrentDate(new Date())
  }

  const isToday = (date: Date) => {
    const now = new Date()
    return date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-card-foreground">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={today}
            className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
          >
            Today
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5 text-card-foreground" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5 text-card-foreground" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="text-xs font-medium text-muted-foreground text-center py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {weeks.map((week, weekIndex) =>
            week.map((date, dayIndex) => {
              const dayEvents = getEventsForDay(date)
              const isCurrentMonthDay = isCurrentMonth(date)
              const isTodayDate = isToday(date)

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  onClick={() => onDateClick && onDateClick(date)}
                  className={cn(
                    "min-h-24 p-2 border border-border rounded-lg cursor-pointer transition-colors",
                    isCurrentMonthDay ? "bg-card hover:bg-muted/50" : "bg-muted/20 hover:bg-muted/40",
                    isTodayDate && "ring-2 ring-primary"
                  )}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    isCurrentMonthDay ? "text-card-foreground" : "text-muted-foreground",
                    isTodayDate && "text-primary"
                  )}>
                    {date.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick(event)
                        }}
                        className={cn(
                          "text-xs px-2 py-1 rounded truncate cursor-pointer transition-colors font-medium",
                          event.type === 'MEETING' && "bg-blue-100 text-blue-800 hover:bg-blue-200",
                          event.type === 'WORKSHOP' && "bg-purple-100 text-purple-800 hover:bg-purple-200",
                          event.type === 'COMPETITION' && "bg-red-100 text-red-800 hover:bg-red-200",
                          event.type === 'PRACTICE' && "bg-green-100 text-green-800 hover:bg-green-200",
                          event.type === 'DEADLINE' && "bg-orange-100 text-orange-800 hover:bg-orange-200",
                          event.type === 'TEAM_BUILD' && "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
                          event.type === 'OTHER' && "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground px-2">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
