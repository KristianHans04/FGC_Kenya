/**
 * @file app/(dashboard)/(user)/layout.tsx
 * @description User dashboard layout with sidebar navigation and authentication
 * @author Team Kenya Dev
 */

import Sidebar from '@/app/components/Sidebar'
import { UserAuthGuard } from '@/app/components/auth/AuthGuard'

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserAuthGuard>
      <div className="min-h-screen bg-background flex">
        <Sidebar variant="user" />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </UserAuthGuard>
  )
}