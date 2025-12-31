/**
 * @file ContactInfo.tsx
 * @description Contact information cards component
 * @author Team Kenya Dev
 */

'use client'

import { motion } from 'framer-motion'
import { contactInfo } from '@/app/lib/constants/contact'

/**
 * Props for ContactInfo component
 */
interface ContactInfoProps {
  /** Additional CSS classes */
  className?: string
}

/**
 * Contact information cards component
 * Displays email, address, and hours in styled cards
 * 
 * @param props - ContactInfo component props
 * @returns JSX.Element - Rendered contact information section
 */
export default function ContactInfo({ className = '' }: ContactInfoProps) {
  return (
    <section className={`py-16 bg-muted/30 overflow-hidden ${className}`}>
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {contactInfo.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <item.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                {item.link ? (
                  <a
                    href={item.link}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors break-all px-2"
                    aria-label={`Contact us via ${item.title}: ${item.details}`}
                  >
                    {item.details}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">{item.details}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}