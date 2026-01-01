'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  School,
  Calendar,
  Trophy,
  Target,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface StudentDetail {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  school: string
  cohort: string
  joinedAt: string
  progress: {
    modulesCompleted: number
    totalModules: number
    assignmentsSubmitted: number
    totalAssignments: number
    averageScore: number
  }
  achievements: Array<{
    id: string
    title: string
    description: string
    earnedAt: string
    icon: string
  }>
  recentActivity: Array<{
    id: string
    type: 'submission' | 'achievement' | 'module'
    title: string
    timestamp: string
    status: 'completed' | 'pending' | 'failed'
  }>
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  useEffect(() => {
    document.title = 'Student Details | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'View detailed information about your student')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'View detailed information about your student'
      document.head.appendChild(meta)
    }
  }, [])
  const router = useRouter()
  const { id } = use(params)
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudentDetail()
  }, [id])

  const fetchStudentDetail = async () => {
    try {
      const response = await fetch(`/api/mentor/students/${id}`)
      if (response.ok) {
        const data = await response.json()
        setStudent(data.data || null)
      }
    } catch (error) {
      console.error('Failed to fetch student details:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fallback data for display when API returns null
  const mockStudent: StudentDetail = {
    id: id,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@school.ac.ke',
    phone: '+254 700 123456',
    school: 'Nairobi High School',
    cohort: 'FGC 2026',
    joinedAt: '2024-01-15',
    progress: {
      modulesCompleted: 8,
      totalModules: 12,
      assignmentsSubmitted: 15,
      totalAssignments: 20,
      averageScore: 85
    },
    achievements: [
      {
        id: '1',
        title: 'Fast Learner',
        description: 'Completed 5 modules in first month',
        earnedAt: '2024-02-15',
        icon: '🚀'
      },
      {
        id: '2',
        title: 'Problem Solver',
        description: 'Solved complex robotics challenge',
        earnedAt: '2024-03-01',
        icon: '🧩'
      }
    ],
    recentActivity: [
      {
        id: '1',
        type: 'submission',
        title: 'Module 8 Assignment',
        timestamp: '2 hours ago',
        status: 'completed'
      },
      {
        id: '2',
        type: 'achievement',
        title: 'Earned Problem Solver Badge',
        timestamp: '1 day ago',
        status: 'completed'
      },
      {
        id: '3',
        type: 'module',
        title: 'Started Module 9',
        timestamp: '3 days ago',
        status: 'pending'
      }
    ]
  }

  const displayStudent = student || mockStudent

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!displayStudent) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Student not found</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {displayStudent.firstName} {displayStudent.lastName}
        </h1>
        <p className="text-muted-foreground">{displayStudent.cohort} Student</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Info */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">
                  {displayStudent.firstName} {displayStudent.lastName}
                </h2>
                <p className="text-sm text-muted-foreground">{displayStudent.cohort}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{displayStudent.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{displayStudent.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <School className="h-4 w-4 text-muted-foreground" />
                <span>{displayStudent.school}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(displayStudent.joinedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="bg-card rounded-lg border p-6 mt-6">
            <h3 className="font-semibold mb-4">Progress Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Modules</span>
                  <span>{displayStudent.progress.modulesCompleted}/{displayStudent.progress.totalModules}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(displayStudent.progress.modulesCompleted / displayStudent.progress.totalModules) * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Assignments</span>
                  <span>{displayStudent.progress.assignmentsSubmitted}/{displayStudent.progress.totalAssignments}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(displayStudent.progress.assignmentsSubmitted / displayStudent.progress.totalAssignments) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Average Score</span>
                  <span className="font-medium">{displayStudent.progress.averageScore}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Achievements */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Achievements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayStudent.achievements.map(achievement => (
                <div key={achievement.id} className="flex items-start gap-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {displayStudent.recentActivity.map(activity => (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(activity.status)}
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}