/**
 * @file application.ts
 * @description Constants for the application form components
 * @author Team Kenya Dev
 */

import { 
  GraduationCap, 
  Calendar, 
  School, 
  User, 
  FileText,
  Target,
  Heart,
  Rocket,
  BookOpen,
  Users
} from 'lucide-react'

/**
 * Timeline data for the application process (updated for Panama 2025 completion)
 */
export const APPLICATION_TIMELINE = [
  { date: '1 Jan - 28 Feb', title: 'Applications Open', status: 'completed' as const },
  { date: '1-15 March', title: 'Initial Screening', status: 'completed' as const },
  { date: '20-30 March', title: 'Interviews', status: 'completed' as const },
  { date: '5 April', title: 'Team Announcement', status: 'completed' as const },
  { date: 'April - October', title: 'Training & Preparation', status: 'completed' as const },
  { date: 'October 7-10th, 2026', title: 'FIRST Global Challenge Competition', status: 'completed' as const },
] as const

/**
 * Eligibility requirements for display
 */
export const ELIGIBILITY_REQUIREMENTS = [
  { icon: GraduationCap, title: 'Age', desc: '14-18 years old' },
  { icon: School, title: 'Education', desc: 'Currently in high school (Form 1-4)' },
  { icon: Users, title: 'Nationality', desc: 'Kenyan citizen or resident' },
  { icon: Calendar, title: 'Commitment', desc: 'Available April-October' },
  { icon: Target, title: 'Passion', desc: 'Interest in STEM and robotics' },
  { icon: Heart, title: 'Team Spirit', desc: 'Collaborative and dedicated' },
] as const

/**
 * Experience level options for form display
 */
export const EXPERIENCE_OPTIONS = [
  { value: 'NONE', label: 'No prior experience' },
  { value: 'BEGINNER', label: 'Beginner (less than 1 year)' },
  { value: 'INTERMEDIATE', label: 'Intermediate (1-2 years)' },
  { value: 'ADVANCED', label: 'Advanced (more than 2 years)' },
] as const

/**
 * Grade/Form level options for educational information
 */
export const GRADE_OPTIONS = [
  { value: '9', label: 'Form 1 (Grade 9)' },
  { value: '10', label: 'Form 2 (Grade 10)' },
  { value: '11', label: 'Form 3 (Grade 11)' },
  { value: '12', label: 'Form 4 (Grade 12)' },
] as const

/**
 * Interest areas with icons for form display
 * (using a subset that matches the original join page)
 */
export const INTEREST_AREAS_WITH_ICONS = [
  { id: 'programming', label: 'Programming & Software', icon: FileText },
  { id: 'mechanical', label: 'Mechanical Engineering', icon: Target },
  { id: 'electrical', label: 'Electrical Engineering', icon: Rocket },
  { id: 'design', label: 'Design & CAD', icon: BookOpen },
  { id: 'strategy', label: 'Strategy & Planning', icon: Target },
  { id: 'outreach', label: 'Community Outreach', icon: Heart },
] as const

/**
 * Simplified counties list (matching the original join page)
 */
export const COUNTIES_SIMPLIFIED = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kiambu', 'Machakos',
  'Meru', 'Nyeri', 'Kakamega', 'Kisii', 'Kitui', 'Migori', 'Uasin Gishu',
  'Trans Nzoia', 'Nandi', 'Kericho', 'Laikipia', 'Narok', 'Kajiado', 'Other'
] as const

/**
 * Form step configurations
 */
export const FORM_STEPS = [
  { key: 'form', label: 'Application Form', number: 1 },
  { key: 'ai-questions', label: 'AI Questions', number: 2 },
] as const

/**
 * Character limits for form fields
 */
export const FIELD_LIMITS = {
  firstName: { min: 2, max: 50 },
  lastName: { min: 2, max: 50 },
  email: { min: 5, max: 100 },
  school: { min: 5, max: 100 },
  county: { min: 3, max: 50 },
  motivation: { min: 100, max: 500 },
} as const

/**
 * Age requirements
 */
export const AGE_REQUIREMENTS = {
  min: 14,
  max: 18,
} as const

/**
 * Phone number format help text
 */
export const PHONE_HELP_TEXT = 'Format: +254XXXXXXXXX or 07XXXXXXXX' as const

/**
 * Date of birth help text
 */
export const DOB_HELP_TEXT = 'You must be between 14 and 18 years old' as const

/**
 * Motivation field help text
 */
export const MOTIVATION_HELP_TEXT = '100-500 characters' as const

/**
 * Interest selection help text
 */
export const INTERESTS_HELP_TEXT = '(Select at least one)' as const