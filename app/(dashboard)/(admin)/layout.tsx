/**
 * @file app/(dashboard)/(admin)/layout.tsx
 * @description Admin dashboard layout with sidebar navigation and authentication
 * @author Team Kenya Dev
 */

'use client'

import { useState } from 'react'
import Sidebar from '@/app/components/Sidebar'
import { AdminAuthGuard } from '@/app/components/auth/AuthGuard'
import DashboardMobileHeader from '@/app/components/DashboardMobileHeader'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <DashboardMobileHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <div className="flex flex-1">
          <Sidebar
            variant="admin"
            hideMobileButton={true}
            mobileMenuOpen={mobileMenuOpen}
            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  )
}