'use client'

import { useEffect } from 'react'
import EmailLayout from '@/app/components/email/EmailLayout'

export default function DraftsEmailsPage() {
  useEffect(() => {
    document.title = 'Email Drafts | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Manage your draft email messages')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Manage your draft email messages'
      document.head.appendChild(meta)
    }
  }, [])

  return <EmailLayout />
}