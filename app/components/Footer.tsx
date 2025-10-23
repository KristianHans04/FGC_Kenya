'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { useTheme } from 'next-themes'

const footerLinks = {
  about: [
    { name: 'Our Story', href: '/about' },
    { name: 'Team Members', href: '/about#team' },
    { name: 'Achievements', href: '/about#achievements' },
    { name: 'Partners', href: '/about#partners' },
  ],
  programs: [
    { name: 'FIRST Global Challenge', href: '/about#fgc' },
    { name: 'Outreach Programs', href: '/impact' },
    { name: 'Workshops', href: '/resources' },
  ],
  support: [
    { name: 'Donate', href: '/support' },
    { name: 'Sponsor', href: '/support#sponsor' },
    { name: 'Partner with Us', href: '/contact' },
  ],
  resources: [
    // { name: 'News & Updates', href: '/news' },
    { name: 'Impact Stories', href: '/impact' },
    { name: 'Learning Resources', href: '/resources' },
    { name: 'Contact Us', href: '/contact' },
  ],
}

const socialLinks = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'LinkedIn', href: '#', icon: Linkedin },
  { name: 'YouTube', href: '#', icon: Youtube },
]

export default function Footer() {
  console.log('Footer rendered');
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === 'system' ? systemTheme : theme
  
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/FGC_Logo.svg"
                  alt="FIRST Global Team Kenya Logo"
                  width={40}
                  height={40}
                  className={`transition-all duration-300 ${currentTheme === 'dark' ? 'brightness-0 invert' : ''}`}
                />
              </div>
              <div>
                <p className="text-lg font-bold font-heading"><i>FIRST</i> Global</p>
                <p className="text-xs text-muted-foreground">Team Kenya</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Inspiring the next generation of Kenyan innovators through robotics and STEM education.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={item.name}
                >
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-3 lg:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">About Us</h3>
              <ul className="space-y-2">
                {footerLinks.about.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Programs</h3>
              <ul className="space-y-2">
                {footerLinks.programs.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Get Involved</h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-foreground mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <p className="text-sm text-muted-foreground">
                  Nairobi, Kenya
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href="mailto:teamkenyarobotics254@gmail.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  teamkenyarobotics254@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href="tel:+254700000000"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  +254 700 000 000
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="h-1 w-8 bg-kenya-black"></div>
              <div className="h-1 w-8 bg-kenya-red"></div>
              <div className="h-1 w-8 bg-kenya-green"></div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} FIRST Global Team Kenya. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                href="/privacy"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}