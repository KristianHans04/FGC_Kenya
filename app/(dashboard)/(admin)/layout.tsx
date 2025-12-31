/**
 * @file app/(dashboard)/(admin)/layout.tsx
 * @description Admin dashboard layout with sidebar navigation and authentication
 * @author Team Kenya Dev
 */

'use client'

import Sidebar from '@/app/components/Sidebar'
import { withAdminAuth } from '@/app/lib/auth/withAuth'

function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar variant="admin" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

export default withAdminAuth(AdminDashboardLayout)