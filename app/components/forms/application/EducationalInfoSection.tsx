/**
 * @file EducationalInfoSection.tsx
 * @description Educational information section for the application form
 * @author Team Kenya Dev
 */

import React from 'react'
import { FieldErrors, UseFormRegister } from 'react-hook-form'
import { TextField, SelectField } from '../fields'
import { GRADE_OPTIONS, COUNTIES_SIMPLIFIED } from '@/app/lib/constants/application'

/**
 * Application form data structure (simplified for this section)
 */
interface EducationalInfoFormData {
  school: string
  grade: string
  county: string
}

/**
 * Props for EducationalInfoSection component
 */
interface EducationalInfoSectionProps {
  /** React Hook Form register function */
  register: UseFormRegister<any>
  /** Form validation errors */
  errors: FieldErrors<EducationalInfoFormData>
  /** Whether the form is disabled */
  disabled?: boolean
}

/**
 * Educational Information section component for application form
 * Handles school, grade, and county fields
 * 
 * @param props - EducationalInfoSection component props
 * @returns JSX.Element - Rendered educational information section
 */
export const EducationalInfoSection: React.FC<EducationalInfoSectionProps> = ({
  register,
  errors,
  disabled = false,
}) => {
  // Convert counties to select options
  const countyOptions = COUNTIES_SIMPLIFIED.map(county => ({
    value: county,
    label: county
  }))

  return (
    <fieldset disabled={disabled}>
      <legend className="text-xl font-semibold mb-4">Educational Information</legend>

      <div className="grid sm:grid-cols-2 gap-4">
        <TextField
          register={register('school')}
          type="text"
          id="school"
          label="School Name"
          required
          error={errors.school}
          disabled={disabled}
        />

        <SelectField
          register={register('grade')}
          id="grade"
          label="Current Grade/Form"
          options={GRADE_OPTIONS}
          required
          placeholder="Select grade"
          error={errors.grade}
          disabled={disabled}
        />
      </div>

      <div className="mt-4">
        <SelectField
          register={register('county')}
          id="county"
          label="County"
          options={countyOptions}
          required
          placeholder="Select county"
          error={errors.county}
          disabled={disabled}
        />
      </div>
    </fieldset>
  )
}

export default EducationalInfoSection