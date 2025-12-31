/**
 * @file FAQSection.tsx
 * @description FAQ section component using reusable accordion
 * @author Team Kenya Dev
 */

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { faqItems } from '@/app/lib/constants/contact'
import Accordion, { AccordionItemData } from '@/app/components/ui/Accordion'

/**
 * Props for FAQSection component
 */
interface FAQSectionProps {
  /** Additional CSS classes */
  className?: string
}

/**
 * FAQ section component
 * Displays frequently asked questions using accordion component
 * 
 * @param props - FAQSection component props
 * @returns JSX.Element - Rendered FAQ section with accordion
 */
export default function FAQSection({ className = '' }: FAQSectionProps) {
  // Transform FAQ data into accordion format
  const accordionItems: AccordionItemData[] = faqItems.map((item, index) => ({
    id: `faq-${index}`,
    title: item.question,
    content: (
      <div className="text-muted-foreground text-sm">
        <p className="mb-2">{item.answer}</p>
        {item.link && (
          <Link
            href={item.link}
            className="text-primary hover:text-primary-light font-medium inline-flex items-center"
          >
            Learn more
            <MessageSquare className="ml-1 h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    ),
  }))

  /**
   * Handle contact support button click
   */
  const handleContactSupport = () => {
    // Scroll to contact form
    const nameField = document.getElementById('name')
    if (nameField) {
      nameField.focus()
      nameField.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <section className={`py-16 bg-muted/30 ${className}`}>
      <div className="container px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-12">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>

          <Accordion
            items={accordionItems}
            allowMultiple={false}
            className="mb-8"
          />

          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">
              Didn't find what you're looking for?
            </p>
            <button
              onClick={handleContactSupport}
              className="btn-primary"
              type="button"
            >
              Contact Support
              <MessageSquare className="ml-2 h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}