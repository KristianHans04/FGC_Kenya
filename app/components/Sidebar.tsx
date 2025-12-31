/**
 * @file app/components/Sidebar.tsx
 * @description Collapsible sidebar component with navigation
 * @author Team Kenya Dev
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  Settings,
  LogOut,
  User,
  BarChart3,
  Users,
  Mail,
  Calendar,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import { cn } from '@/app/lib/utils'
import Image from 'next/image'
import { PROGRAMS, USER_NAVIGATION, ADMIN_NAVIGATION, BRAND } from '@/app/lib/constants'

interface SidebarItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: SidebarItem[]
}

interface SidebarProps {
  variant: 'user' | 'admin'
  className?: string
}

const userSidebarItems: SidebarItem[] = [
  {
    label: USER_NAVIGATION.DASHBOARD.label,
    href: USER_NAVIGATION.DASHBOARD.href,
    icon: Home,
  },
  {
    label: USER_NAVIGATION.APPLICATIONS.label,
    href: USER_NAVIGATION.APPLICATIONS.href,
    icon: FileText,
    children: USER_NAVIGATION.APPLICATIONS.children.map(child => ({
      label: child.label,
      href: child.href,
      icon: FileText,
    })),
  },
  {
    label: USER_NAVIGATION.SETTINGS.label,
    href: USER_NAVIGATION.SETTINGS.href,
    icon: Settings,
  },
]

const adminSidebarItems: SidebarItem[] = [
  {
    label: ADMIN_NAVIGATION.DASHBOARD.label,
    href: ADMIN_NAVIGATION.DASHBOARD.href,
    icon: BarChart3,
  },
  {
    label: ADMIN_NAVIGATION.USER_MANAGEMENT.label,
    href: ADMIN_NAVIGATION.USER_MANAGEMENT.href,
    icon: Users,
  },
  {
    label: ADMIN_NAVIGATION.APPLICATIONS.label,
    href: ADMIN_NAVIGATION.APPLICATIONS.href,
    icon: FileText,
  },
  {
    label: ADMIN_NAVIGATION.EMAILS.label,
    href: ADMIN_NAVIGATION.EMAILS.href,
    icon: Mail,
  },
  {
    label: ADMIN_NAVIGATION.EVENTS.label,
    href: ADMIN_NAVIGATION.EVENTS.href,
    icon: Calendar,
  },
]

export default function Sidebar({ variant, className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuth()

  const sidebarItems = variant === 'admin' ? adminSidebarItems : userSidebarItems
  const shouldExpand = !isCollapsed || isHovered

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleExpanded = (label: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(label)) {
      newExpanded.delete(label)
    } else {
      newExpanded.add(label)
    }
    setExpandedItems(newExpanded)
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true
    if (href === '/admin' && pathname === '/admin') return true
    return pathname.startsWith(href) && href !== '/dashboard' && href !== '/admin'
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className={cn(
        "flex items-center px-4 py-6 border-b border-border transition-all duration-200",
        isCollapsed && !isHovered && "justify-center px-2"
      )}>
        <div className="flex items-center space-x-3">
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image
              src={BRAND.LOGO_PATH}
              alt={BRAND.NAME}
              fill
              className="object-contain"
            />
          </div>
          <AnimatePresence>
            {shouldExpand && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="text-lg font-bold font-heading text-primary">
                  {BRAND.SHORT_NAME}
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* User Info */}
      <div className={cn(
        "px-4 py-4 border-b border-border transition-all duration-200",
        isCollapsed && !isHovered && "px-2"
      )}>
        <div className={cn(
          "flex items-center space-x-3",
          isCollapsed && !isHovered && "justify-center"
        )}>
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <AnimatePresence>
            {shouldExpand && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden min-w-0 flex-1"
              >
                <p className="text-sm font-medium truncate">
                  {user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.currentRole?.toLowerCase()}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => (
          <div key={item.label}>
            <Link
              href={item.href}
              onClick={(e) => {
                if (item.children) {
                  e.preventDefault()
                  toggleExpanded(item.label)
                }
              }}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                isCollapsed && !isHovered && "justify-center px-2",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "flex-shrink-0 transition-all duration-200",
                isCollapsed && !isHovered ? "h-5 w-5" : "h-4 w-4 mr-3"
              )} />
              <AnimatePresence>
                {shouldExpand && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="truncate whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.children && shouldExpand && (
                <ChevronRight
                  className={cn(
                    "ml-auto h-4 w-4 transition-transform",
                    expandedItems.has(item.label) && "rotate-90"
                  )}
                />
              )}
            </Link>

            {/* Submenu */}
            <AnimatePresence>
              {item.children && expandedItems.has(item.label) && shouldExpand && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="ml-7 mt-1 space-y-1 overflow-hidden"
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
                        isActive(child.href)
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <child.icon className="h-3 w-3 mr-2" />
                      {child.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-border">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:bg-muted hover:text-foreground transition-all duration-200",
            isCollapsed && !isHovered && "justify-center px-2"
          )}
        >
          <LogOut className={cn(
            "flex-shrink-0 transition-all duration-200",
            isCollapsed && !isHovered ? "h-5 w-5" : "h-4 w-4 mr-3"
          )} />
          <AnimatePresence>
            {shouldExpand && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="truncate whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 bg-background border border-border rounded-lg shadow-lg"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div 
        className={cn(
          "hidden md:flex flex-col bg-card border-r border-border transition-all duration-300 relative",
          isCollapsed && !isHovered ? "w-16" : "w-64",
          className
        )}
        onMouseEnter={() => isCollapsed && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <SidebarContent />

        {/* Collapse Toggle */}
        <div className="p-2 border-t border-border">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center w-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}