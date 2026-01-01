'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Lock, Shield } from 'lucide-react'
import { generateUserSlug } from '@/app/lib/utils/slug'

export default function CreateUserPage() {
  useEffect(() => {
    document.title = 'Create User | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Create a new user account')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Create a new user account'
      document.head.appendChild(meta)
    }
  }, [])

  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'USER',
    sendWelcomeEmail: true
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setCreating(true)
    setError('')
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: generateUserSlug()
        })
      })

      if (response.ok) {
        router.push('/admin/users')
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to create user')
      }
    } catch (error) {
      setError('An error occurred while creating the user')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/users"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Create User</h1>
              <p className="text-muted-foreground">Add a new user to the system</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="bg-card rounded-lg border p-6 space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg">
                {error}
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="John"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Account Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="user@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Enter password"
                    required
                    minLength={8}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm Password <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Role & Permissions */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role & Permissions
              </h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  User Role <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="USER">User</option>
                  <option value="STUDENT">Student</option>
                  <option value="MENTOR">Mentor</option>
                  <option value="ALUMNI">Alumni</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.sendWelcomeEmail}
                    onChange={(e) => setFormData({...formData, sendWelcomeEmail: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">Send welcome email to user</span>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}