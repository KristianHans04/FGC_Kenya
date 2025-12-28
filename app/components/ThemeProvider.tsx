'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'

/**
 * ThemeProvider component
 * Wraps the application to provide theme context (light/dark mode)
 * Uses next-themes under the hood
 * 
 * @param {ThemeProviderProps} props - Component props including children
 * @returns {JSX.Element} The theme provider
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}