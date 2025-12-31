'use client'

import { useState, useEffect } from 'react'
import { BookOpen, FileText, Video, Download, Search } from 'lucide-react'


export default function StudentResourcesPage() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/student/resources')
      if (response.ok) {
        const data = await response.json()
        setResources(data.data?.resources || [])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Learning Resources</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          ['Programming Guide', 'Robotics Manual', 'Competition Rules'].map((title, i) => (
            <div key={i} className="bg-card rounded-lg border p-6">
              <FileText className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground mb-4">Essential resource for FGC students</p>
              <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                <Download className="h-4 w-4 inline mr-2" />
                Download
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
