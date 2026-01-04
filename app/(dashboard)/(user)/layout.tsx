/**
 * @file app/(dashboard)/(user)/layout.tsx
 * @description User dashboard layout with sidebar navigation and authentication
 * @author Team Kenya Dev
 */

'use client'

import { useState } from 'react'
import Sidebar from '@/app/components/Sidebar'
import { UserAuthGuard } from '@/app/components/auth/AuthGuard'
import DashboardMobileHeader from '@/app/components/DashboardMobileHeader'

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <UserAuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <DashboardMobileHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <div className="flex flex-1">
          <Sidebar
            variant="user"
            hideMobileButton={true}
            mobileMenuOpen={mobileMenuOpen}
            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </UserAuthGuard>
  )
}