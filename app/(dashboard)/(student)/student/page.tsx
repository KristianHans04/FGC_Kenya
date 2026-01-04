'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, CheckSquare, FileText, Users } from 'lucide-react'

export default function StudentDashboard() {
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [myTasks, setMyTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Dashboard | FIRST Global Team Kenya'
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [eventsRes, tasksRes] = await Promise.all([
        fetch('/api/calendar/events'),
        fetch('/api/tasks')
      ])

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        const upcoming = (eventsData.data || [])
          .filter((e: any) => new Date(e.startDate) >= new Date())
          .slice(0, 3)
        setUpcomingEvents(upcoming)
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        const myTodos = (tasksData.data || [])
          .filter((t: any) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED')
          .slice(0, 5)
        setMyTasks(myTodos)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-card-foreground mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/student/calendar"
            className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <Calendar className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-card-foreground mb-1">Calendar</h3>
            <p className="text-sm text-muted-foreground">View team events</p>
          </Link>

          <Link
            href="/student/tasks"
            className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <CheckSquare className="h-8 w-8 text-accent-dark mb-3" />
            <h3 className="font-semibold text-card-foreground mb-1">Tasks</h3>
            <p className="text-sm text-muted-foreground">Manage your tasks</p>
          </Link>

          <Link
            href="/student/resources"
            className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <FileText className="h-8 w-8 text-secondary mb-3" />
            <h3 className="font-semibold text-card-foreground mb-1">Resources</h3>
            <p className="text-sm text-muted-foreground">Access materials</p>
          </Link>

          <Link
            href="/student/team"
            className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <Users className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-card-foreground mb-1">Team</h3>
            <p className="text-sm text-muted-foreground">Connect with team</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-card-foreground">Upcoming Events</h2>
              <Link
                href="/student/calendar"
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <h4 className="font-medium text-card-foreground mb-1">{event.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.startDate).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-card-foreground">My Tasks</h2>
              <Link
                href="/student/tasks"
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : myTasks.length > 0 ? (
              <div className="space-y-3">
                {myTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-card-foreground">{task.title}</h4>
                      <span className="text-xs px-2 py-1 bg-card rounded">
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pending tasks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
