/**
 * @file ExperienceSection.tsx
 * @description Experience and interest section for the application form
 * @author Team Kenya Dev
 */

import React from 'react'
import { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form'
import { SelectField, TextAreaField, CheckboxField } from '../fields'
import { 
  EXPERIENCE_OPTIONS, 
  INTEREST_AREAS_WITH_ICONS, 
  MOTIVATION_HELP_TEXT, 
  INTERESTS_HELP_TEXT 
} from '@/app/lib/constants/application'

/**
 * Application form data structure (simplified for this section)
 */
interface ExperienceFormData {
  experience: string
  interests: string[]
  motivation: string
}

/**
 * Props for ExperienceSection component
 */
interface ExperienceSectionProps {
  /** React Hook Form register function */
  register: UseFormRegister<any>
  /** React Hook Form watch function for real-time updates */
  watch: UseFormWatch<any>
  /** Form validation errors */
  errors: FieldErrors<ExperienceFormData>
  /** Whether the form is disabled */
  disabled?: boolean
}

/**
 * Experience and Interest section component for application form
 * Handles experience level, interests, and motivation fields
 * 
 * @param props - ExperienceSection component props
 * @returns JSX.Element - Rendered experience and interest section
 */
export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  register,
  watch,
  errors,
  disabled = false,
}) => {
  const selectedInterests = watch('interests') || []

  return (
    <fieldset disabled={disabled}>
      <legend className="text-xl font-semibold mb-4">Experience & Interest</legend>

      <div>
        <SelectField
          register={register('experience')}
          id="experience"
          label="Robotics/Programming Experience"
          options={EXPERIENCE_OPTIONS}
          required
          placeholder="Select experience level"
          error={errors.experience}
          disabled={disabled}
        />
      </div>

      <div className="mt-4">
        <fieldset>
          <legend className="block text-sm font-medium mb-2">
            Areas of Interest
            <span className="text-red-500 ml-1" aria-label="required">*</span>
            <span className="text-xs text-muted-foreground ml-2">{INTERESTS_HELP_TEXT}</span>
          </legend>
          
          <div className="grid sm:grid-cols-2 gap-3 mt-2">
            {INTEREST_AREAS_WITH_ICONS.map(area => {
              const IconComponent = area.icon
              return (
                <label
                  key={area.id}
                  className="flex items-center space-x-3 p-3 border border-border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <input
                    {...register('interests')}
                    type="checkbox"
                    value={area.id}
                    disabled={disabled}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    aria-describedby={`${area.id}-label`}
                  />
                  <span id={`${area.id}-label`} className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm">{area.label}</span>
                  </span>
                </label>
              )
            })}
          </div>
          
          {errors.interests && (
            <p className="mt-1 text-sm text-red-500" role="alert">
              {errors.interests.message}
            </p>
          )}
        </fieldset>
      </div>

      <div className="mt-4">
        <TextAreaField
          register={register('motivation')}
          id="motivation"
          label="Why do you want to join Team Kenya?"
          rows={4}
          required
          placeholder="Tell us about your passion for STEM, robotics, and representing Kenya..."
          helpText={MOTIVATION_HELP_TEXT}
          error={errors.motivation}
          disabled={disabled}
        />
      </div>
    </fieldset>
  )
}

export default ExperienceSection