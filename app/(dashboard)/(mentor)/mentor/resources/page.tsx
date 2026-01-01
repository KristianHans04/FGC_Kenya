'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  FileText, 
  Video, 
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Upload,
  Users
} from 'lucide-react'

interface Resource {
  id: string
  title: string
  description: string
  type: 'document' | 'video' | 'presentation' | 'exercise'
  category: string
  fileUrl: string
  fileSize: string
  uploadedAt: string
  lastModified: string
  downloads: number
  assignedCohorts: string[]
  tags: string[]
}

export default function MentorResourcesPage() {
  
  useEffect(() => {
    document.title = 'Mentor Resources | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Access teaching materials and resources')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Access teaching materials and resources'
      document.head.appendChild(meta)
    }
  }, [])


  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/mentor/resources')
      if (response.ok) {
        const data = await response.json()
        setResources(data.data?.resources || [])
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data
  const mockResources: Resource[] = [
    {
      id: '1',
      title: 'Introduction to Robotics - Module 1',
      description: 'Comprehensive guide covering basic robotics concepts',
      type: 'document',
      category: 'Fundamentals',
      fileUrl: '/resources/intro-robotics.pdf',
      fileSize: '12.5 MB',
      uploadedAt: '2024-01-15',
      lastModified: '2024-02-01',
      downloads: 145,
      assignedCohorts: ['2024', '2025'],
      tags: ['robotics', 'basics', 'introduction']
    },
    {
      id: '2',
      title: 'Programming Workshop Video',
      description: 'Recording of the advanced programming workshop',
      type: 'video',
      category: 'Programming',
      fileUrl: '/resources/programming-workshop.mp4',
      fileSize: '256 MB',
      uploadedAt: '2024-02-10',
      lastModified: '2024-02-10',
      downloads: 89,
      assignedCohorts: ['2024'],
      tags: ['programming', 'workshop', 'advanced']
    },
    {
      id: '3',
      title: 'Team Building Exercises',
      description: 'Collection of team building activities and exercises',
      type: 'exercise',
      category: 'Soft Skills',
      fileUrl: '/resources/team-exercises.pdf',
      fileSize: '3.2 MB',
      uploadedAt: '2024-01-20',
      lastModified: '2024-01-25',
      downloads: 67,
      assignedCohorts: ['2024', '2023'],
      tags: ['team', 'collaboration', 'exercises']
    }
  ]

  const displayResources = resources.length > 0 ? resources : mockResources

  const filteredResources = displayResources.filter(resource => {
    const matchesSearch = searchTerm === '' ||
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = filterType === 'all' || resource.type === filterType
    const matchesCategory = filterCategory === 'all' || resource.category === filterCategory

    return matchesSearch && matchesType && matchesCategory
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5 text-blue-600" />
      case 'video':
        return <Video className="h-5 w-5 text-red-600" />
      case 'presentation':
        return <BookOpen className="h-5 w-5 text-green-600" />
      case 'exercise':
        return <Edit className="h-5 w-5 text-purple-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Teaching Resources</h1>
          <p className="text-muted-foreground">
            Manage educational materials for your cohorts
          </p>
        </div>
        <Link
          href="/mentor/resources/create"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Resource
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Resources</span>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{displayResources.length}</div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Downloads</span>
            <Download className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {displayResources.reduce((acc, r) => acc + r.downloads, 0)}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active Cohorts</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">3</div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Last Updated</span>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-sm">Feb 10, 2024</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Types</option>
            <option value="document">Documents</option>
            <option value="video">Videos</option>
            <option value="presentation">Presentations</option>
            <option value="exercise">Exercises</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Categories</option>
            <option value="Fundamentals">Fundamentals</option>
            <option value="Programming">Programming</option>
            <option value="Mechanics">Mechanics</option>
            <option value="Soft Skills">Soft Skills</option>
          </select>

          <button className="px-4 py-2 border rounded-lg hover:bg-muted flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Bulk Upload
          </button>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-card rounded-lg border">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No resources found</p>
          </div>
        ) : (
          filteredResources.map(resource => (
            <div key={resource.id} className="bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  {getTypeIcon(resource.type)}
                  <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-muted rounded">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 hover:bg-muted rounded">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 hover:bg-muted rounded text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold mb-2">{resource.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {resource.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {resource.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-muted rounded-md text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Category</span>
                    <span className="font-medium text-foreground">{resource.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Size</span>
                    <span className="font-medium text-foreground">{resource.fileSize}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Downloads</span>
                    <span className="font-medium text-foreground">{resource.downloads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cohorts</span>
                    <span className="font-medium text-foreground">
                      {resource.assignedCohorts.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
