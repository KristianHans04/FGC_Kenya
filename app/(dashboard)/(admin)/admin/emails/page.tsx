'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'


export default function AdminEmailsPage() {
  
  useEffect(() => {
    document.title = 'Email Management | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Manage email communications and campaigns')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Manage email communications and campaigns'
      document.head.appendChild(meta)
    }
  }, [])


  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the new email inbox
    router.push('/admin/emails/inbox')
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}
