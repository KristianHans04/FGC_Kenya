'use client'

import { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Activity,
  Calendar,
  Download,
  Filter
} from 'lucide-react'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<{
    userGrowth: Array<{ month: string; users: number }>;
    applicationStats: { total: number; approved: number; pending: number; rejected: number };
    revenueData: Array<{ month: string; amount: number }>;
    activityMetrics: { daily: number; weekly: number; monthly: number }
  }>({
    userGrowth: [],
    applicationStats: { total: 0, approved: 0, pending: 0, rejected: 0 },
    revenueData: [],
    activityMetrics: { daily: 0, weekly: 0, monthly: 0 }
  })

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics({
          userGrowth: data.data?.userGrowth || [],
          applicationStats: data.data?.applicationStats || {
            total: 0,
            approved: 0,
            pending: 0,
            rejected: 0
          },
          revenueData: data.data?.revenueData || [],
          activityMetrics: data.data?.activityMetrics || {
            daily: 0,
            weekly: 0,
            monthly: 0
          }
        })
      } else {
        console.error('Failed to fetch analytics')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Platform performance and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="px-4 py-2 border rounded-lg hover:bg-muted flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Users</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">1,234</div>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span>+12% from last period</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Applications</span>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{analytics.applicationStats.total}</div>
          <div className="text-sm text-muted-foreground mt-2">
            {analytics.applicationStats.pending} pending
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Revenue</span>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">KES 1.2M</div>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span>+23% from last period</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active Users</span>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{analytics.activityMetrics.daily}</div>
          <div className="text-sm text-muted-foreground mt-2">Daily active</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">User Growth</h2>
          <div className="h-64 flex items-end justify-between gap-4">
            {analytics.userGrowth.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-primary rounded-t"
                  style={{ height: `${(data.users / 250) * 100}%` }}
                />
                <div className="text-xs mt-2">{data.month}</div>
                <div className="text-xs font-medium">{data.users}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Status */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Application Status</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Approved</span>
                <span className="text-sm font-medium">{analytics.applicationStats.approved}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${(analytics.applicationStats.approved / analytics.applicationStats.total) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Pending</span>
                <span className="text-sm font-medium">{analytics.applicationStats.pending}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{ width: `${(analytics.applicationStats.pending / analytics.applicationStats.total) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Rejected</span>
                <span className="text-sm font-medium">{analytics.applicationStats.rejected}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${(analytics.applicationStats.rejected / analytics.applicationStats.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {['New user registration: john@example.com',
            'Application submitted by Sarah K.',
            'Payment received: KES 50,000',
            'Media content approved for student cohort',
            'Email campaign sent to 150 recipients'].map((activity, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 bg-primary rounded-full" />
              <span>{activity}</span>
              <span className="ml-auto text-muted-foreground">2 hours ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
