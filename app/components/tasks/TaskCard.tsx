'use client'

import { Calendar, Clock, Tag, AlertCircle, CheckCircle, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface TaskCardProps {
  task: any
  onEdit?: (task: any) => void
  onDelete?: (id: string) => void
  onStatusChange?: (id: string, status: string) => void
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600 bg-red-100'
      case 'HIGH':
        return 'text-orange-600 bg-orange-100'
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100'
      case 'LOW':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'REVIEW':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  return (
    <div className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-card-foreground">{task.title}</h4>
        {getStatusIcon(task.status)}
      </div>

      {task.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(new Date(task.dueDate), 'MMM d')}
            </div>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-muted rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {task.assignedTo && (
          <div className="text-xs text-muted-foreground">
            Assigned to: {task.assignedTo.firstName || task.assignedTo.email}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-3 pt-3 border-t">
        {onStatusChange && (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className="flex-1 text-xs px-2 py-1 border rounded bg-background"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="p-1 hover:bg-muted rounded"
          >
            <Edit className="h-3 w-3" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 hover:bg-red-100 text-red-600 rounded"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}