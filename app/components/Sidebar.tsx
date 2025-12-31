/**
 * @file app/components/Sidebar.tsx
 * @description Role-based collapsible sidebar with proper navigation
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import { cn } from '@/app/lib/utils'
import Image from 'next/image'
import { getNavigationByRole } from '@/app/lib/constants/navigation'
import { useTheme } from 'next-themes'

interface SidebarProps {
  variant?: 'user' | 'admin'
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  // Get navigation items based on user role
  const navigationItems = user ? getNavigationByRole(user.currentRole || user.role || 'USER') : []

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState))
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isActive = (href: string) => {
    if (href === '/admin' || href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b">
        <Link href="/" className={cn(
          "flex items-center gap-3 transition-all",
          isCollapsed && !isHovered && "justify-center"
        )}>
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image
              src="/images/FGC_Logo.svg"
              alt="FGC Kenya"
              width={40}
              height={40}
              className="transition-all duration-300"
            />
          </div>
          {(!isCollapsed || isHovered) && (
            <div>
              <p className="font-bold text-sm">FGC KENYA</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.currentRole?.toLowerCase() || user?.role?.toLowerCase() || 'user'}
              </p>
            </div>
          )}
        </Link>
        
        {/* Collapse button - Desktop only */}
        <button
          onClick={toggleCollapsed}
          className="hidden lg:block p-1 hover:bg-muted rounded transition-colors"
        >
          {isCollapsed && !isHovered ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                "hover:bg-muted",
                active && "bg-primary/10 text-primary font-medium",
                isCollapsed && !isHovered && "justify-center"
              )}
              title={isCollapsed && !isHovered ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {(!isCollapsed || isHovered) && (
                <span className="text-sm">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t">
        <div className={cn(
          "flex items-center gap-3 mb-3",
          isCollapsed && !isHovered && "justify-center"
        )}>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium">
              {user?.firstName?.[0] || user?.email?.[0] || 'U'}
            </span>
          </div>
          {(!isCollapsed || isHovered) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>
        
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-2",
            "hover:bg-accent hover:text-accent-foreground transition-all",
            isCollapsed && !isHovered && "justify-center"
          )}
          title={isCollapsed && !isHovered ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : undefined}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 flex-shrink-0" />
          ) : (
            <Moon className="h-5 w-5 flex-shrink-0" />
          )}
          {(!isCollapsed || isHovered) && (
            <span className="text-sm">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>
        
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg",
            "hover:bg-destructive/10 hover:text-destructive transition-all",
            isCollapsed && !isHovered && "justify-center"
          )}
          title={isCollapsed && !isHovered ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {(!isCollapsed || isHovered) && (
            <span className="text-sm">Logout</span>
          )}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background border rounded-lg shadow-md"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />
            
            {/* Sidebar */}
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="lg:hidden fixed left-0 top-0 h-full w-72 bg-background border-r z-50 flex flex-col"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-background border-r transition-all duration-300",
          isCollapsed && !isHovered ? "w-16" : "w-64",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {sidebarContent}
      </aside>
    </>
  )
}