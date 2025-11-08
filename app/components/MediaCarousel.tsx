'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar, Clock, User, ArrowRight } from 'lucide-react'
import { MediaStory, formatDate } from '@/app/lib/media'

/**
 * MediaCarousel component props
 */
interface MediaCarouselProps {
  stories: MediaStory[]
  autoPlayInterval?: number
  showControls?: boolean
  className?: string
}

/**
 * Carousel component for displaying featured media stories
 * Includes auto-play, manual navigation, and responsive design
 * @param stories - Array of stories to display
 * @param autoPlayInterval - Auto-play interval in milliseconds (default: 5000)
 * @param showControls - Whether to show navigation controls (default: true)
 * @param className - Additional CSS classes
 */
export default function MediaCarousel({
  stories,
  autoPlayInterval = 5000,
  showControls = true,
  className = ''
}: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-play functionality
  useEffect(() => {
    if (isPaused || stories.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stories.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [isPaused, stories.length, autoPlayInterval])

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (stories.length === 0) {
    return null
  }

  const currentStory = stories[currentIndex]

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Featured media stories carousel"
    >
      {/* Main carousel content */}
      <div className="relative w-full min-h-[400px] sm:min-h-[450px] md:min-h-[500px] lg:aspect-[21/9]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStory.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background image with gradient overlay */}
            <div className="absolute inset-0 w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-end w-full">
              <div className="w-full px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 lg:pb-12">
                <div className="max-w-3xl mx-auto lg:mx-0">
                  {/* Category badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap items-center gap-2 mb-2 md:mb-3"
                  >
                    <span className="px-2.5 py-1 bg-primary text-white text-xs sm:text-sm font-medium rounded-full">
                      {currentStory.category}
                    </span>
                    <span className="text-white/80 text-xs sm:text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      {formatDate(currentStory.publishedDate)}
                    </span>
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold font-heading text-white mb-2 md:mb-3 line-clamp-2 leading-tight"
                  >
                    {currentStory.title}
                  </motion.h3>

                  {/* Excerpt */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/90 text-sm sm:text-base mb-3 md:mb-5 line-clamp-2 leading-relaxed"
                  >
                    {currentStory.excerpt}
                  </motion.p>

                  {/* Author and read time */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 md:mb-5 text-xs sm:text-sm text-white/80"
                  >
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{currentStory.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{currentStory.readTimeMinutes} min read</span>
                    </div>
                  </motion.div>

                  {/* Read more button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="hidden sm:block"
                  >
                    <Link
                      href={`/media/${currentStory.slug}`}
                      className="inline-flex items-center px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors"
                    >
                      Read Full Story
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </motion.div>
                   <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="block sm:hidden"
                  >
                    <Link
                      href={`/media/${currentStory.slug}`}
                      className="inline-flex items-center px-4 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors text-sm"
                    >
                      Read Story
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation controls */}
      {showControls && stories.length > 1 && (
        <>
          {/* Previous/Next buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm z-10 cursor-pointer"
            aria-label="Previous story"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm z-10 cursor-pointer"
            aria-label="Next story"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Indicator dots */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {stories.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  index === currentIndex
                    ? 'w-6 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to story ${index + 1}`}
                aria-current={index === currentIndex}
              />
            ))}
          </div>
        </>
      )}

      {/* Pause indicator when hovering */}
      {isPaused && stories.length > 1 && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-sm rounded-full">
          Paused
        </div>
      )}
    </div>
  )
}
