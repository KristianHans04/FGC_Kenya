/**
 * @file ContactForm.tsx
 * @description Contact form component with validation and submission
 * @author Team Kenya Dev
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

import { contactSchema, ContactFormData, contactCategories } from '@/app/lib/constants/contact'
import TextField from '@/app/components/forms/fields/TextField'
import TextAreaField from '@/app/components/forms/fields/TextAreaField'
import SelectField from '@/app/components/forms/fields/SelectField'
import CheckboxField from '@/app/components/forms/fields/CheckboxField'

/**
 * Props for ContactForm component
 */
interface ContactFormProps {
  /** Additional CSS classes */
  className?: string
}

/**
 * Contact form component with secure validation and accessibility
 * 
 * @param props - ContactForm component props
 * @returns JSX.Element - Rendered contact form with validation
 */
export default function ContactForm({ className = '' }: ContactFormProps) {
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
    <div className={className}>
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
          <TextField
            register={register('name')}
            id="name"
            label="Full Name"
            required
            error={errors.name}
            type="text"
          />

          <TextField
            register={register('email')}
            id="email"
            label="Email Address"
            required
            error={errors.email}
            type="email"
          />
        </div>

        {/* Phone & Category */}
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField
            register={register('phone')}
            id="phone"
            label="Phone Number"
            error={errors.phone}
            type="tel"
            placeholder="+254712345678"
            helpText="Format: +254XXXXXXXXX or 07XXXXXXXX"
          />

          <SelectField
            register={register('category')}
            id="category"
            label="Category"
            required
            error={errors.category}
            options={contactCategories}
            placeholder="Select category"
          />
        </div>

        {/* Subject */}
        <TextField
          register={register('subject')}
          id="subject"
          label="Subject"
          required
          error={errors.subject}
          type="text"
        />

        {/* Message */}
        <TextAreaField
          register={register('message')}
          id="message"
          label="Message"
          required
          error={errors.message}
          rows={5}
          placeholder="Tell us how we can help you..."
          helpText="20-1000 characters"
        />

        {/* Newsletter & Privacy */}
        <div className="space-y-3">
          <CheckboxField
            register={register('newsletter')}
            id="newsletter"
            label="I would like to receive updates and newsletters from Team Kenya"
          />

          <CheckboxField
            register={register('privacy')}
            id="privacy"
            label={
              <>
                I agree to the{' '}
                <Link href="/privacy" className="text-primary hover:text-primary-light underline">
                  privacy policy
                </Link>
              </>
            }
            required
            error={errors.privacy}
          />
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
    </div>
  )
}