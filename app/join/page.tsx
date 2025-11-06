/**
 * @file page.tsx
 * @description Join/Apply page for <i>FIRST</i> Global Team Kenya with comprehensive form validation
 * @author Team Kenya Dev
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  Mail, 
  Phone, 
  School, 
  User, 
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Heart,
  Target,
  Rocket,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'

/**
 * Zod schema for form validation with comprehensive security checks
 */
const applicationSchema = z.object({
  // Personal Information
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email address is too short')
    .max(100, 'Email address is too long'),
  
  phone: z.string()
    .regex(/^(\+254|0)[17]\d{8}$/, 'Please enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)'),
  
  dateOfBirth: z.string()
    .refine((date) => {
      const age = new Date().getFullYear() - new Date(date).getFullYear()
      return age >= 14 && age <= 18
    }, 'Applicants must be between 14 and 18 years old'),
  
  // Educational Information
  school: z.string()
    .min(5, 'School name must be at least 5 characters')
    .max(100, 'School name must be less than 100 characters'),
  
  grade: z.string()
    .refine((grade) => {
      const gradeNum = parseInt(grade)
      return gradeNum >= 9 && gradeNum <= 12
    }, 'Grade must be between 9 and 12'),
  
  county: z.string()
    .min(3, 'Please select a county')
    .max(50, 'County name is too long'),
  
  // Experience & Interest
  experience: z.enum(['none', 'beginner', 'intermediate', 'advanced'])
    .describe('Please select your experience level'),
  
  interests: z.array(z.string()).min(1, 'Please select at least one area of interest'),
  
  motivation: z.string()
    .min(100, 'Please write at least 100 characters about your motivation')
    .max(500, 'Motivation statement must be less than 500 characters'),
  
  // Consent & Terms
  parentConsent: z.boolean()
    .refine((val) => val === true, 'Parent/guardian consent is required'),
  
  termsAccepted: z.boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
})

type ApplicationFormData = z.infer<typeof applicationSchema>

// Kenyan counties list
const counties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kiambu', 'Machakos',
  'Meru', 'Nyeri', 'Kakamega', 'Kisii', 'Kitui', 'Migori', 'Uasin Gishu',
  'Trans Nzoia', 'Nandi', 'Kericho', 'Laikipia', 'Narok', 'Kajiado', 'Other'
]

// Interest areas
const interestAreas = [
  { id: 'programming', label: 'Programming & Software', icon: FileText },
  { id: 'mechanical', label: 'Mechanical Engineering', icon: Target },
  { id: 'electrical', label: 'Electrical Engineering', icon: Rocket },
  { id: 'design', label: 'Design & CAD', icon: BookOpen },
  { id: 'strategy', label: 'Strategy & Planning', icon: Target },
  { id: 'outreach', label: 'Community Outreach', icon: Heart },
]

// Timeline data - Updated for Panama 2025 completion
const timeline = [
  { date: '1 Jan - 28 Feb', title: 'Applications Open', status: 'completed' },
  { date: '1-15 March', title: 'Initial Screening', status: 'completed' },
  { date: '20-30 March', title: 'Interviews', status: 'completed' },
  { date: '5 April', title: 'Team Announcement', status: 'completed' },
  { date: 'April - October', title: 'Training & Preparation', status: 'completed' },
  { date: 'October 29, 2025', title: 'Panama Competition - Silver Medal 🥈', status: 'completed' },
]

export default function JoinPage() {
  console.log('JoinPage rendered');
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [applicationsClosed] = useState(true) // Applications are closed as of October 3rd
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: 'onBlur', // Validate on blur for better UX
  })

  /**
   * Handle form submission with security measures
   * @param data - Validated form data
   */
  const onSubmit = async (data: ApplicationFormData) => {
    console.log('Submitting application form with data:', data);
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      // TODO: Implement actual API call with CSRF token
      // const csrfToken = await getCsrfToken()
      // await submitApplication(data, csrfToken)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSubmitStatus('success')
      reset()
      
      // Scroll to success message for accessibility
      document.getElementById('form-status')?.focus()
    } catch (error) {
      console.error('Application submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedInterests = watch('interests') || []

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
              Join Team <span className="text-primary">Kenya</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Be part of Kenya's journey in the <i>FIRST</i> Global Challenge. 
              Apply now to represent your country on the world stage!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Eligibility Section */}
      <section className="py-16 bg-muted/30 overflow-hidden">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-3xl font-bold font-heading text-center mb-12">
              Eligibility <span className="text-primary">Requirements</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: GraduationCap, title: 'Age', desc: '14-18 years old' },
                { icon: School, title: 'Education', desc: 'Currently in high school (Form 1-4)' },
                { icon: Users, title: 'Nationality', desc: 'Kenyan citizen or resident' },
                { icon: Calendar, title: 'Commitment', desc: 'Available April-October' },
                { icon: Target, title: 'Passion', desc: 'Interest in STEM and robotics' },
                { icon: Heart, title: 'Team Spirit', desc: 'Collaborative and dedicated' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card text-center transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                    <item.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Application Timeline */}
      <section className="py-16 overflow-hidden">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold font-heading text-center mb-12">
              Application <span className="text-primary">Timeline</span>
            </h2>
            
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex items-center space-x-4 p-4 rounded-lg ${
                    item.status === 'active' 
                      ? 'bg-primary/10 border-2 border-primary' 
                      : 'bg-card border border-border'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                    item.status === 'active' ? 'bg-primary' : 'bg-muted'
                  }`} aria-hidden="true"></div>
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="font-semibold">{item.title}</h3>
                      <span className="text-sm text-muted-foreground">{item.date}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 bg-muted/30 overflow-hidden" id="application-form">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold font-heading text-center mb-8">
              Application <span className="text-primary">Form</span>
            </h2>

            <div className="relative">
              {applicationsClosed && (
                <div className="absolute inset-0 bg-background/90 flex items-center justify-center z-10 rounded-lg">
                  <div className="text-center p-8">
                    <Calendar className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-4">Applications Closed</h3>
                    <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
                      The application period for the 2025 <i>FIRST</i> Global Challenge team has ended.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      The next recruitment cycle will open in January 2026.
                    </p>
                  </div>
                </div>
              )}
              <div className={applicationsClosed ? 'max-h-[50vh] overflow-hidden blur-sm' : ''}>
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
                        <h3 className="font-semibold text-green-800 dark:text-green-200">Application Submitted Successfully!</h3>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          We've received your application. We'll contact you within 2 weeks.
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
                          There was an error submitting your application. Please try again or contact us.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 card" noValidate>
                  <fieldset disabled={applicationsClosed}>
                    {/* Personal Information */}
                    <fieldset>
                      <legend className="text-xl font-semibold mb-4">Personal Information</legend>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                            First Name <span className="text-red-500" aria-label="required">*</span>
                          </label>
                          <input
                            {...register('firstName')}
                            type="text"
                            id="firstName"
                            aria-required="true"
                            aria-invalid={!!errors.firstName}
                            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                          />
                          {errors.firstName && (
                            <p id="firstName-error" className="mt-1 text-sm text-red-500" role="alert">
                              {errors.firstName.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                            Last Name <span className="text-red-500" aria-label="required">*</span>
                          </label>
                          <input
                            {...register('lastName')}
                            type="text"
                            id="lastName"
                            aria-required="true"
                            aria-invalid={!!errors.lastName}
                            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                          />
                          {errors.lastName && (
                            <p id="lastName-error" className="mt-1 text-sm text-red-500" role="alert">
                              {errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 mt-4">
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

                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium mb-2">
                            Phone Number <span className="text-red-500" aria-label="required">*</span>
                          </label>
                          <input
                            {...register('phone')}
                            type="tel"
                            id="phone"
                            placeholder="+254712345678"
                            aria-required="true"
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
                      </div>

                      <div className="mt-4">
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-2">
                          Date of Birth <span className="text-red-500" aria-label="required">*</span>
                        </label>
                        <input
                          {...register('dateOfBirth')}
                          type="date"
                          id="dateOfBirth"
                          aria-required="true"
                          aria-invalid={!!errors.dateOfBirth}
                          aria-describedby={errors.dateOfBirth ? 'dob-error' : 'dob-help'}
                          className="w-full sm:w-auto px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                        />
                        <p id="dob-help" className="mt-1 text-xs text-muted-foreground">
                          You must be between 14 and 18 years old
                        </p>
                        {errors.dateOfBirth && (
                          <p id="dob-error" className="mt-1 text-sm text-red-500" role="alert">
                            {errors.dateOfBirth.message}
                          </p>
                        )}
                      </div>
                    </fieldset>

                    {/* Educational Information */}
                    <fieldset>
                      <legend className="text-xl font-semibold mb-4">Educational Information</legend>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="school" className="block text-sm font-medium mb-2">
                            School Name <span className="text-red-500" aria-label="required">*</span>
                          </label>
                          <input
                            {...register('school')}
                            type="text"
                            id="school"
                            aria-required="true"
                            aria-invalid={!!errors.school}
                            aria-describedby={errors.school ? 'school-error' : undefined}
                            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                          />
                          {errors.school && (
                            <p id="school-error" className="mt-1 text-sm text-red-500" role="alert">
                              {errors.school.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="grade" className="block text-sm font-medium mb-2">
                            Current Grade/Form <span className="text-red-500" aria-label="required">*</span>
                          </label>
                          <select
                            {...register('grade')}
                            id="grade"
                            aria-required="true"
                            aria-invalid={!!errors.grade}
                            aria-describedby={errors.grade ? 'grade-error' : undefined}
                            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                          >
                            <option value="">Select grade</option>
                            <option value="9">Form 1 (Grade 9)</option>
                            <option value="10">Form 2 (Grade 10)</option>
                            <option value="11">Form 3 (Grade 11)</option>
                            <option value="12">Form 4 (Grade 12)</option>
                          </select>
                          {errors.grade && (
                            <p id="grade-error" className="mt-1 text-sm text-red-500" role="alert">
                              {errors.grade.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <label htmlFor="county" className="block text-sm font-medium mb-2">
                          County <span className="text-red-500" aria-label="required">*</span>
                        </label>
                        <select
                          {...register('county')}
                          id="county"
                          aria-required="true"
                          aria-invalid={!!errors.county}
                          aria-describedby={errors.county ? 'county-error' : undefined}
                          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                        >
                          <option value="">Select county</option>
                          {counties.map(county => (
                            <option key={county} value={county}>{county}</option>
                          ))}
                        </select>
                        {errors.county && (
                          <p id="county-error" className="mt-1 text-sm text-red-500" role="alert">
                            {errors.county.message}
                          </p>
                        )}
                      </div>
                    </fieldset>

                    {/* Experience & Interest */}
                    <fieldset>
                      <legend className="text-xl font-semibold mb-4">Experience & Interest</legend>

                      <div>
                        <label htmlFor="experience" className="block text-sm font-medium mb-2">
                          Robotics/Programming Experience <span className="text-red-500" aria-label="required">*</span>
                        </label>
                        <select
                          {...register('experience')}
                          id="experience"
                          aria-required="true"
                          aria-invalid={!!errors.experience}
                          aria-describedby={errors.experience ? 'experience-error' : undefined}
                          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                        >
                          <option value="">Select experience level</option>
                          <option value="none">No prior experience</option>
                          <option value="beginner">Beginner (less than 1 year)</option>
                          <option value="intermediate">Intermediate (1-2 years)</option>
                          <option value="advanced">Advanced (more than 2 years)</option>
                        </select>
                        {errors.experience && (
                          <p id="experience-error" className="mt-1 text-sm text-red-500" role="alert">
                            {errors.experience.message}
                          </p>
                        )}
                      </div>

                      <div className="mt-4">
                        <fieldset>
                          <legend className="block text-sm font-medium mb-2">
                            Areas of Interest <span className="text-red-500" aria-label="required">*</span>
                            <span className="text-xs text-muted-foreground ml-2">(Select at least one)</span>
                          </legend>
                          <div className="grid sm:grid-cols-2 gap-3 mt-2">
                            {interestAreas.map(area => (
                              <label
                                key={area.id}
                                className="flex items-center space-x-3 p-3 border border-border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                              >
                                <input
                                  {...register('interests')}
                                  type="checkbox"
                                  value={area.id}
                                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                                  aria-describedby={`${area.id}-label`}
                                />
                                <span id={`${area.id}-label`} className="flex items-center space-x-2">
                                  <area.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                  <span className="text-sm">{area.label}</span>
                                </span>
                              </label>
                            ))}
                          </div>
                          {errors.interests && (
                            <p className="mt-1 text-sm text-red-500" role="alert">
                              {errors.interests.message}
                            </p>
                          )}
                        </fieldset>
                      </div>

                      <div className="mt-4">
                        <label htmlFor="motivation" className="block text-sm font-medium mb-2">
                          Why do you want to join Team Kenya? <span className="text-red-500" aria-label="required">*</span>
                        </label>
                        <textarea
                          {...register('motivation')}
                          id="motivation"
                          rows={4}
                          aria-required="true"
                          aria-invalid={!!errors.motivation}
                          aria-describedby={errors.motivation ? 'motivation-error' : 'motivation-help'}
                          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                          placeholder="Tell us about your passion for STEM, robotics, and representing Kenya..."
                        />
                        <p id="motivation-help" className="mt-1 text-xs text-muted-foreground">
                          100-500 characters
                        </p>
                        {errors.motivation && (
                          <p id="motivation-error" className="mt-1 text-sm text-red-500" role="alert">
                            {errors.motivation.message}
                          </p>
                        )}
                      </div>
                    </fieldset>

                    {/* Consent & Terms */}
                    <fieldset>
                      <legend className="text-xl font-semibold mb-4">Consent & Terms</legend>

                      <div className="space-y-3">
                        <label className="flex items-start space-x-3">
                          <input
                            {...register('parentConsent')}
                            type="checkbox"
                            className="w-4 h-4 mt-1 text-primary border-border rounded focus:ring-primary"
                            aria-describedby="consent-text"
                          />
                          <span id="consent-text" className="text-sm">
                            I confirm that I have my parent/guardian's consent to apply for Team Kenya
                            <span className="text-red-500" aria-label="required"> *</span>
                          </span>
                        </label>
                        {errors.parentConsent && (
                          <p className="ml-7 text-sm text-red-500" role="alert">
                            {errors.parentConsent.message}
                          </p>
                        )}

                        <label className="flex items-start space-x-3">
                          <input
                            {...register('termsAccepted')}
                            type="checkbox"
                            className="w-4 h-4 mt-1 text-primary border-border rounded focus:ring-primary"
                            aria-describedby="terms-text"
                          />
                          <span id="terms-text" className="text-sm">
                            I accept the{' '}
                            <Link href="/terms" className="text-primary hover:text-primary-light underline">
                              terms and conditions
                            </Link>
                            {' '}and understand the commitment required
                            <span className="text-red-500" aria-label="required"> *</span>
                          </span>
                        </label>
                        {errors.termsAccepted && (
                          <p className="ml-7 text-sm text-red-500" role="alert">
                            {errors.termsAccepted.message}
                          </p>
                        )}
                      </div>
                    </fieldset>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting || applicationsClosed}
                        className="btn-primary min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-busy={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin h-5 w-5 mr-2" aria-hidden="true" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Application
                            <CheckCircle className="ml-2 h-5 w-5" aria-hidden="true" />
                          </>
                        )}
                      </button>
                    </div>
                  </fieldset>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </section>    </>
  )
}