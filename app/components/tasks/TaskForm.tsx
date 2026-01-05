'use client'

import { useState } from 'react'
import { X, CheckSquare, Calendar, Tag, Flag, Activity } from 'lucide-react'

interface TaskFormProps {
  task?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export default function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'MEDIUM',
    status: task?.status || 'TODO',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    tags: task?.tags?.join(', ') || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map((t: string) => t.trim()) : []
    })
  }

  const priorityColors = {
    LOW: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-600', label: 'Low Priority' },
    MEDIUM: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-600', label: 'Medium Priority' },
    HIGH: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-600', label: 'High Priority' },
    URGENT: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-600', label: 'Urgent' }
  }

  const statusColors = {
    TODO: { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-600' },
    IN_PROGRESS: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-600' },
    REVIEW: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-600' },
    COMPLETED: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-600' },
    CANCELLED: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-600' }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-lg border-2 border-border max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with Kenyan flag gradient - black to red to green */}
        <div className="relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-red-600 to-green-600 opacity-10"></div>
          <div className="relative flex items-center justify-between p-4 border-b-2 border-red-600/20">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-card-foreground">
                {task ? 'Edit Task' : 'Create New Task'}
              </h2>
            </div>
            <button 
              onClick={onCancel} 
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title with accent */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
              placeholder="Enter task title..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
              rows={3}
              placeholder="Add task details..."
            />
          </div>

          {/* Priority Selection with Visual Indicators */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-red-600" />
              <label className="text-sm font-medium text-card-foreground">
                Priority Level *
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(priorityColors).map(([value, colors]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: value })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.priority === value 
                      ? `${colors.bg} ${colors.border} shadow-lg` 
                      : 'border-border hover:border-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    formData.priority === value ? colors.text : 'text-card-foreground'
                  }`}>
                    {colors.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Status Selection with Visual Indicators */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              <label className="text-sm font-medium text-card-foreground">
                Task Status *
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED'].map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData({ ...formData, status })}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    formData.status === status 
                      ? `${statusColors[status as keyof typeof statusColors].bg} ${statusColors[status as keyof typeof statusColors].border} shadow-lg` 
                      : 'border-border hover:border-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <div className={`text-sm ${
                    formData.status === status 
                      ? `font-semibold ${statusColors[status as keyof typeof statusColors].text}` 
                      : 'text-card-foreground'
                  }`}>
                    {status.replace('_', ' ')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Due Date with accent */}
          <div className="p-4 bg-red-600/5 border border-red-600/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-red-600" />
              <label className="text-sm font-medium text-card-foreground">
                Due Date
              </label>
            </div>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600"
            />
            {formData.dueDate && (
              <p className="text-xs text-muted-foreground mt-2">
                Task due: {new Date(formData.dueDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            )}
          </div>

          {/* Tags with visual flair */}
          <div className="p-4 bg-green-600/5 border border-green-600/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-green-600" />
              <label className="text-sm font-medium text-card-foreground">
                Tags <span className="text-muted-foreground text-xs">(comma separated)</span>
              </label>
            </div>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
              placeholder="robotics, programming, competition"
            />
            {formData.tags && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.split(',').map((tag: string, i: number) => tag.trim() && (
                  <span key={i} className="px-2 py-1 bg-green-600/10 text-green-600 text-xs rounded-full">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

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
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}