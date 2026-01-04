'use client'

import { useState } from 'react'
import AuthGuard from '@/app/components/auth/AuthGuard'
import Sidebar from '@/app/components/Sidebar'
import DashboardMobileHeader from '@/app/components/DashboardMobileHeader'

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <AuthGuard allowedRoles={['MENTOR', 'ADMIN', 'SUPER_ADMIN']}>
      <div className="flex flex-col h-screen">
        <DashboardMobileHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <div className="flex flex-1">
          <Sidebar
            hideMobileButton={true}
            mobileMenuOpen={mobileMenuOpen}
            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
          <main className="flex-1 overflow-y-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}