'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  School,
  MapPin,
  Lock,
  Shield,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Calendar,
  Send,
  FileText,
  Info
} from 'lucide-react'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import AutocompleteInput from '@/app/components/common/AutocompleteInput'
import CountrySelector from '@/app/components/common/CountrySelector'

interface FormData {
  email: string
  firstName: string
  lastName: string
  phone: string
  school: string
  year: string
  role: string
  country: string
  city: string
  county: string
  bio: string
  sendWelcomeEmail: boolean
}

interface FilterOptions {
  schools: string[]
  years: string[]
  cities: string[]
  counties: string[]
}

interface FormErrors {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  general?: string
}

export default function AddUserPage() {
  const router = useRouter()
  const { user: currentUser, isLoading: authLoading, isAuthenticated } = useAuth()
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN'
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    school: '',
    year: '',
    role: 'USER',
    country: 'Kenya',
    city: '',
    county: '',
    bio: '',
    sendWelcomeEmail: true
  })
  
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    schools: [],
    years: [],
    cities: [],
    counties: []
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [loadingFilters, setLoadingFilters] = useState(true)
  
  useEffect(() => {
    document.title = 'Add New User | FIRST Global Team Kenya'
    fetchFilterOptions()
  }, [])
  
  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/admin/users/filters', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setFilterOptions(data.data)
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
    } finally {
      setLoadingFilters(false)
    }
  }
  
  const handleAddSchool = (newSchool: string) => {
    if (!filterOptions.schools.includes(newSchool)) {
      setFilterOptions(prev => ({
        ...prev,
        schools: [...prev.schools, newSchool].sort()
      }))
    }
  }
  
  const handleAddCity = (newCity: string) => {
    if (!filterOptions.cities.includes(newCity)) {
      setFilterOptions(prev => ({
        ...prev,
        cities: [...prev.cities, newCity].sort()
      }))
    }
  }
  
  const handleAddCounty = (newCounty: string) => {
    if (!filterOptions.counties.includes(newCounty)) {
      setFilterOptions(prev => ({
        ...prev,
        counties: [...prev.counties, newCounty].sort()
      }))
    }
  }
  
  // Check authentication
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'ADMIN') {
        router.push('/dashboard')
      }
    }
  }, [authLoading, isAuthenticated, currentUser, router])
  
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    // Name validation
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required'
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required'
    }
    
    // Phone validation (optional but validate format if provided)
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setErrors({})
    setSuccessMessage('')
    
    try {
      // Format address from separate fields
      const addressParts = [formData.city, formData.county, formData.country].filter(Boolean)
      const formattedData = {
        ...formData,
        address: addressParts.join(', ')
      }
      
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formattedData)
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setSuccessMessage('User created successfully!')
        
        // Send notification emails
        if (formData.sendWelcomeEmail) {
          await fetch('/api/admin/emails/send-welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              userId: data.data.user.id,
              email: formData.email,
              firstName: formData.firstName
            })
          })
        }
        
        // Send admin notification
        await fetch('/api/admin/emails/send-admin-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            action: 'user_created',
            adminEmail: currentUser?.email,
            userData: {
              email: formData.email,
              name: `${formData.firstName} ${formData.lastName}`,
              role: formData.role
            }
          })
        })
        
        // Redirect to user detail page after 2 seconds
        setTimeout(() => {
          router.push(`/admin/super/users/${data.data.user.id}`)
        }, 2000)
      } else {
        setErrors({ 
          general: data.error?.message || 'Failed to create user'
        })
      }
    } catch (error) {
      console.error('Error creating user:', error)
      setErrors({ general: 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/super/users"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Add New User</h1>
          <p className="text-muted-foreground">Create a new user account and send welcome email</p>
        </div>
      </div>
      
      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3"
        >
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
          <div>
            <p className="text-green-800 dark:text-green-300 font-medium">{successMessage}</p>
            <p className="text-green-700 dark:text-green-400 text-sm mt-1">
              Redirecting to user details...
            </p>
          </div>
        </motion.div>
      )}
      
      {/* Error Message */}
      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <p className="text-destructive">{errors.general}</p>
        </motion.div>
      )}
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Information */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5" />
            Account Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground ${
                  errors.email ? 'border-destructive' : 'border-border'
                }`}
                placeholder="user@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>
            
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-medium text-foreground">Authentication Method</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                This platform uses passwordless authentication with OTP (One-Time Password). 
                Users will verify their email and sign in using codes sent to their email address.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Role <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="USER">User</option>
                <option value="STUDENT">Student</option>
                <option value="ALUMNI">Alumni</option>
                <option value="MENTOR">Mentor</option>
                <option value="ADMIN">Admin</option>
                {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
              </select>
            </div>
            
            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sendWelcomeEmail}
                  onChange={(e) => setFormData({ ...formData, sendWelcomeEmail: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm">Send welcome email with verification instructions</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Personal Information */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
            <User className="h-5 w-5" />
            Personal Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground ${
                  errors.firstName ? 'border-destructive' : 'border-border'
                }`}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive mt-1">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground ${
                  errors.lastName ? 'border-destructive' : 'border-border'
                }`}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive mt-1">{errors.lastName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground ${
                  errors.phone ? 'border-destructive' : 'border-border'
                }`}
                placeholder="+254 700 000000"
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">School</label>
              <AutocompleteInput
                placeholder="Type to search schools..."
                value={formData.school}
                onChange={(value) => setFormData({ ...formData, school: value })}
                options={filterOptions.schools.map(school => ({ value: school, label: school }))}
                onAddOption={handleAddSchool}
                loading={loadingFilters}
                allowCustom={true}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Year/Level</label>
              <AutocompleteInput
                placeholder="Select year or level..."
                value={formData.year}
                onChange={(value) => setFormData({ ...formData, year: value })}
                options={filterOptions.years.map(year => ({ value: year, label: year }))}
                loading={loadingFilters}
                allowCustom={false}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <CountrySelector
                value={formData.country}
                onChange={(value) => setFormData({ ...formData, country: value })}
                placeholder="Select country..."
                required={true}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">County/State/Province</label>
              <AutocompleteInput
                placeholder="Type county, state, or province..."
                value={formData.county}
                onChange={(value) => setFormData({ ...formData, county: value })}
                options={filterOptions.counties.map(county => ({ value: county, label: county }))}
                onAddOption={handleAddCounty}
                loading={loadingFilters}
                allowCustom={true}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <AutocompleteInput
                placeholder="Type city name..."
                value={formData.city}
                onChange={(value) => setFormData({ ...formData, city: value })}
                options={filterOptions.cities.map(city => ({ value: city, label: city }))}
                onAddOption={handleAddCity}
                loading={loadingFilters}
                allowCustom={true}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                placeholder="Brief description about the user..."
              />
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/super/users"
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-foreground transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create User
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}