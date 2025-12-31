/**
 * @file lib/utils/metadata.ts
 * @description Utility functions for generating page metadata
 * @author Team Kenya Dev
 */

import type { Metadata } from 'next'

const BASE_TITLE = 'FIRST Global Team Kenya'
const DEFAULT_DESCRIPTION = 'Official website of FIRST Global Challenge Team Kenya. Join us in inspiring young Kenyans through robotics and STEM education.'

/**
 * Generate page title with consistent format
 * @param pageTitle - The specific page title
 * @param options - Additional options for title generation
 * @returns Formatted title string
 */
export function generateTitle(
  pageTitle?: string,
  options?: {
    suffix?: boolean
    separator?: string
  }
): string {
  const { suffix = true, separator = ' | ' } = options || {}
  
  if (!pageTitle) {
    return `${BASE_TITLE} - Inspiring the Future of STEM`
  }
  
  if (!suffix) {
    return pageTitle
  }
  
  return `${pageTitle}${separator}${BASE_TITLE}`
}

/**
 * Generate complete metadata for a page
 * @param options - Metadata options
 * @returns Complete Metadata object
 */
export function generateMetadata(options: {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
  noIndex?: boolean
}): Metadata {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    keywords = [],
    ogImage = '/images/og-image.jpg',
    noIndex = false,
  } = options

  const fullTitle = generateTitle(title)
  const defaultKeywords = ['FIRST Global', 'Team Kenya', 'Robotics', 'STEM', 'Education', 'Kenya', 'Technology', 'Innovation']
  const combinedKeywords = [...new Set([...keywords, ...defaultKeywords])].join(', ')

  return {
    title: fullTitle,
    description,
    keywords: combinedKeywords,
    openGraph: {
      title: fullTitle,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      type: 'website',
      siteName: BASE_TITLE,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  }
}

/**
 * Dashboard-specific metadata generator
 * @param role - User role
 * @param section - Dashboard section
 * @returns Complete Metadata object
 */
export function generateDashboardMetadata(
  role: string,
  section: string
): Metadata {
  const roleTitle = role.charAt(0).toUpperCase() + role.slice(1)
  const sectionTitle = section
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  return generateMetadata({
    title: `${sectionTitle} - ${roleTitle} Dashboard`,
    description: `${roleTitle} dashboard ${section} section for FIRST Global Team Kenya members`,
    noIndex: true, // Dashboard pages should not be indexed
  })
}