/**
 * @file TextField.tsx
 * @description Reusable text input field component with validation support
 * @author Team Kenya Dev
 */

import React from 'react'
import { UseFormRegisterReturn, FieldError } from 'react-hook-form'

/**
 * Props for the TextField component
 */
interface TextFieldProps {
  /** Field registration object from react-hook-form */
  register: UseFormRegisterReturn
  /** Input type (text, email, tel, etc.) */
  type?: string
  /** Field ID and name */
  id: string
  /** Field label text */
  label: string
  /** Whether the field is required */
  required?: boolean
  /** Field validation error */
  error?: FieldError
  /** Placeholder text */
  placeholder?: string
  /** Help text displayed below the input */
  helpText?: string
  /** Whether the field is disabled */
  disabled?: boolean
  /** CSS class name for the input */
  className?: string
  /** ARIA described by ID for additional context */
  ariaDescribedBy?: string
}

/**
 * Reusable text input field component with accessibility and validation
 * 
 * @param props - TextField component props
 * @returns JSX.Element - Rendered text field with label, error, and help text
 */
export const TextField: React.FC<TextFieldProps> = ({
  register,
  type = 'text',
  id,
  label,
  required = false,
  error,
  placeholder,
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
      
      <input
        {...register}
        type={type}
        id={id}
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

export default TextField