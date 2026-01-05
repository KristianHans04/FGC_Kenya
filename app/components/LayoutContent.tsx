/**
 * @file app/components/LayoutContent.tsx
 * @description Layout wrapper that conditionally shows header/footer
 * @author Team Kenya Dev
 */

'use client'

import { usePathname } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import ImpersonationHeader from '@/app/components/ImpersonationHeader'
import PWAProvider from '@/app/components/pwa/PWAProvider'
import { NO_LAYOUT_ROUTES } from '@/app/lib/constants'

interface LayoutContentProps {
  children: React.ReactNode
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname()

  const shouldShowLayout = !NO_LAYOUT_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  return (
    <PWAProvider>
      <ImpersonationHeader />
      <div className="min-h-screen flex flex-col overflow-x-hidden">
        {shouldShowLayout && <Header />}
        <main className="flex-grow overflow-x-hidden w-full">{children}</main>
        {shouldShowLayout && <Footer />}
      </div>
    </PWAProvider>
  )
}