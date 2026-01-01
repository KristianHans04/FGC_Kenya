'use client'

import { useEffect } from 'react'
import EmailLayout from '@/app/components/email/EmailLayout'

export default function TrashEmailsPage() {
  useEffect(() => {
    document.title = 'Trash | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'View deleted email messages')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'View deleted email messages'
      document.head.appendChild(meta)
    }
  }, [])

  return <EmailLayout />
}