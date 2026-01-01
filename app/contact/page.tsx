/**
 * @file page.tsx
 * @description Contact page for <i>FIRST</i> Global Team Kenya with modular components
 * @author Team Kenya Dev
 */

'use client'

import { useEffect } from 'react'

import { motion } from 'framer-motion'
import ContactInfo from '@/app/components/contact/ContactInfo'
import ContactForm from '@/app/components/contact/ContactForm'
import ContactMethods from '@/app/components/contact/ContactMethods'
import FAQSection from '@/app/components/contact/FAQSection'

/**
 * ContactPage component
 * Displays contact information, FAQ, and a contact form using modular components
 * 
 * @returns {JSX.Element} The contact page component
 */
export default function ContactPage() {
  useEffect(() => {
    document.title = 'Contact Us | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Get in touch with FIRST Global Team Kenya')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Get in touch with FIRST Global Team Kenya'
      document.head.appendChild(meta)
    }
  }, [])


  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 african-pattern opacity-5" aria-hidden="true"></div>
        <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex items-center justify-center space-x-2 mb-6" aria-hidden="true">
              <div className="h-1 w-8 bg-kenya-black"></div>
              <div className="h-1 w-8 bg-kenya-red"></div>
              <div className="h-1 w-8 bg-kenya-green"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions? Want to partner with us? We'd love to hear from you!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <ContactInfo />

      {/* Contact Form & Methods */}
      <section className="py-16 overflow-hidden">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <ContactForm />
              </motion.div>

              <ContactMethods />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />
    </>
  )
}