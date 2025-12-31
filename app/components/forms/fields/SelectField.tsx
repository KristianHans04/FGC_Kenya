/**
 * @file SelectField.tsx
 * @description Reusable select dropdown field component with validation support
 * @author Team Kenya Dev
 */

import React from 'react'
import { UseFormRegisterReturn, FieldError } from 'react-hook-form'

/**
 * Option for select dropdown
 */
interface SelectOption {
  value: string
  label: string
}

/**
 * Props for the SelectField component
 */
interface SelectFieldProps {
  /** Field registration object from react-hook-form */
  register: UseFormRegisterReturn
  /** Field ID and name */
  id: string
  /** Field label text */
  label: string
  /** Options for the select dropdown */
  options: readonly SelectOption[]
  /** Whether the field is required */
  required?: boolean
  /** Field validation error */
  error?: FieldError
  /** Placeholder text for default option */
  placeholder?: string
  /** Help text displayed below the select */
  helpText?: string
  /** Whether the field is disabled */
  disabled?: boolean
  /** CSS class name for the select */
  className?: string
  /** ARIA described by ID for additional context */
  ariaDescribedBy?: string
}

/**
 * Reusable select field component with accessibility and validation
 * 
 * @param props - SelectField component props
 * @returns JSX.Element - Rendered select field with label, error, and help text
 */
export const SelectField: React.FC<SelectFieldProps> = ({
  register,
  id,
  label,
  options,
  required = false,
  error,
  placeholder = 'Select an option',
  helpText,
  disabled = false,
  className = '',
  ariaDescribedBy,
}) => {
  const baseClassName = `w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background transition-colors ${className}`
  const errorId = error ? `${id}-error` : undefined
  const helpId = helpText ? `${id}-help` : undefined
  
  // Combine aria-describedby values
  const describedBy = [errorId, helpId, ariaDescribedBy].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2">
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      <select
        {...register}
        id={id}
        disabled={disabled}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={baseClassName}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {helpText && !error && (
        <p id={helpId} className="mt-1 text-xs text-muted-foreground">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-500" role="alert">
          {error.message}
        </p>
      )}
    </div>
  )
}

export default SelectField