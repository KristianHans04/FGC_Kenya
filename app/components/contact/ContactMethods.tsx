/**
 * @file ContactMethods.tsx
 * @description Contact methods component with map, social media, and quick links
 * @author Team Kenya Dev
 */

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { socialLinks, quickLinks } from '@/app/lib/constants/contact'

/**
 * Props for ContactMethods component
 */
interface ContactMethodsProps {
  /** Additional CSS classes */
  className?: string
}

/**
 * Contact methods component
 * Displays Google Maps, social media links, and quick links
 * 
 * @param props - ContactMethods component props
 * @returns JSX.Element - Rendered contact methods section
 */
export default function ContactMethods({ className = '' }: ContactMethodsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={`space-y-6 ${className}`}
    >
      {/* Google Maps Embed */}
      <div className="card overflow-hidden">
        <h3 className="text-lg font-semibold mb-4 px-6 pt-6">Our Location</h3>
        <div className="relative w-full h-[400px]">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d63821.5551565538!2d36.738376853367726!3d-1.2641744615581274!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e6!4m0!4m5!1s0x182f19dfce66a9dd%3A0x10e967386e3bdb0d!2soff%20James%20Gichuru%20Road%2C%20Nairobi!3m2!1d-1.2642605999999998!2d36.7795765!5e0!3m2!1sen!2ske!4v1759515100554!5m2!1sen!2ske" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="FIRST Global Team Kenya Location"
            aria-label="Google Maps showing FIRST Global Team Kenya location off James Gichuru Road, Nairobi"
          />
        </div>
      </div>

      {/* Social Media */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
        <div className="flex space-x-4">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-muted-foreground ${social.color} transition-colors`}
              aria-label={`Follow us on ${social.name}`}
            >
              <social.icon className="h-6 w-6" />
            </a>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
        <div className="space-y-2">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <link.icon className="h-4 w-4 mr-2" aria-hidden="true" />
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  )
}