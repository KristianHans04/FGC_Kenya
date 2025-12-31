'use client'

import { useState, useEffect } from 'react'
import { 
  User,
  Mail,
  Phone,
  School,
  Calendar,
  Award,
  Edit,
  Save,
  Camera,
  Shield,
  Clock,
  Users,
  BookOpen
} from 'lucide-react'

interface MentorProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  school: string
  expertise: string[]
  bio: string
  yearsOfExperience: number
  cohortsManaged: number
  studentsMentored: number
  joinedAt: string
  lastActive: string
  achievements: Array<{
    title: string
    date: string
    description: string
  }>
  certifications: Array<{
    name: string
    issuer: string
    date: string
  }>
}

export default function MentorProfilePage() {
  const [profile, setProfile] = useState<MentorProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<Partial<MentorProfile>>({})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/mentor/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.data || null)
        setFormData(data.data || {})
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data
  const mockProfile: MentorProfile = {
    id: 'mentor1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@fgckenya.org',
    phone: '+254 700 123456',
    school: 'Nairobi Technical Institute',
    expertise: ['Robotics', 'Programming', 'Team Building', 'Project Management'],
    bio: 'Passionate educator with over 5 years of experience in robotics and STEM education. Dedicated to nurturing young minds and helping them excel in technology and innovation.',
    yearsOfExperience: 5,
    cohortsManaged: 3,
    studentsMentored: 45,
    joinedAt: '2019-03-15',
    lastActive: '2 hours ago',
    achievements: [
      {
        title: 'Best Mentor Award 2023',
        date: '2023-12-15',
        description: 'Recognized for outstanding mentorship and student success'
      },
      {
        title: 'Innovation Champion',
        date: '2023-06-20',
        description: 'Led team to regional robotics competition victory'
      }
    ],
    certifications: [
      {
        name: 'Certified Robotics Instructor',
        issuer: 'International Robotics Association',
        date: '2021-08-10'
      },
      {
        name: 'STEM Education Specialist',
        issuer: 'Kenya Education Board',
        date: '2020-03-25'
      }
    ]
  }

  const displayProfile = profile || mockProfile

  const handleSave = async () => {
    try {
      const response = await fetch('/api/mentor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        setProfile(formData as MentorProfile)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your mentor profile and settings</p>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              Edit Profile
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <h2 className="text-xl font-semibold mb-1">
                {displayProfile.firstName} {displayProfile.lastName}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">Mentor</p>
              
              <div className="w-full space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{displayProfile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{displayProfile.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <School className="h-4 w-4 text-muted-foreground" />
                  <span>{displayProfile.school}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(displayProfile.joinedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Last active: {displayProfile.lastActive}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-card rounded-lg border p-6 mt-6">
            <h3 className="font-semibold mb-4">Mentorship Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Experience</span>
                <span className="font-medium">{displayProfile.yearsOfExperience} years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cohorts Managed</span>
                <span className="font-medium">{displayProfile.cohortsManaged}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Students Mentored</span>
                <span className="font-medium">{displayProfile.studentsMentored}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="font-semibold mb-4">About</h3>
            {isEditing ? (
              <textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-sm text-muted-foreground">{displayProfile.bio}</p>
            )}
          </div>

          {/* Expertise */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Areas of Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {displayProfile.expertise.map(skill => (
                <span key={skill} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {skill}
                </span>
              ))}
              {isEditing && (
                <button className="px-3 py-1 border border-dashed rounded-full text-sm hover:bg-muted">
                  + Add Skill
                </button>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </h3>
            <div className="space-y-3">
              {displayProfile.achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Award className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Certifications
            </h3>
            <div className="space-y-3">
              {displayProfile.certifications.map((cert, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{cert.name}</h4>
                    <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Issued: {new Date(cert.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}