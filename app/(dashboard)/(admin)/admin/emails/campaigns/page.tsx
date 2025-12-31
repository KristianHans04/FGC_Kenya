import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {

import type { Metadata } from 'next'
import { generateMetadata } from '@/app/lib/utils/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Email Campaigns',
  description: 'Create and manage email campaigns',
  noIndex: true,
})
act'
import { motion } from 'framer-motion'
import {
  Send,
  Plus,
  Calendar,
  Users,
  BarChart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  Copy
} from 'lucide-react'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  subject: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed'
  recipientCount: number
  sentCount: number
  openRate: number
  clickRate: number
  bounceRate: number
  scheduledAt?: string
  sentAt?: string
  createdAt: string
  group?: {
    id: string
    name: string
  }
}

export default function EmailCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled' | 'sent'>('all')

  useEffect(() => {
    fetchCampaigns()
  }, [filter])

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)
      
      const response = await fetch(`/api/admin/emails/campaigns?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.data?.campaigns || [])
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to send this campaign now?')) return

    try {
      await fetch(`/api/admin/emails/campaigns/${campaignId}/send`, {
        method: 'POST'
      })
      fetchCampaigns()
    } catch (error) {
      console.error('Failed to send campaign:', error)
    }
  }

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      await fetch(`/api/admin/emails/campaigns/${campaignId}/pause`, {
        method: 'POST'
      })
      fetchCampaigns()
    } catch (error) {
      console.error('Failed to pause campaign:', error)
    }
  }

  const handleDuplicateCampaign = async (campaignId: string) => {
    try {
      await fetch(`/api/admin/emails/campaigns/${campaignId}/duplicate`, {
        method: 'POST'
      })
      fetchCampaigns()
    } catch (error) {
      console.error('Failed to duplicate campaign:', error)
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    try {
      await fetch(`/api/admin/emails/campaigns/${campaignId}`, {
        method: 'DELETE'
      })
      fetchCampaigns()
    } catch (error) {
      console.error('Failed to delete campaign:', error)
    }
  }

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'sending': return 'bg-yellow-100 text-yellow-800'
      case 'sent': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-orange-100 text-orange-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'draft': return Edit
      case 'scheduled': return Clock
      case 'sending': return Send
      case 'sent': return CheckCircle
      case 'paused': return Pause
      case 'failed': return XCircle
      default: return AlertCircle
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Campaigns</h1>
          <p className="text-muted-foreground">Manage and track email campaigns</p>
        </div>
        <Link
          href="/admin/emails/campaigns/create"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Campaign
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b">
        {(['all', 'draft', 'scheduled', 'sent'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`pb-2 px-4 capitalize ${
              filter === status 
                ? 'border-b-2 border-primary font-medium' 
                : 'text-muted-foreground'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-card rounded-lg border p-12 text-center">
            <Send className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No campaigns found</p>
            <Link
              href="/admin/emails/campaigns/create"
              className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
            >
              <Plus className="h-4 w-4" />
              Create your first campaign
            </Link>
          </div>
        ) : (
          campaigns.map((campaign) => {
            const StatusIcon = getStatusIcon(campaign.status)
            
            return (
              <div key={campaign.id} className="bg-card rounded-lg border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{campaign.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        <StatusIcon className="inline h-3 w-3 mr-1" />
                        {campaign.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      Subject: {campaign.subject}
                    </p>
                    
                    {campaign.group && (
                      <p className="text-sm text-muted-foreground">
                        Group: {campaign.group.name}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {campaign.status === 'draft' && (
                      <>
                        <Link
                          href={`/admin/emails/campaigns/${campaign.id}/edit`}
                          className="p-2 hover:bg-muted rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleSendCampaign(campaign.id)}
                          className="p-2 hover:bg-muted rounded text-primary"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    
                    {campaign.status === 'sending' && (
                      <button
                        onClick={() => handlePauseCampaign(campaign.id)}
                        className="p-2 hover:bg-muted rounded text-orange-500"
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                    )}
                    
                    {campaign.status === 'sent' && (
                      <Link
                        href={`/admin/emails/campaigns/${campaign.id}/analytics`}
                        className="p-2 hover:bg-muted rounded"
                      >
                        <BarChart className="h-4 w-4" />
                      </Link>
                    )}
                    
                    <button
                      onClick={() => handleDuplicateCampaign(campaign.id)}
                      className="p-2 hover:bg-muted rounded"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="p-2 hover:bg-muted rounded text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Recipients</p>
                    <p className="font-medium">{campaign.recipientCount.toLocaleString()}</p>
                  </div>
                  
                  {campaign.status === 'sent' && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground">Sent</p>
                        <p className="font-medium">{campaign?.sentCount?.toLocaleString() || '0'}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground">Open Rate</p>
                        <p className="font-medium">{campaign?.openRate || 0}%</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground">Click Rate</p>
                        <p className="font-medium">{campaign.clickRate}%</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground">Bounce Rate</p>
                        <p className="font-medium">{campaign.bounceRate}%</p>
                      </div>
                    </>
                  )}
                  
                  {campaign.status === 'scheduled' && campaign.scheduledAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Scheduled For</p>
                      <p className="font-medium">
                        {new Date(campaign.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  {campaign.status === 'sent' && campaign.sentAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Sent At</p>
                      <p className="font-medium">
                        {new Date(campaign.sentAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}