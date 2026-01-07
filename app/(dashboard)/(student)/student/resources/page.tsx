'use client'

import { useState, useEffect } from 'react'
import { BookOpen, ExternalLink, Search, Calendar, User, Loader2, FileText, Download } from 'lucide-react'

interface LearningResource {
  id: string
  slug: string
  title: string
  description?: string
  link: string
  cohort: string
  createdAt: string
  createdBy: {
    firstName?: string
    lastName?: string
    role: string
  }
}

export default function StudentResourcesPage() {
  const [resources, setResources] = useState<LearningResource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCohort, setSelectedCohort] = useState<string>('all')
  const [userCohorts, setUserCohorts] = useState<string[]>([])

  useEffect(() => {
    document.title = 'Learning Resources | FIRST Global Challenge Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Access learning materials and guides for your FIRST Global Challenge journey')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Access learning materials and guides for your FIRST Global Challenge journey'
      document.head.appendChild(meta)
    }
  }, [])

  useEffect(() => {
    fetchResources()
  }, [selectedCohort])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const url = selectedCohort === 'all' 
        ? '/api/admin/resources'
        : `/api/admin/resources?cohort=${selectedCohort}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setResources(data.data || [])
        
        // Extract unique cohorts
        const cohorts = Array.from(new Set(data.data?.map((r: LearningResource) => r.cohort) || [])) as string[]
        setUserCohorts(cohorts.sort((a, b) => b.localeCompare(a)))
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter resources based on search
  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group resources by cohort
  const resourcesByCohort = filteredResources.reduce((acc, resource) => {
    if (!acc[resource.cohort]) {
      acc[resource.cohort] = []
    }
    acc[resource.cohort].push(resource)
    return acc
  }, {} as Record<string, LearningResource[]>)

  // Sort cohorts (most recent first)
  const sortedCohorts = Object.keys(resourcesByCohort).sort((a, b) => b.localeCompare(a))

  const getResourceIcon = (link: string) => {
    const url = link.toLowerCase()
    if (url.includes('pdf') || url.endsWith('.pdf')) {
      return <FileText className="h-5 w-5" />
    }
    if (url.includes('video') || url.includes('youtube') || url.includes('vimeo')) {
      return <ExternalLink className="h-5 w-5" />
    }
    if (url.includes('download')) {
      return <Download className="h-5 w-5" />
    }
    return <BookOpen className="h-5 w-5" />
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Resources</h1>
        <p className="text-muted-foreground">
          Access materials and guides curated by your mentors and administrators
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border rounded-lg"
          />
        </div>
        
        {userCohorts.length > 1 && (
          <select
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="px-4 py-2 bg-card border rounded-lg"
          >
            <option value="all">All Cohorts</option>
            {userCohorts.map(cohort => (
              <option key={cohort} value={cohort}>{cohort}</option>
            ))}
          </select>
        )}
      </div>

      {/* Resources Display */}
      {filteredResources.length === 0 ? (
        <div className="bg-card rounded-lg border p-12 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Resources Available</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {searchQuery 
              ? 'No resources match your search. Try adjusting your search terms.'
              : 'Your mentors and administrators haven\'t added any learning resources yet. Check back later!'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedCohorts.map(cohort => (
            <div key={cohort}>
              {/* Cohort Header */}
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">{cohort}</h2>
                <span className="text-sm text-muted-foreground">
                  ({resourcesByCohort[cohort].length} resource{resourcesByCohort[cohort].length !== 1 ? 's' : ''})
                </span>
              </div>

              {/* Resource Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resourcesByCohort[cohort].map((resource) => (
                  <div
                    key={resource.id}
                    className="bg-card rounded-lg border p-5 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        {getResourceIcon(resource.link)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium line-clamp-2 mb-1">
                          {resource.title}
                        </h3>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {resource.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {resource.createdBy.role === 'MENTOR' ? 'Mentor' : 'Admin'}
                      </span>
                      <span>
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <a
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center justify-center gap-2 text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Resource
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Note */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> Resources are organized by cohort year. 
          Materials added by your mentors and administrators will appear here automatically. 
          Make sure to check back regularly for new learning materials!
        </p>
      </div>
    </div>
  )
}