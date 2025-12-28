/**
 * @file app/(dashboard)/(user)/layout.tsx
 * @description User dashboard layout with sidebar navigation
 * @author Team Kenya Dev
 */

import Sidebar from '@/app/components/Sidebar'

export default function UserDashboardLayout({
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