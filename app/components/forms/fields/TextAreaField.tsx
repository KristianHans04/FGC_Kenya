/**
 * @file TextAreaField.tsx
 * @description Reusable textarea field component with validation support
 * @author Team Kenya Dev
 */

import React from 'react'
import { UseFormRegisterReturn, FieldError } from 'react-hook-form'

/**
 * Props for the TextAreaField component
 */
interface TextAreaFieldProps {
  /** Field registration object from react-hook-form */
  register: UseFormRegisterReturn
  /** Field ID and name */
  id: string
  /** Field label text */
  label: string
  /** Number of rows for the textarea */
  rows?: number
  /** Whether the field is required */
  required?: boolean
  /** Field validation error */
  error?: FieldError
  /** Placeholder text */
  placeholder?: string
  /** Help text displayed below the textarea */
  helpText?: string
  /** Whether the field is disabled */
  disabled?: boolean
  /** CSS class name for the textarea */
  className?: string
  /** ARIA described by ID for additional context */
  ariaDescribedBy?: string
}

/**
 * Reusable textarea field component with accessibility and validation
 * 
 * @param props - TextAreaField component props
 * @returns JSX.Element - Rendered textarea field with label, error, and help text
 */
export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  register,
  id,
  label,
  rows = 4,
  required = false,
  error,
  placeholder,
  helpText,
  disabled = false,
  className = '',
  ariaDescribedBy,
}) => {
  const baseClassName = `w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background resize-none transition-colors ${className}`
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
      
      <textarea
        {...register}
        id={id}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={baseClassName}
      />
      
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

export default TextAreaField