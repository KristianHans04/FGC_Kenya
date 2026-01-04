'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import TaskList from '@/app/components/tasks/TaskList'

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Task Management | FIRST Global Team Kenya'
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-card-foreground">Task Management</h1>
        </div>

        {loading ? (
          <div className="animate-pulse grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}
