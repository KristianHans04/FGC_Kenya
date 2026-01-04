'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import TaskList from '@/app/components/tasks/TaskList'

export default function StudentTasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Tasks | FIRST Global Team Kenya'
    fetchTasks()
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

  const handleTaskClick = (task: any) => {
    console.log('Task clicked:', task)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-card-foreground">My Tasks</h1>
        </div>

        <TaskList 
          tasks={tasks} 
          loading={loading}
          onTaskUpdate={async (id, data) => {
            try {
              const response = await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              })
              if (response.ok) {
                fetchTasks()
              }
            } catch (error) {
              console.error('Failed to update task:', error)
            }
          }}
        />

        {tasks.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
