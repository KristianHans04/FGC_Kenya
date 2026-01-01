'use client'

import { useEffect } from 'react'
import EmailLayout from '@/app/components/email/EmailLayout'

export default function ArchivedEmailsPage() {
  useEffect(() => {
    document.title = 'Archived Emails | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'View your archived email messages')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'View your archived email messages'
      document.head.appendChild(meta)
    }
  }, [])

  return <EmailLayout />
}