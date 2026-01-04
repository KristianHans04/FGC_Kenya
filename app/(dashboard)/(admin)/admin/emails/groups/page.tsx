'use client'

import EmailLayout from '@/app/components/email/EmailLayout'
import { useEffect } from 'react'

export default function EmailGroups() {
  useEffect(() => {
    document.title = 'Email Groups | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Manage email recipient groups')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Manage email recipient groups'
      document.head.appendChild(meta)
    }
  }, [])

  return <EmailLayout />
}