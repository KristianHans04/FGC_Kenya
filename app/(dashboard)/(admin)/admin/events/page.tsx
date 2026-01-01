'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Plus,
  MapPin,
  Clock,
  Users,
  Edit,
  Trash2
} from 'lucide-react'

export default function AdminEventsPage() {
  
  useEffect(() => {
    document.title = 'Event Management | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Manage FIRST Global events and competitions')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Manage FIRST Global events and competitions'
      document.head.appendChild(meta)
    }
  }, [])


  const [events] = useState([
    {
      id: 1,
      title: 'FIRST Global Challenge 2025',
      date: '2025-09-15',
      location: 'Athens, Greece',
      type: 'Competition',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Team Selection Interviews',
      date: '2025-03-20',
      location: 'Nairobi, Kenya',
      type: 'Selection',
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Robotics Workshop',
      date: '2025-04-10',
      location: 'Online',
      type: 'Training',
      status: 'upcoming'
    }
  ])

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Events Management</h1>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <Calendar className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold">12</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Events</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <Clock className="h-8 w-8 text-green-500" />
            <span className="text-2xl font-bold">5</span>
          </div>
          <p className="text-sm text-muted-foreground">Upcoming</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <Users className="h-8 w-8 text-purple-500" />
            <span className="text-2xl font-bold">450</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Attendees</p>
        </div>
      </div>

      <div className="bg-card rounded-lg">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
        </div>
        
        <div className="divide-y">
          {events.map((event) => (
            <div key={event.id} className="p-4 hover:bg-muted/50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </span>
                  </div>
                  <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                    {event.type}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-muted rounded">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 hover:bg-muted rounded text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}