'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function CampaignAnalyticsPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  return (
    <div className="p-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Campaigns
      </button>
      
      <h1 className="text-3xl font-bold mb-4">Campaign Analytics</h1>
      <p className="text-muted-foreground">Campaign ID: {params.id}</p>
      
      <div className="mt-8 bg-card rounded-lg border p-6">
        <p className="text-center text-muted-foreground">Analytics data will be displayed here</p>
      </div>
    </div>
  )
}