/**
 * @file app/(dashboard)/(admin)/layout.tsx
 * @description Admin dashboard layout with sidebar navigation and authentication
 * @author Team Kenya Dev
 */

import Sidebar from '@/app/components/Sidebar'
import { AdminAuthGuard } from '@/app/components/auth/AuthGuard'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-background flex">
        <Sidebar variant="admin" />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  )
}