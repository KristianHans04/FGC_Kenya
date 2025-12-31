/**
 * @file ConsentSection.tsx
 * @description Consent and terms section for the application form
 * @author Team Kenya Dev
 */

import React from 'react'
import Link from 'next/link'
import { FieldErrors, UseFormRegister } from 'react-hook-form'
import { CheckboxField } from '../fields'

/**
 * Application form data structure (simplified for this section)
 */
interface ConsentFormData {
  parentConsent: boolean
  termsAccepted: boolean
}

/**
 * Props for ConsentSection component
 */
interface ConsentSectionProps {
  /** React Hook Form register function */
  register: UseFormRegister<any>
  /** Form validation errors */
  errors: FieldErrors<ConsentFormData>
  /** Whether the form is disabled */
  disabled?: boolean
}

/**
 * Consent and Terms section component for application form
 * Handles parent consent and terms acceptance checkboxes
 * 
 * @param props - ConsentSection component props
 * @returns JSX.Element - Rendered consent and terms section
 */
export const ConsentSection: React.FC<ConsentSectionProps> = ({
  register,
  errors,
  disabled = false,
}) => {
  return (
    <fieldset disabled={disabled}>
      <legend className="text-xl font-semibold mb-4">Consent & Terms</legend>

      <div className="space-y-3">
        <CheckboxField
          register={register('parentConsent')}
          id="parentConsent"
          label={
            <span id="consent-text">
              I confirm that I have my parent/guardian's consent to apply for Team Kenya
              <span className="text-red-500" aria-label="required"> *</span>
            </span>
          }
          required
          error={errors.parentConsent}
          disabled={disabled}
          ariaDescribedBy="consent-text"
        />

        <CheckboxField
          register={register('termsAccepted')}
          id="termsAccepted"
          label={
            <span id="terms-text">
              I accept the{' '}
              <Link href="/terms" className="text-primary hover:text-primary-light underline">
                terms and conditions
              </Link>
              {' '}and understand the commitment required
              <span className="text-red-500" aria-label="required"> *</span>
            </span>
          }
          required
          error={errors.termsAccepted}
          disabled={disabled}
          ariaDescribedBy="terms-text"
        />
      </div>
    </fieldset>
  )
}

export default ConsentSection