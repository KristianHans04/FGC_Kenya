'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface AutocompleteInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  onAddOption?: (newOption: string) => void
  className?: string
  required?: boolean
  disabled?: boolean
  allowCustom?: boolean
  loading?: boolean
}

export default function AutocompleteInput({
  placeholder = "Type to search...",
  value,
  onChange,
  options,
  onAddOption,
  className = "",
  required = false,
  disabled = false,
  allowCustom = true,
  loading = false
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    setSearchTerm(value)
  }, [value])
  
  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOptions(filtered)
    } else {
      setFilteredOptions(options)
    }
    setHighlightedIndex(-1)
  }, [searchTerm, options])
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    setIsOpen(true)
    
    if (allowCustom) {
      onChange(newValue)
    }
  }
  
  const handleOptionSelect = (option: Option) => {
    setSearchTerm(option.label)
    onChange(option.value)
    setIsOpen(false)
    inputRef.current?.blur()
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        return
      }
    }
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleOptionSelect(filteredOptions[highlightedIndex])
        } else if (allowCustom && searchTerm && onAddOption) {
          // Add new option if it doesn't exist
          const existingOption = options.find(opt => 
            opt.value.toLowerCase() === searchTerm.toLowerCase() ||
            opt.label.toLowerCase() === searchTerm.toLowerCase()
          )
          if (!existingOption) {
            onAddOption(searchTerm)
          }
          onChange(searchTerm)
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
      case 'Tab':
        setIsOpen(false)
        break
    }
  }
  
  const showAddOption = allowCustom && searchTerm && 
    !filteredOptions.some(opt => 
      opt.label.toLowerCase() === searchTerm.toLowerCase()
    ) && onAddOption
  
  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          disabled={disabled || loading}
          className={`w-full px-3 py-2 pr-8 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 ${className}`}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors disabled:opacity-50"
        >
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      <AnimatePresence>
        {isOpen && (filteredOptions.length > 0 || showAddOption || loading) && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-card border border-border rounded-lg shadow-lg"
          >
            {loading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Loading options...
              </div>
            ) : (
              <>
                {filteredOptions.map((option, index) => (
                  <button
                    key={`${option.value}-${index}`}
                    type="button"
                    onClick={() => handleOptionSelect(option)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${
                      index === highlightedIndex ? 'bg-muted' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                
                {showAddOption && (
                  <button
                    type="button"
                    onClick={() => {
                      onAddOption!(searchTerm)
                      onChange(searchTerm)
                      setIsOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm text-primary hover:bg-muted transition-colors border-t border-border ${
                      filteredOptions.length === highlightedIndex ? 'bg-muted' : ''
                    }`}
                  >
                    Add "{searchTerm}"
                  </button>
                )}
                
                {filteredOptions.length === 0 && !showAddOption && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No options found
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}