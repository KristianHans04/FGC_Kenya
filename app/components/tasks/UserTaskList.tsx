/**
 * @file app/components/tasks/UserTaskList.tsx
 * @description Task list component for user dashboards
 * @author Team Kenya Dev
 */

'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Calendar,
  ChevronRight,
  ArrowUpCircle,
  ArrowRightCircle,
  ArrowDownCircle
} from 'lucide-react'
import { format, isBefore } from 'date-fns'
import { cn } from '@/app/lib/utils'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED'
  dueDate?: string
  tags: string[]
  createdAt: string
}

interface UserTaskListProps {
  userId?: string
  limit?: number
  showHeader?: boolean
  compact?: boolean
}

const priorityConfig = {
  LOW: { label: 'Low', icon: ArrowDownCircle, color: 'text-blue-600' },
  MEDIUM: { label: 'Medium', icon: ArrowRightCircle, color: 'text-yellow-600' },
  HIGH: { label: 'High', icon: ArrowUpCircle, color: 'text-orange-600' },
  URGENT: { label: 'Urgent', icon: AlertCircle, color: 'text-red-600 animate-pulse' }
}

const statusConfig = {
  TODO: { label: 'To Do', icon: Circle, color: 'text-gray-600' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock, color: 'text-blue-600' },
  REVIEW: { label: 'Review', icon: AlertCircle, color: 'text-purple-600' },
  COMPLETED: { label: 'Done', icon: CheckCircle2, color: 'text-green-600' }
}

export default function UserTaskList({ 
  userId, 
  limit = 5, 
  showHeader = true,
  compact = false 
}: UserTaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')

  useEffect(() => {
    fetchTasks()
  }, [userId])

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams()
      if (userId) params.append('assignedToId', userId)
      
      const response = await fetch(`/api/tasks?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (taskId: string, newStatus: Task['status']) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      if (selectedStatus === 'ALL') return true
      return task.status === selectedStatus
    })
    .sort((a, b) => {
      // Sort by priority then due date
      const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      return 0
    })
    .slice(0, limit)

  // Calculate stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    overdue: tasks.filter(t => 
      t.dueDate && 
      isBefore(new Date(t.dueDate), new Date()) && 
      t.status !== 'COMPLETED'
    ).length
  }

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (compact) {
    // Compact view for dashboard widgets
    return (
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-card-foreground">My Tasks</h3>
          {stats.total > 0 && (
            <span className="text-sm text-muted-foreground">
              {stats.todo + stats.inProgress} active
            </span>
          )}
        </div>

        {filteredTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tasks assigned
          </p>
        ) : (
          <div className="space-y-2">
            {filteredTasks.slice(0, 3).map(task => {
              const StatusIcon = statusConfig[task.status].icon
              const PriorityIcon = priorityConfig[task.priority].icon
              const isOverdue = task.dueDate && 
                isBefore(new Date(task.dueDate), new Date()) && 
                task.status !== 'COMPLETED'

              return (
                <div 
                  key={task.id} 
                  className={cn(
                    "p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors",
                    isOverdue && "border-l-4 border-red-500"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={cn("h-4 w-4", statusConfig[task.status].color)} />
                        <p className="text-sm font-medium line-clamp-1">{task.title}</p>
                      </div>
                      {task.dueDate && (
                        <div className={cn(
                          "flex items-center gap-1 mt-1",
                          isOverdue ? "text-red-600" : "text-muted-foreground"
                        )}>
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs">
                            {format(new Date(task.dueDate), 'MMM d')}
                          </span>
                        </div>
                      )}
                    </div>
                    <PriorityIcon className={cn("h-4 w-4", priorityConfig[task.priority].color)} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {stats.total > 3 && (
          <Link 
            href="/dashboard/tasks" 
            className="flex items-center justify-center gap-1 text-sm text-primary hover:underline mt-3"
          >
            View all tasks
            <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    )
  }

  // Full view
  return (
    <div className="bg-card border rounded-lg">
      {showHeader && (
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-card-foreground">My Tasks</h2>
            <Link 
              href="/dashboard/tasks"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{stats.total}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600">To Do</p>
              <p className="text-lg font-bold text-blue-600">{stats.todo}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-xs text-yellow-600">In Progress</p>
              <p className="text-lg font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-600">Completed</p>
              <p className="text-lg font-bold text-green-600">{stats.completed}</p>
            </div>
            {stats.overdue > 0 && (
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-red-600">Overdue</p>
                <p className="text-lg font-bold text-red-600">{stats.overdue}</p>
              </div>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mt-4">
            {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={cn(
                  "px-3 py-1 rounded text-sm transition-colors",
                  selectedStatus === status 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-muted/70"
                )}
              >
                {status === 'ALL' ? 'All' : statusConfig[status as Task['status']].label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-6">
        {filteredTasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {selectedStatus === 'ALL' ? 'No tasks assigned' : `No ${statusConfig[selectedStatus as Task['status']].label.toLowerCase()} tasks`}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(task => {
              const StatusIcon = statusConfig[task.status].icon
              const PriorityIcon = priorityConfig[task.priority].icon
              const isOverdue = task.dueDate && 
                isBefore(new Date(task.dueDate), new Date()) && 
                task.status !== 'COMPLETED'

              return (
                <div 
                  key={task.id} 
                  className={cn(
                    "p-4 bg-muted/20 rounded-lg border hover:border-primary/50 transition-all",
                    isOverdue && "border-red-500 bg-red-50/20"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const nextStatus = {
                            TODO: 'IN_PROGRESS',
                            IN_PROGRESS: 'REVIEW',
                            REVIEW: 'COMPLETED',
                            COMPLETED: 'TODO'
                          }[task.status] as Task['status']
                          handleStatusUpdate(task.id, nextStatus)
                        }}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        <StatusIcon className={cn("h-5 w-5", statusConfig[task.status].color)} />
                      </button>
                      <div>
                        <h3 className="font-medium text-card-foreground">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1", priorityConfig[task.priority].color)}>
                        <PriorityIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map(tag => (
                        <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {task.dueDate && (
                      <div className={cn(
                        "flex items-center gap-1 text-sm",
                        isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"
                      )}>
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}