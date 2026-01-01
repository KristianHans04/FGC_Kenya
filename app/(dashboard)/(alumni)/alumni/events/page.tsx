'use client'

import { useState, useEffect } from 'react'
import { Users, Award, Calendar, Briefcase, User } from 'lucide-react'


export default function AlumniEventsPage() {
  
  useEffect(() => {
    document.title = 'Alumni Events | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover and join alumni events')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Discover and join alumni events'
      document.head.appendChild(meta)
    }
  }, [])


  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])

  useEffect(() => {
    fetch('/api/alumni/events')
      .then(r => r.ok && r.json())
      .then(d => setData(d?.data || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Alumni Events</h1>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-lg border p-6">
          <p className="text-muted-foreground">
            Events content for FGC Kenya alumni members.
          </p>
        </div>
      )}
    </div>
  )
}
