'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function ComposeEmailPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ group?: string }> 
}) {
  const router = useRouter()
  const params = use(searchParams)
  const groupId = params?.group

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Email Groups
      </button>
      
      <h1 className="text-3xl font-bold mb-4">Compose Email</h1>
      {groupId && (
        <p className="text-muted-foreground mb-6">Composing email for group ID: {groupId}</p>
      )}
      
      <div className="bg-card rounded-lg border p-6">
        <p className="text-center text-muted-foreground">
          Email composer will be implemented here
        </p>
      </div>
    </div>
  )
}