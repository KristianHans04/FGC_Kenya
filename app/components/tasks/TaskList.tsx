'use client'

import { useState } from 'react'
import { Plus, Filter } from 'lucide-react'
import TaskCard from './TaskCard'
import TaskForm from './TaskForm'

interface Task {
  id: string
  title: string
  description?: string
  priority: string
  status: string
  dueDate?: string
  assignedTo?: any
  createdBy: any
  tags: string[]
}

interface TaskListProps {
  tasks?: Task[]
  onTaskCreate?: (task: any) => void
  onTaskUpdate?: (id: string, task: any) => void
  onTaskDelete?: (id: string) => void
  canCreate?: boolean
  loading?: boolean
}

export default function TaskList({
  tasks = [],
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  canCreate = false,
  loading = false
}: TaskListProps) {
  const [showForm, setShowForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState('all')

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    return task.status === filter
  })

  const tasksByStatus = {
    TODO: filteredTasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: filteredTasks.filter(t => t.status === 'IN_PROGRESS'),
    REVIEW: filteredTasks.filter(t => t.status === 'REVIEW'),
    COMPLETED: filteredTasks.filter(t => t.status === 'COMPLETED')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card rounded-lg border p-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Tasks</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 border rounded-lg bg-background text-sm"
          >
            <option value="all">All Tasks</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        
        {canCreate && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <div key={status} className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground px-2">
              {status.replace('_', ' ')} ({statusTasks.length})
            </h3>
            <div className="space-y-2 min-h-[200px]">
              {statusTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(task) => {
                    setSelectedTask(task)
                    setShowForm(true)
                  }}
                  onDelete={onTaskDelete}
                  onStatusChange={(id, status) => {
                    if (onTaskUpdate) {
                      onTaskUpdate(id, { status })
                    }
                  }}
                />
              ))}
              {statusTasks.length === 0 && (
                <div className="p-4 border-2 border-dashed border-muted rounded-lg text-center text-muted-foreground text-sm">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <TaskForm
          task={selectedTask}
          onSubmit={(data) => {
            if (selectedTask && onTaskUpdate) {
              onTaskUpdate(selectedTask.id, data)
            } else if (onTaskCreate) {
              onTaskCreate(data)
            }
            setShowForm(false)
            setSelectedTask(null)
          }}
          onCancel={() => {
            setShowForm(false)
            setSelectedTask(null)
          }}
        />
      )}
    </div>
  )
}