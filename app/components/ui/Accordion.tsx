/**
 * @file Accordion.tsx
 * @description Reusable accordion component for expandable content sections
 * @author Team Kenya Dev
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface AccordionItemData {
  id?: string
  title: string
  content: React.ReactNode
  defaultOpen?: boolean
}

interface AccordionItemProps {
  item: AccordionItemData
  index: number
  isOpen: boolean
  onToggle: () => void
}

interface AccordionProps {
  items: AccordionItemData[]
  allowMultiple?: boolean
  className?: string
  itemClassName?: string
}

/**
 * Individual accordion item component
 */
function AccordionItem({ item, index, isOpen, onToggle }: AccordionItemProps) {
  const itemId = item.id || `accordion-item-${index}`
  const headingId = `${itemId}-heading`
  const contentId = `${itemId}-content`

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full px-6 py-4 text-left bg-background hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        id={headingId}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {item.title}
          </h3>
          <div className="ml-4 flex-shrink-0">
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
            id={contentId}
            role="region"
            aria-labelledby={headingId}
          >
            <div className="px-6 py-4 bg-muted/30 border-t border-border">
              {item.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Reusable accordion component
 * 
 * @param items - Array of accordion items
 * @param allowMultiple - Allow multiple items to be open simultaneously
 * @param className - Additional CSS classes for the container
 * @param itemClassName - Additional CSS classes for each item
 */
export default function Accordion({
  items,
  allowMultiple = false,
  className = '',
  itemClassName = '',
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(() => {
    const defaultOpen = new Set<number>()
    items.forEach((item, index) => {
      if (item.defaultOpen) {
        defaultOpen.add(index)
      }
    })
    return defaultOpen
  })

  const toggleItem = (index: number) => {
    setOpenItems(prev => {
      const newOpenItems = new Set(prev)
      
      if (newOpenItems.has(index)) {
        // Close the item
        newOpenItems.delete(index)
      } else {
        // Open the item
        if (!allowMultiple) {
          // Close all other items if multiple not allowed
          newOpenItems.clear()
        }
        newOpenItems.add(index)
      }
      
      return newOpenItems
    })
  }

  if (!items.length) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`} role="presentation">
      {items.map((item, index) => (
        <div key={item.id || index} className={itemClassName}>
          <AccordionItem
            item={item}
            index={index}
            isOpen={openItems.has(index)}
            onToggle={() => toggleItem(index)}
          />
        </div>
      ))}
    </div>
  )
}