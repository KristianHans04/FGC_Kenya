'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, ArrowRight, Search, Filter, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAllStories, getAllCategories, formatDate, formatRelativeDate, MediaStory } from '@/app/lib/media'




const STORIES_PER_PAGE = 6

/**
 * Media page displaying all stories with pagination, search, and filtering
 * Showcases Team Kenya updates, achievements, and news
 */
export default function MediaPage() {
  const allStories = getAllStories()
  const allCategories = getAllCategories()
  
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter stories based on category and search
  const filteredStories = allStories.filter((story) => {
    const matchesCategory = selectedCategory === 'All' || story.category === selectedCategory
    const matchesSearch = 
      searchQuery === '' ||
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // Sort by date (newest first)
  const sortedStories = filteredStories.sort((a, b) => 
    new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  )

  // Calculate pagination
  const totalPages = Math.ceil(sortedStories.length / STORIES_PER_PAGE)
  const startIndex = (currentPage - 1) * STORIES_PER_PAGE
  const endIndex = startIndex + STORIES_PER_PAGE
  const paginatedStories = sortedStories.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 african-pattern opacity-5"></div>
        <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="h-1 w-8 bg-kenya-black"></div>
              <div className="h-1 w-8 bg-kenya-red"></div>
              <div className="h-1 w-8 bg-kenya-green"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              Media & <span className="text-primary">Stories</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover the latest updates, achievements, and inspiring stories from Team Kenya's journey in robotics and STEM education
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              {/* Search Bar */}
              <div className="flex-grow">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search stories, authors, or tags..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Search stories"
                  />
                </div>
              </div>
              
              {/* Category Filter Dropdown */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Filter by category"
                >
                  <option value="All">All Categories</option>
                  {allCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('All')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-primary text-white'
                    : 'bg-background hover:bg-muted'
                }`}
              >
                All
              </button>
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Results count */}
            <div className="mt-6 text-sm text-muted-foreground">
              Showing {paginatedStories.length} of {sortedStories.length} {sortedStories.length === 1 ? 'story' : 'stories'}
            </div>
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-12">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {paginatedStories.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {paginatedStories.map((story, index) => (
                    <motion.article
                      key={story.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="card hover:shadow-xl transition-shadow group"
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Story Image</span>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md">
                          {story.category}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatRelativeDate(story.publishedDate)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        <Link href={`/media/${story.slug}`}>
                          {story.title}
                        </Link>
                      </h3>

                      {/* Excerpt */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {story.excerpt}
                      </p>

                      {/* Tags */}
                      {story.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {story.tags.slice(0, 3).map((tag, idx) => (
                            <span 
                              key={idx} 
                              className="inline-flex items-center gap-1 px-2 py-1 bg-background text-xs rounded-md"
                            >
                              <Tag className="h-3 w-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="line-clamp-1">{story.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{story.readTimeMinutes} min</span>
                          </div>
                        </div>
                        <Link
                          href={`/media/${story.slug}`}
                          className="inline-flex items-center text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                        >
                          Read
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first, last, current, and adjacent pages
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`min-w-[40px] h-10 rounded-lg transition-colors ${
                                page === currentPage
                                  ? 'bg-primary text-white'
                                  : 'hover:bg-muted'
                              }`}
                              aria-label={`Go to page ${page}`}
                              aria-current={page === currentPage ? 'page' : undefined}
                            >
                              {page}
                            </button>
                          )
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return <span key={page} className="px-2">...</span>
                        }
                        return null
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  No stories found matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('All')
                    setCurrentPage(1)
                  }}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-kenya-green/10 to-kenya-red/10">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Be Part of Our <span className="text-primary">Story</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Join Team Kenya on our mission to inspire the next generation of Kenyan innovators and STEM leaders
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/join" className="btn-primary">
                Join Our Team
              </Link>
              <Link href="/support" className="btn-secondary">
                Support Our Mission
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
