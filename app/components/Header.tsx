'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { motion } from 'framer-motion'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'News', href: '/news' },
  { name: 'Impact', href: '/impact' },
  { name: 'Join Us', href: '/join' },
  { name: 'Support', href: '/support' },
  { name: 'Resources', href: '/resources' },
  { name: 'Contact', href: '/contact' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Global">
        <div className="flex items-center justify-between py-4">
          <div className="flex lg:flex-1">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-kenya-green rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">FG</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-kenya-red rounded-full"></div>
              </div>
              <div>
                <p className="text-lg font-bold font-heading">FIRST Global</p>
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

          <div className="flex items-center gap-4 lg:flex-1 lg:justify-end">
            <ThemeToggle />
            <Link
              href="/support"
              className="hidden lg:inline-flex btn-primary text-sm"
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
        initial={false}
        animate={mobileMenuOpen ? { x: 0 } : { x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 lg:hidden"
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-kenya-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">FG</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-kenya-red rounded-full"></div>
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
            </div>
            <div className="py-6">
              <Link
                href="/support"
                className="btn-primary w-full text-center"
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