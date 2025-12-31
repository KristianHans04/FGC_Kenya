/**
 * @file components/dashboard/DashboardSidebar.tsx
 * @description Collapsible dashboard sidebar that adapts based on user role
 * @author Team Kenya Dev
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import { Role } from '@/app/types/auth'
import { cn } from '@/app/lib/utils'
import { 
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  UserCheck,
  Mail,
  FileText,
  DollarSign,
  BarChart,
  Settings,
  LogOut,
  GraduationCap,
  BookOpen,
  PenTool,
  Calendar,
  Award,
  Send,
  Inbox,
  FolderOpen
} from 'lucide-react'

interface SidebarItem {
  title: string
  href: string
  icon: React.ElementType
  roles: Role[]
  badge?: number
}

const sidebarItems: SidebarItem[] = [
  // Common items
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.MENTOR, Role.STUDENT, Role.ALUMNI, Role.USER]
  },
  
  // Super Admin only
  {
    title: 'All Users',
    href: '/dashboard/users',
    icon: Users,
    roles: [Role.SUPER_ADMIN]
  },
  {
    title: 'Payments',
    href: '/dashboard/payments',
    icon: DollarSign,
    roles: [Role.SUPER_ADMIN]
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart,
    roles: [Role.SUPER_ADMIN, Role.ADMIN]
  },
  
  // Admin & Super Admin
  {
    title: 'User Management',
    href: '/dashboard/users/manage',
    icon: UserCheck,
    roles: [Role.ADMIN]
  },
  {
    title: 'Applications',
    href: '/dashboard/applications',
    icon: FolderOpen,
    roles: [Role.SUPER_ADMIN, Role.ADMIN]
  },
  {
    title: 'Email',
    href: '/dashboard/email',
    icon: Mail,
    roles: [Role.SUPER_ADMIN, Role.ADMIN]
  },
  {
    title: 'Campaigns',
    href: '/dashboard/campaigns',
    icon: Send,
    roles: [Role.SUPER_ADMIN, Role.ADMIN]
  },
  {
    title: 'Media Manager',
    href: '/dashboard/media',
    icon: FileText,
    roles: [Role.SUPER_ADMIN, Role.ADMIN]
  },
  
  // Mentor specific
  {
    title: 'My Cohort',
    href: '/dashboard/cohort',
    icon: GraduationCap,
    roles: [Role.MENTOR]
  },
  {
    title: 'Student Articles',
    href: '/dashboard/articles/review',
    icon: BookOpen,
    roles: [Role.MENTOR]
  },
  
  // Student specific
  {
    title: 'My Articles',
    href: '/dashboard/articles',
    icon: PenTool,
    roles: [Role.STUDENT]
  },
  {
    title: 'Cohort Members',
    href: '/dashboard/cohort/members',
    icon: Users,
    roles: [Role.STUDENT]
  },
  {
    title: 'Schedule',
    href: '/dashboard/schedule',
    icon: Calendar,
    roles: [Role.STUDENT]
  },
  
  // Alumni specific
  {
    title: 'Alumni Network',
    href: '/dashboard/alumni',
    icon: Award,
    roles: [Role.ALUMNI]
  },
  
  // User specific
  {
    title: 'My Application',
    href: '/dashboard/application',
    icon: FileText,
    roles: [Role.USER]
  },
  
  // Settings (all roles)
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.MENTOR, Role.STUDENT, Role.ALUMNI, Role.USER]
  }
]

export default function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, logout, hasRole } = useAuth()

  if (!user) return null

  // Filter items based on user role
  const filteredItems = sidebarItems.filter(item => 
    item.roles.some(role => hasRole(role))
  )

  const handleLogout = async () => {
    await logout()
  }

  return (
    <aside className={cn(
      "bg-card border-r h-screen sticky top-0 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-lg">FGC Kenya</h2>
              <p className="text-sm text-muted-foreground capitalize">
                {user.currentRole.toLowerCase()} Dashboard
              </p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-medium">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
                {user.currentCohort && (
                  <p className="text-xs text-primary mt-1">
                    {user.currentCohort}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {filteredItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                              (item.href !== '/dashboard' && pathname.startsWith(item.href))
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                      "hover:bg-accent",
                      isActive && "bg-accent text-accent-foreground",
                      isCollapsed && "justify-center"
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon size={20} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              "hover:bg-accent w-full text-left",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}