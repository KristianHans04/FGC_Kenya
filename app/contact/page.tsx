/**
 * @file page.tsx
 * @description Contact page for FIRST Global Team Kenya with secure form validation
 * @author Team Kenya Dev
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  MessageSquare,
  Users,
  Building2,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  Loader2,
  Globe,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

/**
 * Zod schema for contact form validation with security measures
 */
const contactSchema = z.object({
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
  
  category: z.enum(['general', 'sponsorship', 'volunteer', 'media', 'technical', 'other'])
    .describe('Please select a category'),
  
  message: z.string()
    .min(20, 'Message must be at least 20 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  
  newsletter: z.boolean().optional(),
  
  privacy: z.boolean()
    .refine((val) => val === true, 'You must accept the privacy policy'),
})

type ContactFormData = z.infer<typeof contactSchema>

// Contact information
const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    details: 'info@firstglobalkenya.org',
    link: 'mailto:info@firstglobalkenya.org',
  },
  {
    icon: Phone,
    title: 'Phone',
    details: '+254 700 123 456',
    link: 'tel:+254700123456',
  },
  {
    icon: MapPin,
    title: 'Address',
    details: 'Nairobi, Kenya',
    link: null,
  },
  {
    icon: Clock,
    title: 'Hours',
    details: 'Mon-Fri: 9:00 AM - 5:00 PM EAT',
    link: null,
  },
]

// Social media links
const socialLinks = [
  { icon: Facebook, name: 'Facebook', url: 'https://facebook.com/firstglobalkenya', color: 'hover:text-blue-600' },
  { icon: Twitter, name: 'Twitter', url: 'https://twitter.com/fgc_kenya', color: 'hover:text-blue-400' },
  { icon: Instagram, name: 'Instagram', url: 'https://instagram.com/firstglobalkenya', color: 'hover:text-pink-600' },
  { icon: Linkedin, name: 'LinkedIn', url: 'https://linkedin.com/company/firstglobalkenya', color: 'hover:text-blue-700' },
  { icon: Youtube, name: 'YouTube', url: 'https://youtube.com/@firstglobalkenya', color: 'hover:text-red-600' },
]

// FAQ items
const faqItems = [
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
    question: 'Can I volunteer as a mentor?',
    answer: 'Yes! We welcome experienced professionals to mentor our students. Contact us to learn about volunteer opportunities.',
    link: '/join#volunteer',
  },
  {
    question: 'Where can I find learning resources?',
    answer: 'Check our resources page for tutorials, documentation, and learning materials for robotics and STEM.',
    link: '/resources',
  },
]

// Contact categories for dropdown
const contactCategories = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'sponsorship', label: 'Sponsorship & Donations' },
  { value: 'volunteer', label: 'Volunteer Opportunities' },
  { value: 'media', label: 'Media & Press' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'other', label: 'Other' },
]

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
  })

  /**
   * Handle form submission with security measures
   * @param data - Validated form data
   */
  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // TODO: Implement actual API call with CSRF token
      // const csrfToken = await getCsrfToken()
      // await submitContact(data, csrfToken)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      setSubmitStatus('success')
      reset()

      // Scroll to success message for accessibility
      document.getElementById('form-status')?.focus()
    } catch (error) {
      console.error('Contact form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

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
      <section className="py-16 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
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

      {/* Contact Form & Map */}
      <section className="py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

                {/* Status Messages */}
                <div id="form-status" tabIndex={-1} aria-live="polite" aria-atomic="true">
                  {submitStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start space-x-3"
                      role="alert"
                    >
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" aria-hidden="true" />
                      <div>
                        <h3 className="font-semibold text-green-800 dark:text-green-200">Message Sent Successfully!</h3>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Thank you for contacting us. We'll respond within 24-48 hours.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {submitStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3"
                      role="alert"
                    >
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" aria-hidden="true" />
                      <div>
                        <h3 className="font-semibold text-red-800 dark:text-red-200">Submission Error</h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          There was an error sending your message. Please try again or email us directly.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  {/* Name & Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Full Name <span className="text-red-500" aria-label="required">*</span>
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        id="name"
                        aria-required="true"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                      />
                      {errors.name && (
                        <p id="name-error" className="mt-1 text-sm text-red-500" role="alert">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address <span className="text-red-500" aria-label="required">*</span>
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        id="email"
                        aria-required="true"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                      />
                      {errors.email && (
                        <p id="email-error" className="mt-1 text-sm text-red-500" role="alert">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone & Category */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        Phone Number
                        <span className="text-muted-foreground text-xs ml-2">(Optional)</span>
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        id="phone"
                        placeholder="+254712345678"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'phone-error' : 'phone-help'}
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                      />
                      <p id="phone-help" className="mt-1 text-xs text-muted-foreground">
                        Format: +254XXXXXXXXX or 07XXXXXXXX
                      </p>
                      {errors.phone && (
                        <p id="phone-error" className="mt-1 text-sm text-red-500" role="alert">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium mb-2">
                        Category <span className="text-red-500" aria-label="required">*</span>
                      </label>
                      <select
                        {...register('category')}
                        id="category"
                        aria-required="true"
                        aria-invalid={!!errors.category}
                        aria-describedby={errors.category ? 'category-error' : undefined}
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                      >
                        <option value="">Select category</option>
                        {contactCategories.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p id="category-error" className="mt-1 text-sm text-red-500" role="alert">
                          {errors.category.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Subject <span className="text-red-500" aria-label="required">*</span>
                    </label>
                    <input
                      {...register('subject')}
                      type="text"
                      id="subject"
                      aria-required="true"
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? 'subject-error' : undefined}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    />
                    {errors.subject && (
                      <p id="subject-error" className="mt-1 text-sm text-red-500" role="alert">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message <span className="text-red-500" aria-label="required">*</span>
                    </label>
                    <textarea
                      {...register('message')}
                      id="message"
                      rows={5}
                      aria-required="true"
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? 'message-error' : 'message-help'}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                      placeholder="Tell us how we can help you..."
                    />
                    <p id="message-help" className="mt-1 text-xs text-muted-foreground">
                      20-1000 characters
                    </p>
                    {errors.message && (
                      <p id="message-error" className="mt-1 text-sm text-red-500" role="alert">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* Newsletter & Privacy */}
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3">
                      <input
                        {...register('newsletter')}
                        type="checkbox"
                        className="w-4 h-4 mt-1 text-primary border-border rounded focus:ring-primary"
                        aria-describedby="newsletter-text"
                      />
                      <span id="newsletter-text" className="text-sm">
                        I would like to receive updates and newsletters from Team Kenya
                      </span>
                    </label>

                    <label className="flex items-start space-x-3">
                      <input
                        {...register('privacy')}
                        type="checkbox"
                        className="w-4 h-4 mt-1 text-primary border-border rounded focus:ring-primary"
                        aria-describedby="privacy-text"
                      />
                      <span id="privacy-text" className="text-sm">
                        I agree to the{' '}
                        <Link href="/privacy" className="text-primary hover:text-primary-light underline">
                          privacy policy
                        </Link>
                        <span className="text-red-500" aria-label="required"> *</span>
                      </span>
                    </label>
                    {errors.privacy && (
                      <p className="ml-7 text-sm text-red-500" role="alert">
                        {errors.privacy.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" aria-hidden="true" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-5 w-5" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>

              {/* Map & Additional Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                {/* Map Placeholder */}
                <div className="card h-[400px] flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                    <p className="text-muted-foreground">Interactive map will be displayed here</p>
                    <p className="text-sm text-muted-foreground mt-2">Nairobi, Kenya</p>
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
                    <Link
                      href="/join"
                      className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Users className="h-4 w-4 mr-2" aria-hidden="true" />
                      Join the Team
                    </Link>
                    <Link
                      href="/support"
                      className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Building2 className="h-4 w-4 mr-2" aria-hidden="true" />
                      Become a Sponsor
                    </Link>
                    <Link
                      href="/resources"
                      className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Globe className="h-4 w-4 mr-2" aria-hidden="true" />
                      Learning Resources
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
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

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card"
                >
                  <div className="flex items-start">
                    <HelpCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div className="flex-grow">
                      <h3 className="font-semibold mb-2">{item.question}</h3>
                      <p className="text-muted-foreground text-sm mb-2">{item.answer}</p>
                      {item.link && (
                        <Link
                          href={item.link}
                          className="text-primary hover:text-primary-light text-sm font-medium inline-flex items-center"
                        >
                          Learn more
                          <MessageSquare className="ml-1 h-4 w-4" aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-4">
                Didn't find what you're looking for?
              </p>
              <button
                onClick={() => document.getElementById('name')?.focus()}
                className="btn-primary"
              >
                Contact Support
                <MessageSquare className="ml-2 h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}