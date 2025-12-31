import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {

import type { Metadata } from 'next'
import { generateMetadata } from '@/app/lib/utils/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Admin Dashboard',
  description: 'Administrative dashboard for FIRST Global Team Kenya',
  noIndex: true,
})
/

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users,
  FileText,
  BarChart3,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Mail,
  Shield,
  Eye,
  Edit,
  UserPlus,
  Download
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalApplications: number
  pendingApplications: number
  recentApplications: number
  activeAdmins: number
}

interface RecentActivity {
  id: string
  type: 'application' | 'user' | 'review'
  description: string
  timestamp: string
  user?: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
    fetchRecentActivity()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/activity')
      if (response.ok) {
        const data = await response.json()
        setRecentActivity(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch recent activity:', error)
    }
  }

  const quickActions = [
    {
      title: 'Review Applications',
      description: 'Review and manage student applications',
      icon: FileText,
      href: '/admin/applications',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Manage Users',
      description: 'Add, edit, and manage user accounts',
      icon: Users,
      href: '/admin/users',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'User Statistics',
      description: 'View detailed user and application metrics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Email Settings',
      description: 'Configure email notifications and templates',
      icon: Mail,
      href: '/admin/settings',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage applications, users, and system settings</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/export"
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Link>
          </div>
        </div>
        {/* Subtle Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-lg font-semibold">{stats.totalUsers}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-lg font-semibold">{stats.totalApplications}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-lg font-semibold">{stats.pendingApplications}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Recent Applications</p>
                <p className="text-lg font-semibold">{stats.recentApplications}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={action.href} className="block">
                  <div className="card hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${action.bgColor}`}>
                        <Icon className={`h-6 w-6 ${action.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Recent Applications
              </h2>
              <Link href="/admin/applications" className="text-primary hover:text-primary/80 font-medium">
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading applications...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mock data for now - replace with real data */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Sarah Muthoni</p>
                      <p className="text-sm text-muted-foreground">2026 Season Application</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-xs rounded-full">
                      Under Review
                    </span>
                    <span className="text-xs text-muted-foreground">2h ago</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">David Ochieng</p>
                      <p className="text-sm text-muted-foreground">2026 Season Application</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-full">
                      Shortlisted
                    </span>
                    <span className="text-xs text-muted-foreground">5h ago</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Activity
              </h2>
            </div>

            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      {activity.type === 'application' && <FileText className="h-4 w-4 text-primary" />}
                      {activity.type === 'user' && <Users className="h-4 w-4 text-primary" />}
                      {activity.type === 'review' && <Eye className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                        {new Date(activity.timestamp).toLocaleTimeString()}
                        {activity.user && ` by ${activity.user}`}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="card mt-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            System Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Database</p>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Email Service</p>
                  <p className="text-sm text-muted-foreground">Operational</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Application System</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}