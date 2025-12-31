'use client'

import { useState, useEffect } from 'react'
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    successRate: 0,
    monthlyGrowth: 0
  })

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      // Mock data for now
      setPayments([
        {
          id: '1',
          userId: 'user1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          amount: 50000,
          currency: 'KES',
          status: 'completed',
          type: 'application_fee',
          reference: 'PAY-2024-001',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        }
      ])
      
      setStats({
        totalRevenue: 250000,
        pendingAmount: 50000,
        successRate: 95.5,
        monthlyGrowth: 12.3
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Tracking</h1>
        <p className="text-muted-foreground">Monitor all financial transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Revenue</span>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">KES {stats.totalRevenue.toLocaleString()}</div>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span>+{stats.monthlyGrowth}% from last month</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Pending</span>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">KES {stats.pendingAmount.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground mt-2">Awaiting confirmation</div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Success Rate</span>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{stats.successRate}%</div>
          <div className="text-sm text-muted-foreground mt-2">Payment completion</div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Transactions</span>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{payments.length}</div>
          <div className="text-sm text-muted-foreground mt-2">This month</div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border rounded-lg hover:bg-muted flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Reference</th>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                  </td>
                </tr>
              ) : payments.map(payment => (
                <tr key={payment.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 font-mono text-sm">{payment.reference}</td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{payment.userName}</div>
                      <div className="text-sm text-muted-foreground">{payment.userEmail}</div>
                    </div>
                  </td>
                  <td className="p-4 font-medium">
                    {payment.currency} {payment.amount.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {payment.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status)}
                      <span className="text-sm capitalize">{payment.status}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    {new Date(payment.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}