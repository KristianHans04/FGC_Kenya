import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import type { Metadata } from 'next'
import { generateMetadata } from '@/app/lib/utils/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Email Management',
  description: 'Manage email communications',
  noIndex: true,
})
ort { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminEmailsPage() {
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