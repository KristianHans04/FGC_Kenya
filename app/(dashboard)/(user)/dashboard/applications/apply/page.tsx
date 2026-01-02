'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MultiTabApplicationForm from '@/app/components/application/MultiTabApplicationForm'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Mock form structure for FGC 2026
const mockApplicationForm = {
  id: 'form-2026',
  season: 'FGC2026',
  title: 'FIRST Global Challenge 2026 - Team Kenya Application',
  description: 'Apply to represent Kenya at the FIRST Global Challenge 2026',
  tabs: [
    {
      id: 'personal',
      title: 'Personal Info',
      description: 'Basic information about you',
      order: 1,
      fields: [
        {
          id: 'firstName',
          type: 'text' as const,
          label: 'First Name',
          placeholder: 'Enter your first name',
          required: true,
          autoFillFrom: 'firstName',
          validation: {
            minLength: 2,
            maxLength: 50
          }
        },
        {
          id: 'lastName',
          type: 'text' as const,
          label: 'Last Name',
          placeholder: 'Enter your last name',
          required: true,
          autoFillFrom: 'lastName',
          validation: {
            minLength: 2,
            maxLength: 50
          }
        },
        {
          id: 'email',
          type: 'email' as const,
          label: 'Email Address',
          placeholder: 'your.email@example.com',
          required: true,
          autoFillFrom: 'email',
          helpText: 'We will use this email for all communications'
        },
        {
          id: 'phone',
          type: 'tel' as const,
          label: 'Phone Number',
          placeholder: '+254XXXXXXXXX',
          required: true,
          autoFillFrom: 'phone',
          validation: {
            pattern: '^\\+254\\d{9}$'
          },
          helpText: 'Include country code (e.g., +254 for Kenya)'
        },
        {
          id: 'dateOfBirth',
          type: 'date' as const,
          label: 'Date of Birth',
          required: true,
          autoFillFrom: 'dateOfBirth',
          validation: {
            max: new Date(Date.now() - 13 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            min: new Date(Date.now() - 19 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          helpText: 'You must be between 13-18 years old'
        },
        {
          id: 'gender',
          type: 'select' as const,
          label: 'Gender',
          placeholder: 'Select gender',
          required: true,
          autoFillFrom: 'gender',
          options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
            { value: 'prefer-not-to-say', label: 'Prefer not to say' }
          ]
        },
        {
          id: 'nationality',
          type: 'text' as const,
          label: 'Nationality',
          placeholder: 'Kenyan',
          required: true,
          autoFillFrom: 'nationality'
        }
      ]
    },
    {
      id: 'education',
      title: 'Education',
      description: 'Your educational background',
      order: 2,
      fields: [
        {
          id: 'school',
          type: 'text' as const,
          label: 'School Name',
          placeholder: 'Enter your school name',
          required: true,
          autoFillFrom: 'school'
        },
        {
          id: 'grade',
          type: 'select' as const,
          label: 'Current Grade/Year',
          placeholder: 'Select your grade',
          required: true,
          autoFillFrom: 'grade',
          options: [
            { value: '8', label: 'Grade 8' },
            { value: '9', label: 'Grade 9' },
            { value: '10', label: 'Grade 10' },
            { value: '11', label: 'Grade 11' },
            { value: '12', label: 'Grade 12' },
            { value: 'university-1', label: 'University Year 1' },
            { value: 'university-2', label: 'University Year 2' }
          ]
        },
        {
          id: 'county',
          type: 'select' as const,
          label: 'County',
          placeholder: 'Select your county',
          required: true,
          autoFillFrom: 'county',
          options: [
            { value: 'nairobi', label: 'Nairobi' },
            { value: 'mombasa', label: 'Mombasa' },
            { value: 'kisumu', label: 'Kisumu' },
            { value: 'nakuru', label: 'Nakuru' },
            { value: 'eldoret', label: 'Uasin Gishu' },
            { value: 'kiambu', label: 'Kiambu' },
            { value: 'machakos', label: 'Machakos' }
          ]
        },
        {
          id: 'homeAddress',
          type: 'textarea' as const,
          label: 'Home Address',
          placeholder: 'Enter your complete home address',
          required: true,
          autoFillFrom: 'homeAddress',
          rows: 3
        },
        {
          id: 'academicAchievements',
          type: 'textarea' as const,
          label: 'Academic Achievements',
          placeholder: 'List your academic achievements, awards, or recognitions',
          required: false,
          rows: 4,
          helpText: 'Include any relevant academic awards or achievements'
        }
      ]
    },
    {
      id: 'experience',
      title: 'Experience',
      description: 'Your STEM and robotics experience',
      order: 3,
      fields: [
        {
          id: 'roboticsExperience',
          type: 'select' as const,
          label: 'Robotics Experience Level',
          placeholder: 'Select your experience level',
          required: true,
          options: [
            { value: 'none', label: 'No prior experience' },
            { value: 'beginner', label: 'Beginner (< 1 year)' },
            { value: 'intermediate', label: 'Intermediate (1-2 years)' },
            { value: 'advanced', label: 'Advanced (2+ years)' }
          ]
        },
        {
          id: 'programmingLanguages',
          type: 'text' as const,
          label: 'Programming Languages',
          placeholder: 'e.g., Python, C++, JavaScript',
          required: false,
          helpText: 'List programming languages you know (comma-separated)'
        },
        {
          id: 'teamworkExperience',
          type: 'textarea' as const,
          label: 'Teamwork Experience',
          placeholder: 'Describe your experience working in teams',
          required: true,
          rows: 4,
          helpText: 'Include any team projects, competitions, or group activities'
        },
        {
          id: 'leadershipRoles',
          type: 'textarea' as const,
          label: 'Leadership Roles',
          placeholder: 'Describe any leadership positions you have held',
          required: false,
          rows: 3
        },
        {
          id: 'whyJoinTeam',
          type: 'textarea' as const,
          label: 'Why do you want to join Team Kenya?',
          placeholder: 'Explain your motivation for joining the team',
          required: true,
          rows: 5,
          validation: {
            minLength: 100,
            maxLength: 1000
          },
          helpText: 'Minimum 100 characters'
        }
      ]
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Upload supporting documents via links',
      order: 4,
      fields: [
        {
          id: 'cvLink',
          type: 'url' as const,
          label: 'CV/Resume Link',
          placeholder: 'https://drive.google.com/...',
          required: true,
          helpText: 'Upload your CV to Google Drive or Dropbox and share the link'
        },
        {
          id: 'transcriptLink',
          type: 'url' as const,
          label: 'Academic Transcript Link',
          placeholder: 'https://drive.google.com/...',
          required: false,
          helpText: 'Optional: Share your academic transcript if available'
        },
        {
          id: 'portfolioLink',
          type: 'url' as const,
          label: 'Portfolio/GitHub Link',
          placeholder: 'https://github.com/username',
          required: false,
          autoFillFrom: 'githubUrl',
          helpText: 'Optional: Share your portfolio or GitHub profile'
        },
        {
          id: 'recommendationLink',
          type: 'url' as const,
          label: 'Letter of Recommendation Link',
          placeholder: 'https://drive.google.com/...',
          required: false,
          helpText: 'Optional: Letter from a teacher or mentor'
        },
        {
          id: 'videoIntroLink',
          type: 'url' as const,
          label: 'Video Introduction Link',
          placeholder: 'https://youtube.com/...',
          required: false,
          helpText: 'Optional: 2-minute video introducing yourself'
        }
      ]
    },
    {
      id: 'guardian',
      title: 'Guardian Info',
      description: 'Parent or guardian information',
      order: 5,
      fields: [
        {
          id: 'parentName',
          type: 'text' as const,
          label: 'Parent/Guardian Name',
          placeholder: 'Full name',
          required: true,
          autoFillFrom: 'parentName'
        },
        {
          id: 'parentPhone',
          type: 'tel' as const,
          label: 'Parent/Guardian Phone',
          placeholder: '+254XXXXXXXXX',
          required: true,
          autoFillFrom: 'parentPhone',
          validation: {
            pattern: '^\\+254\\d{9}$'
          }
        },
        {
          id: 'parentEmail',
          type: 'email' as const,
          label: 'Parent/Guardian Email',
          placeholder: 'parent@example.com',
          required: true,
          autoFillFrom: 'parentEmail'
        },
        {
          id: 'parentConsent',
          type: 'checkbox' as const,
          label: 'Parent/Guardian Consent',
          placeholder: 'I confirm that my parent/guardian has given consent for this application',
          required: true
        },
        {
          id: 'termsAccepted',
          type: 'checkbox' as const,
          label: 'Terms and Conditions',
          placeholder: 'I agree to the terms and conditions',
          required: true
        },
        {
          id: 'dataConsent',
          type: 'checkbox' as const,
          label: 'Data Processing Consent',
          placeholder: 'I consent to the processing of my personal data for this application',
          required: true
        }
      ]
    }
  ],
  allowSaveDraft: true,
  requireDocumentLinks: true,
  enableAutoFill: true
}

export default function ApplyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeForm, setActiveForm] = useState<any>(null)
  const [existingApplication, setExistingApplication] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Apply - FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Apply to join FIRST Global Team Kenya')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Apply to join FIRST Global Team Kenya'
      document.head.appendChild(meta)
    }
    
    fetchActiveForm()
  }, [])

  const fetchActiveForm = async () => {
    try {
      // Check for active application form
      const formResponse = await fetch('/api/applications/forms/active')
      if (formResponse.ok) {
        const formData = await formResponse.json()
        setActiveForm(formData.form || mockApplicationForm)
        
        // Check if user already has an application for this season
        const appResponse = await fetch(`/api/applications/my?season=${formData.form?.season || 'FGC2026'}`)
        if (appResponse.ok) {
          const appData = await appResponse.json()
          if (appData.application) {
            setExistingApplication(appData.application)
          }
        }
      } else {
        // Use mock form for now
        setActiveForm(mockApplicationForm)
      }
    } catch (error) {
      console.error('Failed to fetch application form:', error)
      setActiveForm(mockApplicationForm)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading application form...</p>
        </div>
      </div>
    )
  }

  if (!activeForm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Active Applications</h2>
          <p className="text-muted-foreground mb-6">
            There are no active application forms at the moment. Please check back later or contact support.
          </p>
          <Link href="/dashboard/applications" className="btn-primary">
            Back to Applications
          </Link>
        </div>
      </div>
    )
  }

  if (existingApplication && existingApplication.status !== 'DRAFT') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-info mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Application Already Submitted</h2>
          <p className="text-muted-foreground mb-6">
            You have already submitted an application for {activeForm.season}. You can view your application status in the applications dashboard.
          </p>
          <Link href="/dashboard/applications" className="btn-primary">
            View Applications
          </Link>
        </div>
      </div>
    )
  }

  return (
    <MultiTabApplicationForm
      form={activeForm}
      applicationId={existingApplication?.id}
      onClose={() => router.push('/dashboard/applications')}
    />
  )
}