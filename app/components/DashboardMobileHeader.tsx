'use client'

import { Menu } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import Image from 'next/image'
import Link from 'next/link'

interface DashboardMobileHeaderProps {
  onMenuClick: () => void
}

export default function DashboardMobileHeader({ onMenuClick }: DashboardMobileHeaderProps) {
  return (
    <header className="md:hidden sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-4">
        {/* Theme Toggle - Left */}
        <div className="flex-shrink-0">
          <ThemeToggle />
        </div>

        {/* FGC Logo - Center */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-12 h-12 flex-shrink-0">
               <Image
                src="/images/Logo/FGC_KExFGC-logo.svg"
                alt="FIRST Global Team Kenya Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold bg-gradient-to-r from-red-600 via-black to-green-600 bg-clip-text text-transparent">
                FGC KENYA
              </p>
            </div>
          </Link>
        </div>

        {/* Hamburger Menu - Right */}
        <button
          onClick={onMenuClick}
          className="flex-shrink-0 p-2 hover:bg-muted rounded-md transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}