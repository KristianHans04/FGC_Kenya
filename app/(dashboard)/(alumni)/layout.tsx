import AuthGuard from '@/app/components/auth/AuthGuard'
import Sidebar from '@/app/components/Sidebar'

export default function AlumniLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard allowedRoles={['ALUMNI', 'ADMIN', 'SUPER_ADMIN']}>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}