/**
 * @file CheckboxField.tsx
 * @description Reusable checkbox field component with validation support
 * @author Team Kenya Dev
 */

import React from 'react'
import { UseFormRegisterReturn, FieldError } from 'react-hook-form'

/**
 * Props for the CheckboxField component
 */
interface CheckboxFieldProps {
  /** Field registration object from react-hook-form */
  register: UseFormRegisterReturn
  /** Field ID and name */
  id: string
  /** Field label text */
  label: string | React.ReactNode
  /** Whether the field is required */
  required?: boolean
  /** Field validation error */
  error?: FieldError
  /** Whether the field is disabled */
  disabled?: boolean
  /** CSS class name for the container */
  className?: string
  /** ARIA described by ID for additional context */
  ariaDescribedBy?: string
  /** Checkbox value (for multiple checkboxes) */
  value?: string
}

/**
 * Reusable checkbox field component with accessibility and validation
 * 
 * @param props - CheckboxField component props
 * @returns JSX.Element - Rendered checkbox field with label and error
 */
export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  register,
  id,
  label,
  required = false,
  error,
  disabled = false,
  className = '',
  ariaDescribedBy,
  value,
}) => {
  const errorId = error ? `${id}-error` : undefined
  
  // Combine aria-describedby values
  const describedBy = [errorId, ariaDescribedBy].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <label className="flex items-start space-x-3 cursor-pointer">
        <input
          {...register}
          type="checkbox"
          id={id}
          value={value}
          disabled={disabled}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className="w-4 h-4 mt-1 text-primary border-border rounded focus:ring-primary transition-colors"
        />
        <span className="text-sm">
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </span>
      </label>
      
      {error && (
        <p id={errorId} className="ml-7 mt-1 text-sm text-red-500" role="alert">
          {error.message}
        </p>
      )}
    </div>
  )
}

export default CheckboxField