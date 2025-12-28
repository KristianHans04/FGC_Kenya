'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, User, LogOut, Settings, Users, ChevronDown } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useAuth } from '@/app/lib/contexts/AuthContext'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Media', href: '/media' },
  { name: 'Impact', href: '/impact' },
  { name: 'Join Us', href: '/join' },
  { name: 'Support', href: '/support' },
  { name: 'Contact', href: '/contact' },
]

/**
 * Header component
 * Displays the main navigation bar with logo, links, theme toggle, and mobile menu
 * 
 * @returns {JSX.Element} The header component
 */
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === 'system' ? systemTheme : theme
  const { user, isAuthenticated, logout } = useAuth()
  const userMenuRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    try {
      await logout()
      setUserMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Global">
        <div className="flex items-center justify-between py-4">
          <div className="flex flex-1 items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-12 h-12">
                <Image
                  src="/images/FGC_Logo.svg"
                  alt="FIRST Global Team Kenya Logo"
                  width={48}
                  height={48}
                  className={`transition-all duration-300 ${currentTheme === 'dark' ? 'brightness-0 invert' : ''}`}
                  priority
                />
              </div>
              <div>
                <p className="text-lg font-bold font-heading"><i>FIRST</i> Global</p>
                <p className="text-xs text-muted-foreground">Team Kenya</p>
              </div>
            </Link>
          </div>
          
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-1 items-center justify-end gap-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:block">
                    {user?.firstName || user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>

                      {user?.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Link>
                      )}

                      <hr className="my-1" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden lg:inline-flex btn-primary text-sm"
              >
                Login
              </Link>
            )}

            <Link
              href="/support"
              className="hidden lg:inline-flex btn-secondary text-sm"
            >
              Donate
            </Link>

            <button
              type="button"
              className="lg:hidden -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <motion.div
        initial={{ y: '-100%' }}
        animate={mobileMenuOpen ? { y: 0 } : { y: '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 right-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden bg-background p-6 lg:hidden w-full"
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-12 h-12">
              <Image
                src="/images/FGC_Logo.svg"
                alt="FIRST Global Team Kenya Logo"
                width={48}
                height={48}
                className={`transition-all duration-300 ${currentTheme === 'dark' ? 'brightness-0 invert' : ''}`}
                priority
              />
            </div>
            <div>
              <p className="text-lg font-bold font-heading">FIRST Global</p>
              <p className="text-xs text-muted-foreground">Team Kenya</p>
            </div>
          </Link>
          <button
            type="button"
            className="-m-2.5 rounded-md p-2.5 text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="sr-only">Close menu</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-6 flow-root">
          <div className="-my-6 divide-y divide-gray-500/10">
            <div className="space-y-2 py-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 inline mr-2" />
                    Dashboard
                  </Link>

                  {user?.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Users className="h-4 w-4 inline mr-2" />
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted text-left w-full"
                  >
                    <LogOut className="h-4 w-4 inline mr-2" />
                    Logout
                  </button>
                </>
              )}
            </div>

            <div className="py-6 space-y-3">
              {!isAuthenticated && (
                <Link
                  href="/login"
                  className="btn-primary w-full text-center block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}

              <Link
                href="/support"
                className="btn-secondary w-full text-center block"
                onClick={() => setMobileMenuOpen(false)}
              >
                Support Team Kenya
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </header>
  )
}