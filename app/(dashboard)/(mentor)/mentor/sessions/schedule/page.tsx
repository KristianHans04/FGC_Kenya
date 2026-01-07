'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Save,
  Plus,
  X,
  AlertCircle
} from 'lucide-react'
import { useFlashNotification } from '@/app/lib/hooks/useFlashNotification'

interface SessionForm {
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  type: 'online' | 'in-person' | 'hybrid'
  location: string
  meetingLink: string
  maxParticipants: number
  cohorts: string[]
  materials: string[]
  reminders: boolean
}

interface MentorCohort {
  cohort: string
  year: string
  isActive: boolean
  studentCount: number
}

export default function ScheduleSessionPage() {
  
  useEffect(() => {
    document.title = 'Session Schedule | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Schedule and manage mentoring sessions')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Schedule and manage mentoring sessions'
      document.head.appendChild(meta)
    }
  }, [])


  const router = useRouter()
  const { addNotification } = useFlashNotification()
  const [loading, setLoading] = useState(false)
  const [loadingCohorts, setLoadingCohorts] = useState(true)
  const [availableCohorts, setAvailableCohorts] = useState<MentorCohort[]>([])
  const [formData, setFormData] = useState<SessionForm>({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'online',
    location: '',
    meetingLink: '',
    maxParticipants: 20,
    cohorts: [],
    materials: [],
    reminders: true
  })

  // Fetch mentor's assigned cohorts
  useEffect(() => {
    fetchMentorCohorts()
  }, [])

  const fetchMentorCohorts = async () => {
    try {
      setLoadingCohorts(true)
      const response = await fetch('/api/mentor/cohorts')
      const data = await response.json()

      if (!response.ok) {
        console.error('[SCHEDULE_SESSION] Error response:', data)
        addNotification(
          data.message || 'Failed to fetch your assigned cohorts',
          'error'
        )
        if (response.status === 403) {
          // No mentor cohorts assigned
          router.push('/mentor')
        }
        return
      }

      if (data.success && data.data) {
        setAvailableCohorts(data.data)
        if (data.data.length === 0) {
          addNotification(
            'You are not assigned to any cohorts. Please contact an administrator.',
            'warning'
          )
        }
      }
    } catch (error) {
      console.error('[SCHEDULE_SESSION] Failed to fetch cohorts:', error)
      addNotification('Failed to load cohorts. Please try again.', 'error')
    } finally {
      setLoadingCohorts(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/mentor/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        router.push('/mentor/sessions')
      }
    } catch (error) {
      console.error('Failed to schedule session:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCohort = (cohort: string) => {
    setFormData(prev => ({
      ...prev,
      cohorts: prev.cohorts.includes(cohort)
        ? prev.cohorts.filter(c => c !== cohort)
        : [...prev.cohorts, cohort]
    }))
  }

  const addMaterial = () => {
    const material = prompt('Enter material link or description:')
    if (material) {
      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, material]
      }))
    }
  }

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Schedule New Session</h1>
        <p className="text-muted-foreground">Create a new training session for your students</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card rounded-lg border p-6">
          <h2 className="font-semibold mb-4">Session Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Session Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Introduction to Robot Programming"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
                placeholder="Describe what will be covered in this session..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h2 className="font-semibold mb-4">Session Type & Location</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Session Type</label>
              <div className="flex gap-4">
                {['online', 'in-person', 'hybrid'].map(type => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="text-primary"
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {(formData.type === 'in-person' || formData.type === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter venue address"
                />
              </div>
            )}

            {(formData.type === 'online' || formData.type === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Video className="h-4 w-4 inline mr-1" />
                  Meeting Link
                </label>
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="https://meet.google.com/..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                <Users className="h-4 w-4 inline mr-1" />
                Max Participants
              </label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg"
                min="1"
                max="100"
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h2 className="font-semibold mb-4">Target Cohorts</h2>
          {loadingCohorts ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Loading cohorts...</span>
            </div>
          ) : availableCohorts.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {availableCohorts.map(cohortData => (
                  <button
                    key={cohortData.cohort}
                    type="button"
                    onClick={() => toggleCohort(cohortData.cohort)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      formData.cohorts.includes(cohortData.cohort)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <span className="font-medium">{cohortData.cohort}</span>
                    {cohortData.studentCount > 0 && (
                      <span className="ml-2 text-xs opacity-80">
                        ({cohortData.studentCount} students)
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {formData.cohorts.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Please select at least one cohort for this session
                </p>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-900 font-medium">No Cohorts Available</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    You are not currently assigned to any cohorts. Please contact an administrator to be assigned as a mentor.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Session Materials</h2>
            <button
              type="button"
              onClick={addMaterial}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
            >
              <Plus className="h-4 w-4" />
              Add Material
            </button>
          </div>
          
          {formData.materials.length > 0 ? (
            <div className="space-y-2">
              {formData.materials.map((material, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{material}</span>
                  <button
                    type="button"
                    onClick={() => removeMaterial(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No materials added yet</p>
          )}
        </div>

        <div className="bg-card rounded-lg border p-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.reminders}
              onChange={(e) => setFormData({...formData, reminders: e.target.checked})}
              className="h-4 w-4 text-primary"
            />
            <span className="text-sm">Send reminder emails to participants</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || formData.cohorts.length === 0 || availableCohorts.length === 0}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            title={availableCohorts.length === 0 ? "No cohorts available" : formData.cohorts.length === 0 ? "Please select at least one cohort" : undefined}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Schedule Session
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border rounded-lg hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}