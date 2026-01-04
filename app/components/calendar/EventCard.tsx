'use client'

import { Calendar, Clock, MapPin, Users, Video, Trash2, Edit } from 'lucide-react'
import { format } from 'date-fns'

interface EventCardProps {
  event: any
  onClick?: () => void
  onUpdate?: (id: string, data: any) => void
  onDelete?: (id: string) => void
  onRSVP?: (status: string) => void
  userStatus?: string
  canEdit?: boolean
}

export default function EventCard({ event, onClick, onUpdate, onDelete, onRSVP, userStatus, canEdit = false }: EventCardProps) {
  const getEventColor = (type: string) => {
    switch (type) {
      case 'MEETING':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'WORKSHOP':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'COMPETITION':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'PRACTICE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'DEADLINE':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'TEAM_BUILD':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div 
      onClick={onClick}
      className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-card-foreground">{event.title}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getEventColor(event.type)}`}>
          {event.type}
        </span>
      </div>

      {event.description && (
        <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
      )}

      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {format(new Date(event.startDate), 'MMM d, yyyy')}
        </div>
        
        {!event.allDay && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(new Date(event.startDate), 'h:mm a')}
          </div>
        )}

        {event.location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {event.location}
          </div>
        )}

        {event.isVirtual && (
          <div className="flex items-center gap-1">
            <Video className="h-3 w-3" />
            Virtual
          </div>
        )}

        {event._count?.attendees > 0 && (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {event._count.attendees}
          </div>
        )}
      </div>

      {onRSVP && (
        <div className="flex gap-2 mt-3 pt-3 border-t">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRSVP('ACCEPTED')
            }}
            className={`flex-1 px-2 py-1 text-xs rounded ${
              userStatus === 'ACCEPTED' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Attending
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRSVP('MAYBE')
            }}
            className={`flex-1 px-2 py-1 text-xs rounded ${
              userStatus === 'MAYBE' 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Maybe
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRSVP('DECLINED')
            }}
            className={`flex-1 px-2 py-1 text-xs rounded ${
              userStatus === 'DECLINED' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Not Going
          </button>
        </div>
      )}

      {canEdit && (
        <div className="flex gap-2 mt-3 pt-3 border-t">
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (onUpdate) onUpdate(event.id, event)
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded"
          >
            <Edit className="h-3 w-3" />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (onDelete) onDelete(event.id)
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}