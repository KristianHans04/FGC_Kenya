'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import {

  MapPin,
  User,
  GraduationCap,
  Phone,
  Mail,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  school: string
  grade: string
  county: string
  homeAddress: string
  parentName: string
  parentPhone: string
  parentEmail: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    school: '',
    grade: '',
    county: '',
    homeAddress: '',
    parentName: '',
    parentPhone: '',
    parentEmail: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          setProfile({
            firstName: data.data.firstName || '',
            lastName: data.data.lastName || '',
            email: data.data.email || user?.email || '',
            phone: data.data.phone || '',
            school: data.data.school || '',
            grade: data.data.grade || '',
            county: data.data.county || '',
            homeAddress: data.data.homeAddress || '',
            parentName: data.data.parentName || '',
            parentPhone: data.data.parentPhone || '',
            parentEmail: data.data.parentEmail || ''
          })
        }
      } else {
        // If API fails, keep the initial empty state
        console.error('Failed to fetch profile')
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setError('Failed to load profile information')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        setMessage('Profile updated successfully!')
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      setError('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading">Settings</h1>
        <p className="text-muted-foreground">Update your profile information and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                  placeholder="+254XXXXXXXXX"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Education Information */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Education Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">School Name</label>
              <input
                type="text"
                value={profile.school}
                onChange={(e) => handleChange('school', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                placeholder="Your school name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Grade/Year</label>
              <select
                value={profile.grade}
                onChange={(e) => handleChange('grade', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
              >
                <option value="">Select grade</option>
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
                <option value="university">University</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Location Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">County</label>
              <select
                value={profile.county}
                onChange={(e) => handleChange('county', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
              >
                <option value="">Select county</option>
                <option value="Nairobi">Nairobi</option>
                <option value="Mombasa">Mombasa</option>
                <option value="Kisumu">Kisumu</option>
                <option value="Nakuru">Nakuru</option>
                <option value="Eldoret">Eldoret</option>
                {/* Add more counties as needed */}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2">Home Address</label>
              <textarea
                value={profile.homeAddress}
                onChange={(e) => handleChange('homeAddress', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background resize-none"
                placeholder="Your complete home address"
              />
            </div>
          </div>
        </div>

        {/* Parent/Guardian Information */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Parent/Guardian Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Parent/Guardian Name</label>
              <input
                type="text"
                value={profile.parentName}
                onChange={(e) => handleChange('parentName', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Parent/Guardian Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={profile.parentPhone}
                  onChange={(e) => handleChange('parentPhone', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                  placeholder="+254XXXXXXXXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Parent/Guardian Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={profile.parentEmail}
                  onChange={(e) => handleChange('parentEmail', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                  placeholder="parent@example.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
          >
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </motion.div>
        )}

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md"
          >
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-300">{message}</p>
          </motion.div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
