/**
 * @file contact.ts
 * @description Contact page constants and data
 * @author Team Kenya Dev
 */

import { z } from 'zod'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Users,
  Building2,
  Globe
} from 'lucide-react'

/**
 * Zod schema for contact form validation with security measures
 */
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email address is too short')
    .max(100, 'Email address is too long'),

  phone: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true
      return /^(\+254|0)[17]\d{8}$/.test(val)
    }, 'Please enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)'),

  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(150, 'Subject must be less than 150 characters'),

  category: z.enum(['general', 'sponsorship', 'media', 'technical', 'other'])
    .describe('Please select a category'),

  message: z.string()
    .min(20, 'Message must be at least 20 characters')
    .max(1000, 'Message must be less than 1000 characters'),

  newsletter: z.boolean().optional(),

  privacy: z.boolean()
    .refine((val) => val === true, 'You must accept the privacy policy'),
})

export type ContactFormData = z.infer<typeof contactSchema>

/**
 * Contact information displayed in cards
 */
export const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    details: 'teamkenyarobotics254@gmail.com',
    link: 'mailto:teamkenyarobotics254@gmail.com',
  },
  {
    icon: MapPin,
    title: 'Address',
    details: 'Off James Gichuru Road, Nairobi',
    link: null,
  },
  {
    icon: Clock,
    title: 'Hours',
    details: 'Mon-Fri: 9:00 AM - 5:00 PM EAT',
    link: null,
  },
]

/**
 * Social media links with icons and colors
 */
export const socialLinks = [
  { 
    icon: Facebook, 
    name: 'Facebook', 
    url: 'https://m.facebook.com/fgckenya/', 
    color: 'hover:text-blue-600' 
  },
  { 
    icon: Twitter, 
    name: 'X (Twitter)', 
    url: 'https://x.com/fgc_kenya?lang=en', 
    color: 'hover:text-blue-400' 
  },
  { 
    icon: Instagram, 
    name: 'Instagram', 
    url: 'https://www.instagram.com/fgc_kenya/', 
    color: 'hover:text-pink-600' 
  },
  { 
    icon: Youtube, 
    name: 'YouTube', 
    url: 'https://www.youtube.com/@fgc_kenya', 
    color: 'hover:text-red-600' 
  },
]

/**
 * FAQ items with questions, answers, and optional links
 */
export const faqItems = [
  {
    question: 'How can students apply to join Team Kenya?',
    answer: 'Students aged 14-18 can apply through our online application form during the recruitment period (January-March).',
    link: '/join',
  },
  {
    question: 'How can I sponsor or donate to the team?',
    answer: 'We offer various sponsorship packages and donation options. Visit our support page for more information.',
    link: '/support',
  },
  {
    question: 'Where can I find learning resources?',
    answer: 'Check our resources page for tutorials, documentation, and learning materials for robotics and STEM.',
    link: '/resources',
  },
]

/**
 * Contact categories for form dropdown
 */
export const contactCategories = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'sponsorship', label: 'Sponsorship & Donations' },
  { value: 'media', label: 'Media & Press' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'other', label: 'Other' },
]

/**
 * Quick links for sidebar
 */
export const quickLinks = [
  {
    href: '/join',
    label: 'Join the Team',
    icon: Users,
  },
  {
    href: '/support',
    label: 'Become a Sponsor',
    icon: Building2,
  },
  {
    href: '/resources',
    label: 'Learning Resources',
    icon: Globe,
  },
]