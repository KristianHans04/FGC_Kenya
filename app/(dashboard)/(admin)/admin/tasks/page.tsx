/**
 * @file app/(dashboard)/(admin)/admin/tasks/page.tsx
 * @description Comprehensive task management system with CRUD operations
 * @author Team Kenya Dev
 */

'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  ArrowUpCircle,
  ArrowRightCircle,
  ArrowDownCircle,
  UserPlus,
  Send,
  Trash2,
  Edit2,
  MoreHorizontal,
  Bell,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isAfter, isBefore, addDays, startOfDay, endOfDay } from 'date-fns'
import { cn } from '@/app/lib/utils'

// Task types
interface Task {
  id: string
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED'
  dueDate?: string
  assignedTo?: {
    id: string
    firstName?: string
    lastName?: string
    email: string
  }
  createdBy: {
    id: string
    firstName?: string
    lastName?: string
    email: string
  }
  tags: string[]
  createdAt: string
  completedAt?: string
}

// Priority configuration
const priorityConfig = {
  LOW: { label: 'Low', icon: ArrowDownCircle, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  MEDIUM: { label: 'Medium', icon: ArrowRightCircle, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  HIGH: { label: 'High', icon: ArrowUpCircle, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  URGENT: { label: 'Urgent', icon: AlertCircle, color: 'text-red-600 bg-red-50 border-red-200 animate-pulse' }
}

// Status configuration
const statusConfig = {
  TODO: { label: 'To Do', icon: Circle, color: 'text-gray-600 bg-gray-50' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock, color: 'text-blue-600 bg-blue-50' },
  REVIEW: { label: 'Under Review', icon: AlertCircle, color: 'text-purple-600 bg-purple-50' },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, color: 'text-green-600 bg-green-50' }
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [filterPriority, setFilterPriority] = useState<string>('ALL')
  const [filterUser, setFilterUser] = useState<string>('ALL')
  const [dateFilter, setDateFilter] = useState<string>('ALL')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Task['priority'],
    status: 'TODO' as Task['status'],
    dueDate: '',
    assignedToId: '',
    tags: [] as string[],
    sendEmail: true,
    sendPush: true
  })

  useEffect(() => {
    document.title = 'Task Management | FIRST Global Team Kenya'
    fetchTasks()
    fetchUsers()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
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

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleCreateTask = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newTask = await response.json()
        
        // Send notifications if enabled
        if (formData.sendEmail && formData.assignedToId) {
          await fetch('/api/admin/emails/send-task-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: formData.assignedToId,
              task: newTask.data
            })
          })
        }

        if (formData.sendPush && formData.assignedToId) {
          // Push notification endpoint (to be implemented)
          await fetch('/api/notifications/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: formData.assignedToId,
              title: 'New Task Assigned',
              message: `You have been assigned: ${formData.title}`,
              type: 'task'
            })
          }).catch(() => {})
        }

        fetchTasks()
        setShowCreateModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleUpdateTask = async () => {
    if (!editingTask) return

    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchTasks()
        setEditingTask(null)
        resetForm()
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: '',
      assignedToId: '',
      tags: [],
      sendEmail: true,
      sendPush: true
    })
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      assignedToId: task.assignedTo?.id || '',
      tags: task.tags,
      sendEmail: false,
      sendPush: false
    })
    setShowCreateModal(true)
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !task.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Status filter
    if (filterStatus !== 'ALL' && task.status !== filterStatus) {
      return false
    }

    // Priority filter
    if (filterPriority !== 'ALL' && task.priority !== filterPriority) {
      return false
    }

    // User filter
    if (filterUser !== 'ALL' && task.assignedTo?.id !== filterUser) {
      return false
    }

    // Date filter
    if (dateFilter !== 'ALL' && task.dueDate) {
      const dueDate = new Date(task.dueDate)
      const today = new Date()
      
      switch (dateFilter) {
        case 'OVERDUE':
          if (!isBefore(dueDate, startOfDay(today))) return false
          break
        case 'TODAY':
          if (!isBefore(dueDate, endOfDay(today)) || !isAfter(dueDate, startOfDay(today))) return false
          break
        case 'WEEK':
          if (!isBefore(dueDate, addDays(today, 7))) return false
          break
      }
    }

    return true
  })

  // Group tasks by status
  const tasksByStatus = {
    TODO: filteredTasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: filteredTasks.filter(t => t.status === 'IN_PROGRESS'),
    REVIEW: filteredTasks.filter(t => t.status === 'REVIEW'),
    COMPLETED: filteredTasks.filter(t => t.status === 'COMPLETED')
  }

  // Task card component
  const TaskCard = ({ task }: { task: Task }) => {
    const PriorityIcon = priorityConfig[task.priority].icon
    const isOverdue = task.dueDate && isBefore(new Date(task.dueDate), new Date()) && task.status !== 'COMPLETED'

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "bg-card border rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-all cursor-pointer",
          isOverdue && "border-red-500 bg-red-50/50"
        )}
        onClick={() => openEditModal(task)}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-card-foreground flex-1 pr-2">{task.title}</h3>
          <div className="flex items-center gap-1">
            <div className={cn("p-1 rounded border", priorityConfig[task.priority].color)}>
              <PriorityIcon className="h-4 w-4" />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteTask(task.id)
              }}
              className="p-1 hover:bg-destructive/10 rounded transition-colors"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </button>
          </div>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {task.tags.map(tag => (
            <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs">
          {task.assignedTo ? (
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs">
                  {task.assignedTo.firstName?.[0] || task.assignedTo.email[0]}
                </span>
              </div>
              <span className="text-muted-foreground">
                {task.assignedTo.firstName || task.assignedTo.email.split('@')[0]}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">Unassigned</span>
          )}

          {task.dueDate && (
            <div className={cn("flex items-center gap-1", isOverdue && "text-red-600 font-medium")}>
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Task Management</h1>
              <p className="text-sm text-muted-foreground">Create and manage tasks for team members</p>
            </div>
            <button
              onClick={() => {
                resetForm()
                setEditingTask(null)
                setShowCreateModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
              />
            </div>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              <option value="ALL">All Status</option>
              {Object.entries(statusConfig).map(([value, config]) => (
                <option key={value} value={value}>{config.label}</option>
              ))}
            </select>

            {/* Priority filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              <option value="ALL">All Priorities</option>
              {Object.entries(priorityConfig).map(([value, config]) => (
                <option key={value} value={value}>{config.label}</option>
              ))}
            </select>

            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              <option value="ALL">All Dates</option>
              <option value="OVERDUE">Overdue</option>
              <option value="TODAY">Due Today</option>
              <option value="WEEK">Due This Week</option>
            </select>

            {/* User filter */}
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              <option value="ALL">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task Board */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">Loading tasks...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
              const StatusIcon = statusConfig[status as Task['status']].icon
              const statusColor = statusConfig[status as Task['status']].color

              return (
                <div key={status} className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <StatusIcon className={cn("h-5 w-5", statusColor)} />
                    <h2 className="font-semibold">
                      {statusConfig[status as Task['status']].label}
                    </h2>
                    <span className="ml-auto text-sm text-muted-foreground">
                      {statusTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    <AnimatePresence>
                      {statusTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </AnimatePresence>
                  </div>

                  {statusTasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No tasks
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Enter task title"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg resize-none"
                      rows={4}
                      placeholder="Enter task description"
                    />
                  </div>

                  {/* Priority and Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        {Object.entries(priorityConfig).map(([value, config]) => (
                          <option key={value} value={value}>{config.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        {Object.entries(statusConfig).map(([value, config]) => (
                          <option key={value} value={value}>{config.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Assignee and Due Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Assign To</label>
                      <select
                        value={formData.assignedToId}
                        onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="">Unassigned</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} - {user.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Due Date</label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <input
                      type="text"
                      placeholder="Enter tags separated by commas"
                      value={formData.tags.join(', ')}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  {/* Notification Options */}
                  {!editingTask && (
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notification Settings
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.sendEmail}
                            onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm">Send email notification to assignee</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.sendPush}
                            onChange={(e) => setFormData({ ...formData, sendPush: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm">Send push notification to assignee</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingTask ? handleUpdateTask : handleCreateTask}
                    disabled={!formData.title}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}