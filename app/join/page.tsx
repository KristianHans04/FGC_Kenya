/**
 * @file page.tsx
 * @description Join/Apply page for <i>FIRST</i> Global Team Kenya with modular form components
 * @author Team Kenya Dev
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import Image from 'next/image'
import { 
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Rocket,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'

// Import validation schema and types
import { z } from 'zod'

// Simplified schema for the original join page structure
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
  experience: z.enum(['NONE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
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

// Import constants
import { 
  APPLICATION_TIMELINE,
  ELIGIBILITY_REQUIREMENTS,
  FORM_STEPS
} from '@/app/lib/constants/application'

// Import modular form components
import {
  PersonalInfoSection,
  EducationalInfoSection,
  ExperienceSection,
  ConsentSection
} from '@/app/components/forms/application'

/**
 * JoinPage component
 * Displays the application form for new students to join the team
 * Uses modular form components for better maintainability
 * 
 * @returns {JSX.Element} The join page component
 */
export default function JoinPage() {
  useEffect(() => {
    document.title = 'Join Our Team | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Become part of FIRST Global Team Kenya')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Become part of FIRST Global Team Kenya'
      document.head.appendChild(meta)
    }
  }, [])


  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [currentStep, setCurrentStep] = useState<'form' | 'ai-questions' | 'complete'>('form')
  const [aiQuestions, setAiQuestions] = useState<string[]>([])
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({})
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [applicationsClosed, setApplicationsClosed] = useState(true)
  const [activeForm, setActiveForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
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

  // Check for active application form
  useEffect(() => {
    checkActiveForm()
  }, [])

  const checkActiveForm = async () => {
    try {
      const response = await fetch('/api/applications/forms/active')
      if (response.ok) {
        const data = await response.json()
        if (data.data?.form) {
          setActiveForm(data.data.form)
          setApplicationsClosed(false)
        } else {
          setApplicationsClosed(true)
        }
      } else {
        setApplicationsClosed(true)
      }
    } catch (error) {
      console.error('Failed to check active form:', error)
      setApplicationsClosed(true)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle form submission with security measures
   * @param data - Validated form data
   */
   const onSubmit = async (data: ApplicationFormData) => {
     if (currentStep === 'form') {
       // Generate AI questions
       await generateAIQuestions(data)
     } else if (currentStep === 'ai-questions') {
       // Submit application with AI answers
       await submitApplication(data)
     }
   }

   const generateAIQuestions = async (data: ApplicationFormData) => {
     setIsGeneratingQuestions(true)

     try {
       const response = await fetch('/api/ai/questions', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           applicationData: data,
           context: 'FIRST Global Challenge application review for robotics competition'
         })
       })

       if (response.ok) {
         const result = await response.json()
         if (result.success && result.data.questions) {
           setAiQuestions(result.data.questions)
           setCurrentStep('ai-questions')
         } else {
           throw new Error(result.error?.message || 'Failed to generate questions')
         }
       } else {
         throw new Error('Failed to generate questions')
       }
     } catch (error) {
       console.error('AI question generation error:', error)
       setSubmitStatus('error')
     } finally {
       setIsGeneratingQuestions(false)
     }
   }

   const submitApplication = async (data: ApplicationFormData) => {
     setIsSubmitting(true)
     setSubmitStatus('idle')

     try {
       // TODO: Implement actual API call with CSRF token and AI answers
       // const csrfToken = await getCsrfToken()
       // await submitApplication(data, questionAnswers, csrfToken)

       // Simulate API call
       await new Promise(resolve => setTimeout(resolve, 2000))

       setSubmitStatus('success')
       setCurrentStep('complete')
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50 animate-pulse delay-1000"></div>
        <div className="absolute inset-0 african-pattern opacity-[0.03]"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 tracking-tight">
                Join Team <span className="text-transparent bg-clip-text bg-gradient-to-r from-kenya-black via-kenya-red to-kenya-green">Kenya</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Be part of Kenya's journey in the <i>FIRST</i> Global Challenge. 
                Apply now to represent your country on the world stage!
              </p>
            </motion.div>
          </div>
        </section>

        {/* Eligibility Section */}
        <section className="py-16 bg-muted/30 relative">
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
                {ELIGIBILITY_REQUIREMENTS.map((item, index) => {
                  const IconComponent = item.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-card"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 mb-4">
                        <IconComponent className="h-6 w-6 text-primary" aria-hidden="true" />
                      </div>
                      <h3 className="font-semibold mb-2 text-lg">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Application Timeline */}
        <section className="py-16">
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
                {APPLICATION_TIMELINE.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:bg-card transition-colors"
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0 bg-primary/20" aria-hidden="true"></div>
                    <div className="flex-grow">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <span className="text-sm text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">{item.date}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-16 bg-muted/30 relative" id="application-form">
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
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading application form...</p>
                  </div>
                ) : applicationsClosed && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl border border-border/50">
                    <div className="text-center p-4 sm:p-8 max-w-md">
                      <div className="w-16 sm:w-20 h-16 sm:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <Calendar className="h-8 sm:h-10 w-8 sm:w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Applications Closed</h3>
                      <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">
                        There are no active application forms at the moment.
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-primary bg-primary/10 py-2 px-4 rounded-full inline-block">
                        Check back soon for updates
                      </p>
                    </div>
                  </div>
                )}
                
                <div className={applicationsClosed || loading ? 'opacity-50 pointer-events-none filter blur-[1px]' : ''}>
                  {/* Active Form Info */}
                  {!loading && activeForm && !applicationsClosed && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <Rocket className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-green-800 dark:text-green-200">{activeForm?.title}</h3>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            {activeForm?.description}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            Deadline: {activeForm?.closeDate && new Date(activeForm.closeDate).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Status Messages */}
                  <div id="form-status" tabIndex={-1} aria-live="polite" aria-atomic="true">
                    <AnimatePresence>
                      {submitStatus === 'success' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start space-x-3"
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
                          exit={{ opacity: 0 }}
                          className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-3"
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
                    </AnimatePresence>
                  </div>

                  {/* Step Indicator */}
                  {currentStep !== 'complete' && (
                    <div className="mb-8">
                      <div className="flex items-center justify-center space-x-4">
                        {FORM_STEPS.map((step, index) => {
                          const isActive = currentStep === step.key
                          const currentStepNumber = FORM_STEPS.find(s => s.key === currentStep)?.number || 1
                          const isCompleted = step.number < currentStepNumber
                          return (
                            <React.Fragment key={step.key}>
                              <div className={`flex items-center ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                  isActive 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-110' 
                                    : isCompleted
                                      ? 'bg-primary/20 text-primary'
                                      : 'bg-muted text-muted-foreground'
                                }`}>
                                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : step.number}
                                </div>
                                <span className={`ml-3 text-sm font-medium hidden sm:inline-block transition-colors ${isActive ? 'text-foreground' : ''}`}>
                                  {step.label}
                                </span>
                              </div>
                              {index < FORM_STEPS.length - 1 && (
                                <div className={`w-12 h-0.5 rounded-full transition-colors ${isCompleted ? 'bg-primary/50' : 'bg-border'}`}></div>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {currentStep === 'form' && (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-card border border-border/50 shadow-xl rounded-2xl p-8" noValidate>
                      <fieldset disabled={applicationsClosed} className="space-y-8">
                        <PersonalInfoSection 
                          register={register}
                          errors={errors}
                          disabled={applicationsClosed}
                        />

                        <div className="h-px bg-border/50"></div>

                        <EducationalInfoSection 
                          register={register}
                          errors={errors}
                          disabled={applicationsClosed}
                        />

                        <div className="h-px bg-border/50"></div>

                        <ExperienceSection 
                          register={register}
                          watch={watch}
                          errors={errors}
                          disabled={applicationsClosed}
                        />

                        <div className="h-px bg-border/50"></div>

                        <ConsentSection 
                          register={register}
                          errors={errors}
                          disabled={applicationsClosed}
                        />

                      {/* Submit Button */}
                      <div className="flex justify-center pt-6">
                        <button
                          type="submit"
                          disabled={isSubmitting || applicationsClosed}
                          className="btn-primary min-w-[240px] py-4 text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          aria-busy={isSubmitting}
                        >
                          {isGeneratingQuestions ? (
                            <>
                              <Loader2 className="animate-spin h-5 w-5 mr-2" aria-hidden="true" />
                              Generating Questions...
                            </>
                          ) : (
                            <>
                              Continue to Questions
                              <Rocket className="ml-2 h-5 w-5" aria-hidden="true" />
                            </>
                          )}
                        </button>
                      </div>
                    </fieldset>
                  </form>
                  )}

                  {currentStep === 'ai-questions' && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-card border border-border/50 shadow-xl rounded-2xl p-8 space-y-8"
                    >
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 ring-4 ring-primary/5">
                          <Rocket className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold font-heading">Personalized Questions</h2>
                        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                          Based on your application, we've generated a few questions to help us understand your unique perspective better.
                        </p>
                      </div>

                      <div className="space-y-6">
                        {aiQuestions.map((question, index) => (
                          <div key={index} className="space-y-3">
                            <label className="block text-base font-medium text-foreground">
                              <span className="text-primary font-bold mr-2">{index + 1}.</span>
                              {question}
                            </label>
                            <textarea
                              value={questionAnswers[`question_${index}`] || ''}
                              onChange={(e) => setQuestionAnswers(prev => ({
                                ...prev,
                                [`question_${index}`]: e.target.value
                              }))}
                              rows={4}
                              className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background/50 resize-none transition-all duration-200"
                              placeholder="Type your answer here..."
                              required
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between pt-6 border-t border-border/50">
                        <button
                          type="button"
                          onClick={() => setCurrentStep('form')}
                          className="px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors font-medium flex items-center"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to Form
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSubmit(onSubmit)()}
                          disabled={isSubmitting || Object.keys(questionAnswers).length < aiQuestions.length}
                          className="btn-primary py-3 px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="animate-spin h-5 w-5 mr-2" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              Submit Application
                              <CheckCircle className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 'complete' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-card border border-border/50 shadow-xl rounded-2xl p-12 text-center max-w-2xl mx-auto"
                    >
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full mb-6 ring-8 ring-green-50 dark:ring-green-900/10">
                        <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                      </div>
                      <h2 className="text-3xl font-bold font-heading mb-4">Application Submitted!</h2>
                      <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                        Thank you for applying to join FIRST Global Team Kenya. We've sent a confirmation email to your inbox. We'll review your application and get back to you within 2 weeks.
                      </p>
                      <Link href="/dashboard" className="btn-primary inline-flex items-center py-3 px-8 text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
                        View Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>    
      </div>
    </div>
  )
}