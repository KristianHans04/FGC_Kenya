import { useState, useEffect } from 'react'
import { User, Mail, Phone, School, Edit, Save } from 'lucide-react'

import type { Metadata } from 'next'
import { generateMetadata } from '@/app/lib/utils/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'My Profile',
  description: 'Manage your student profile',
  noIndex: true,
})
lucide-react'

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  
  useEffect(() => {
    fetch('/api/user/profile').then(r => r.json()).then(d => setProfile(d.data))
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
        </button>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Student Name</h2>
            <p className="text-muted-foreground">FGC Kenya Student</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>student@example.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>+254 700 000000</span>
          </div>
          <div className="flex items-center gap-2">
            <School className="h-4 w-4 text-muted-foreground" />
            <span>Student School</span>
          </div>
        </div>
      </div>
    </div>
  )
}
