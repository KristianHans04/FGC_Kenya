'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, School, Calendar, MapPin, Globe, Github, Linkedin, Save, Loader2, Building2, Users } from 'lucide-react'

interface ProfileData {
  firstName?: string | null
  lastName?: string | null
  email: string
  phone?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  nationality?: string | null
  school?: string | null
  grade?: string | null
  county?: string | null
  homeAddress?: string | null
  parentName?: string | null
  parentPhone?: string | null
  parentEmail?: string | null
  linkedinUrl?: string | null
  githubUrl?: string | null
  portfolioUrl?: string | null
  role: string
}

interface ProfileFormProps {
  initialData?: ProfileData | null
  onSave?: (data: ProfileData) => Promise<void>
  readOnly?: boolean
}

export default function ProfileForm({ initialData, onSave, readOnly = false }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Kenyan',
    school: '',
    grade: '',
    county: '',
    homeAddress: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    role: 'USER',
    ...initialData
  })
  const [loading, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [activeTab, setActiveTab] = useState('personal')

  const isStudent = formData.role === 'STUDENT'
  const showEducation = ['STUDENT', 'ALUMNI'].includes(formData.role)
  const showGuardian = isStudent

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (readOnly || !onSave) return

    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      await onSave(formData)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    ...(showEducation ? [{ id: 'education', label: 'Education', icon: School }] : []),
    ...(showGuardian ? [{ id: 'guardian', label: 'Guardian Info', icon: Users }] : []),
    { id: 'contact', label: 'Contact & Links', icon: Globe },
  ]

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-card rounded-lg border p-6">
        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 bg-background border rounded-lg"
                disabled={readOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 bg-background border rounded-lg"
                disabled={readOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-background border rounded-lg"
                  disabled={readOnly}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-background border rounded-lg"
                  disabled={readOnly}
                  placeholder="+254 700 000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-background border rounded-lg"
                  disabled={readOnly}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Gender
              </label>
              <select
                value={formData.gender || ''}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 bg-background border rounded-lg"
                disabled={readOnly}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Nationality
              </label>
              <input
                type="text"
                value={formData.nationality || ''}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-3 py-2 bg-background border rounded-lg"
                disabled={readOnly}
                placeholder="Kenyan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Home Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  value={formData.homeAddress || ''}
                  onChange={(e) => setFormData({ ...formData, homeAddress: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-background border rounded-lg"
                  disabled={readOnly}
                  rows={2}
                  placeholder="Enter your address"
                />
              </div>
            </div>
          </div>
        )}

        {/* Education Tab */}
        {activeTab === 'education' && showEducation && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                School/Institution
              </label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.school || ''}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-background border rounded-lg"
                  disabled={readOnly}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Grade/Year
              </label>
              <input
                type="text"
                value={formData.grade || ''}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-3 py-2 bg-background border rounded-lg"
                disabled={readOnly}
                placeholder="e.g., Form 4, Year 2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                County
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.county || ''}
                  onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-background border rounded-lg"
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>
        )}

        {/* Guardian Tab */}
        {activeTab === 'guardian' && showGuardian && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Parent/Guardian Name
              </label>
              <input
                type="text"
                value={formData.parentName || ''}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-3 py-2 bg-background border rounded-lg"
                disabled={readOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Parent/Guardian Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={formData.parentPhone || ''}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-background border rounded-lg"
                  disabled={readOnly}
                  placeholder="+254 700 000000"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Parent/Guardian Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.parentEmail || ''}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-background border rounded-lg"
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact & Links Tab */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                LinkedIn Profile
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="url"
                  value={formData.linkedinUrl || ''}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-background border rounded-lg"
                  disabled={readOnly}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                GitHub Profile
              </label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="url"
                  value={formData.githubUrl || ''}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-background border rounded-lg"
                  disabled={readOnly}
                  placeholder="https://github.com/username"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Portfolio Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="url"
                  value={formData.portfolioUrl || ''}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-background border rounded-lg"
                  disabled={readOnly}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        {!readOnly && (
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </form>
  )
}