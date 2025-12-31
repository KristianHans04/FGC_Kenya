/**
 * @file app/(dashboard)/(user)/layout.tsx
 * @description User dashboard layout with sidebar navigation and authentication
 * @author Team Kenya Dev
 */

'use client'

import Sidebar from '@/app/components/Sidebar'
import { withUserAuth } from '@/app/lib/auth/withAuth'

function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar variant="user" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

export default withUserAuth(UserDashboardLayout)