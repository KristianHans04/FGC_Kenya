/**
 * @file PersonalInfoSection.tsx
 * @description Personal information section for the application form
 * @author Team Kenya Dev
 */

import React from 'react'
import { FieldErrors, UseFormRegister } from 'react-hook-form'
import { TextField } from '../fields'
import { PHONE_HELP_TEXT, DOB_HELP_TEXT } from '@/app/lib/constants/application'

/**
 * Application form data structure (simplified for this section)
 */
interface PersonalInfoFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
}

/**
 * Props for PersonalInfoSection component
 */
interface PersonalInfoSectionProps {
  /** React Hook Form register function */
  register: UseFormRegister<any>
  /** Form validation errors */
  errors: FieldErrors<PersonalInfoFormData>
  /** Whether the form is disabled */
  disabled?: boolean
}

/**
 * Personal Information section component for application form
 * Handles firstName, lastName, email, phone, and dateOfBirth fields
 * 
 * @param props - PersonalInfoSection component props
 * @returns JSX.Element - Rendered personal information section
 */
export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  register,
  errors,
  disabled = false,
}) => {
  return (
    <fieldset disabled={disabled}>
      <legend className="text-xl font-semibold mb-4">Personal Information</legend>

      <div className="grid sm:grid-cols-2 gap-4">
        <TextField
          register={register('firstName')}
          type="text"
          id="firstName"
          label="First Name"
          required
          error={errors.firstName}
          disabled={disabled}
        />

        <TextField
          register={register('lastName')}
          type="text"
          id="lastName"
          label="Last Name"
          required
          error={errors.lastName}
          disabled={disabled}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <TextField
          register={register('email')}
          type="email"
          id="email"
          label="Email Address"
          required
          error={errors.email}
          disabled={disabled}
        />

        <TextField
          register={register('phone')}
          type="tel"
          id="phone"
          label="Phone Number"
          required
          placeholder="+254712345678"
          helpText={PHONE_HELP_TEXT}
          error={errors.phone}
          disabled={disabled}
        />
      </div>

      <div className="mt-4">
        <TextField
          register={register('dateOfBirth')}
          type="date"
          id="dateOfBirth"
          label="Date of Birth"
          required
          helpText={DOB_HELP_TEXT}
          error={errors.dateOfBirth}
          disabled={disabled}
          className="sm:w-auto"
        />
      </div>
    </fieldset>
  )
}

export default PersonalInfoSection