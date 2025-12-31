'use client'

import { useState, useEffect } from 'react'
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle, 
  Lock, 
  Clock,
  Award,
  TrendingUp,
  FileText
} from 'lucide-react'

export default function StudentTrainingPage() {
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeModule, setActiveModule] = useState<any>(null)

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      const response = await fetch('/api/student/modules')
      if (response.ok) {
        const data = await response.json()
        setModules(data.data?.modules || [])
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for display
  const trainingModules = [
    {
      id: '1',
      title: 'Introduction to Robotics',
      description: 'Learn the basics of robotics and FGC competition',
      progress: 100,
      status: 'completed',
      duration: '2 hours',
      lessons: 8,
      completedLessons: 8
    },
    {
      id: '2',
      title: 'Programming Fundamentals',
      description: 'Master programming concepts for robot control',
      progress: 60,
      status: 'in_progress',
      duration: '4 hours',
      lessons: 12,
      completedLessons: 7
    },
    {
      id: '3',
      title: 'Mechanical Design',
      description: 'Design and build robot mechanisms',
      progress: 0,
      status: 'locked',
      duration: '3 hours',
      lessons: 10,
      completedLessons: 0
    },
    {
      id: '4',
      title: 'Team Collaboration',
      description: 'Work effectively in a team environment',
      progress: 0,
      status: 'available',
      duration: '1.5 hours',
      lessons: 6,
      completedLessons: 0
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <PlayCircle className="h-5 w-5 text-blue-600" />
      case 'locked':
        return <Lock className="h-5 w-5 text-gray-400" />
      default:
        return <BookOpen className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Training Modules</h1>
        <p className="text-muted-foreground">Complete your robotics training journey</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">40%</div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '40%' }} />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Completed</span>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">1 / 4</div>
          <div className="text-sm text-muted-foreground mt-2">Modules finished</div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Time Spent</span>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">6.5h</div>
          <div className="text-sm text-muted-foreground mt-2">Total learning time</div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Certificates</span>
            <Award className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">1</div>
          <div className="text-sm text-muted-foreground mt-2">Earned certificates</div>
        </div>
      </div>

      {/* Training Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          trainingModules.map(module => (
            <div 
              key={module.id}
              className={`bg-card rounded-lg border p-6 ${
                module.status === 'locked' ? 'opacity-60' : 'hover:shadow-md cursor-pointer'
              }`}
              onClick={() => module.status !== 'locked' && setActiveModule(module)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{module.title}</h3>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
                {getStatusIcon(module.status)}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{module.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      module.status === 'completed' ? 'bg-green-600' :
                      module.status === 'in_progress' ? 'bg-blue-600' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${module.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{module.completedLessons}/{module.lessons} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{module.duration}</span>
                </div>
              </div>

              {module.status === 'completed' && (
                <div className="mt-4 pt-4 border-t">
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                    <Award className="h-4 w-4" />
                    View Certificate
                  </button>
                </div>
              )}

              {module.status === 'in_progress' && (
                <div className="mt-4 pt-4 border-t">
                  <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Continue Learning
                  </button>
                </div>
              )}

              {module.status === 'available' && (
                <div className="mt-4 pt-4 border-t">
                  <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Start Module
                  </button>
                </div>
              )}

              {module.status === 'locked' && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-center text-sm text-muted-foreground">
                    <Lock className="h-4 w-4 inline mr-2" />
                    Complete previous modules to unlock
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}