'use client'

import EmailLayout from '@/app/components/email/EmailLayout'
import { useEffect } from 'react'

export default function EmailCampaigns() {
  useEffect(() => {
    document.title = 'Email Campaigns | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Create and manage email campaigns')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Create and manage email campaigns'
      document.head.appendChild(meta)
    }
  }, [])

  return <EmailLayout />
}
