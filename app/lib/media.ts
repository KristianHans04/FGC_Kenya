/**
 * Media utility functions for loading and processing stories
 * Provides functions to fetch, filter, and calculate reading time for media stories
 */

import mediaData from '@/public/data/media-stories.json'

/**
 * Content block types supported in story content
 */
export type ContentBlock = 
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'image'; url: string; alt: string; caption?: string }
  | { type: 'blockquote'; text: string; author?: string }

/**
 * Story interface matching the JSON structure
 */
export interface MediaStory {
  id: string
  title: string
  slug: string
  excerpt: string
  content: ContentBlock[]
  author: string
  authorBio: string
  publishedDate: string
  updatedDate: string
  category: string
  tags: string[]
  featured: boolean
  thumbnail: string
  readTimeMinutes: number
}

/**
 * Get all media stories from JSON
 * @returns Array of all media stories
 */
export function getAllStories(): MediaStory[] {
  return mediaData.stories as MediaStory[]
}

/**
 * Get a single story by ID or slug
 * @param identifier - Story ID or slug
 * @returns Story object or undefined if not found
 */
export function getStoryByIdentifier(identifier: string): MediaStory | undefined {
  const stories = getAllStories()
  return stories.find(story => story.id === identifier || story.slug === identifier)
}

/**
 * Get paginated stories
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of stories per page
 * @returns Object with stories array and pagination metadata
 */
export function getPaginatedStories(page: number = 1, pageSize: number = 6) {
  const allStories = getAllStories()
  const sortedStories = allStories.sort((a, b) => 
    new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  )
  
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedStories = sortedStories.slice(startIndex, endIndex)
  
  return {
    stories: paginatedStories,
    currentPage: page,
    totalPages: Math.ceil(sortedStories.length / pageSize),
    totalStories: sortedStories.length,
    hasNextPage: endIndex < sortedStories.length,
    hasPreviousPage: page > 1
  }
}

/**
 * Get featured stories for homepage carousel
 * @param limit - Maximum number of featured stories to return
 * @returns Array of featured stories
 */
export function getFeaturedStories(limit: number = 3): MediaStory[] {
  const stories = getAllStories()
  return stories
    .filter(story => story.featured)
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    .slice(0, limit)
}

/**
 * Get stories by category
 * @param category - Category to filter by
 * @returns Array of stories in the specified category
 */
export function getStoriesByCategory(category: string): MediaStory[] {
  const stories = getAllStories()
  return stories.filter(story => story.category === category)
}

/**
 * Get stories by tag
 * @param tag - Tag to filter by
 * @returns Array of stories with the specified tag
 */
export function getStoriesByTag(tag: string): MediaStory[] {
  const stories = getAllStories()
  return stories.filter(story => story.tags.includes(tag))
}

/**
 * Get similar stories based on category and tags
 * @param currentStory - The current story to find similar stories for
 * @param limit - Maximum number of similar stories to return
 * @returns Array of similar stories
 */
export function getSimilarStories(currentStory: MediaStory, limit: number = 3): MediaStory[] {
  const allStories = getAllStories()
  
  // Filter out the current story
  const otherStories = allStories.filter(story => story.id !== currentStory.id)
  
  // Calculate similarity scores
  const storiesWithScores = otherStories.map(story => {
    let score = 0
    
    // Same category adds significant weight
    if (story.category === currentStory.category) {
      score += 5
    }
    
    // Shared tags add weight
    const sharedTags = story.tags.filter(tag => currentStory.tags.includes(tag))
    score += sharedTags.length * 2
    
    return { story, score }
  })
  
  // Sort by score (descending) and return limited results
  return storiesWithScores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.story)
}

/**
 * Calculate reading time based on word count
 * Average reading speed: 200-250 words per minute
 * @param content - Array of content blocks
 * @returns Estimated reading time in minutes
 */
export function calculateReadingTime(content: ContentBlock[]): number {
  const WORDS_PER_MINUTE = 225
  
  // Count words in text content
  let wordCount = 0
  content.forEach(block => {
    if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'blockquote') {
      wordCount += block.text.split(/\s+/).length
    }
  })
  
  // Calculate minutes and round up
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE)
  return Math.max(1, minutes) // Minimum 1 minute
}

/**
 * Get all unique categories from stories
 * @returns Array of category names
 */
export function getAllCategories(): string[] {
  const stories = getAllStories()
  const categories = [...new Set(stories.map(story => story.category))]
  return categories.sort()
}

/**
 * Get all unique tags from stories
 * @returns Array of tag names
 */
export function getAllTags(): string[] {
  const stories = getAllStories()
  const tags = new Set<string>()
  stories.forEach(story => {
    story.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
}

/**
 * Format date for display
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format date in relative terms (e.g., "2 days ago")
 * @param dateString - ISO date string
 * @returns Relative date string
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}
