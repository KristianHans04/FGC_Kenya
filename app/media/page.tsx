'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  ChevronRight, 
  Eye,
  Tag,
  TrendingUp,
  FileText
} from 'lucide-react'

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage?: string
  author: {
    firstName?: string
    lastName?: string
    email: string
  }
  tags: string[]
  viewCount: number
  publishedAt: string
  readTime?: number
  featured?: boolean
}

export default function MediaPage() {
  useEffect(() => {
    document.title = 'Articles & Stories | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Read inspiring stories, technical articles, and updates from FIRST Global Team Kenya')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Read inspiring stories, technical articles, and updates from FIRST Global Team Kenya'
      document.head.appendChild(meta)
    }
  }, [])

  const [articles, setArticles] = useState<Article[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null)
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [popularTags, setPopularTags] = useState<string[]>([])
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([])

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/media/articles?status=published')
      if (response.ok) {
        const data = await response.json()
        const publishedArticles = data.articles || []
        
        setArticles(publishedArticles)
        setFilteredArticles(publishedArticles)
        
        // Set featured article (most recent or explicitly featured)
        const featured = publishedArticles.find((a: Article) => a.featured) || publishedArticles[0]
        setFeaturedArticle(featured)
        
        // Get trending articles (top 5 by view count)
        const trending = [...publishedArticles]
          .sort((a, b) => b.viewCount - a.viewCount)
          .slice(0, 5)
        setTrendingArticles(trending)
        
        // Extract popular tags
        const tagCounts: Record<string, number> = {}
        publishedArticles.forEach((article: Article) => {
          article.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
        })
        const popularTagsList = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([tag]) => tag)
        setPopularTags(popularTagsList)
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let filtered = articles

    // Filter by tag
    if (selectedTag !== 'all') {
      filtered = filtered.filter(article => 
        article.tags.includes(selectedTag)
      )
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    setFilteredArticles(filtered)
  }, [articles, selectedTag, searchQuery])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Articles & Stories
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400 text-lg"
          >
            Discover insights, updates, and stories from our robotics journey
          </motion.p>
        </div>

        {/* Search and Featured Article */}
        <div className="mb-12">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search articles by title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-gray-100 text-lg"
              />
            </div>
          </div>

          {/* Featured Article */}
          {featuredArticle && !searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl p-8 mb-8"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="inline-block px-3 py-1 bg-primary text-white rounded-full text-sm font-medium mb-4">
                    Featured Article
                  </span>
                  <h2 className="text-3xl font-bold mb-4">{featuredArticle.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {featuredArticle.author.firstName || featuredArticle.author.email.split('@')[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(featuredArticle.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {featuredArticle.viewCount} views
                    </span>
                  </div>
                  <Link
                    href={`/media/${featuredArticle.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                {featuredArticle.coverImage && (
                  <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                    <img
                      src={featuredArticle.coverImage}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Popular Tags */}
          {popularTags.length > 0 && !searchQuery && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Popular Topics</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    selectedTag === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  All Articles
                </button>
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2 rounded-full transition-colors ${
                      selectedTag === tag
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Articles Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">
              {selectedTag === 'all' ? 'All Articles' : `Articles tagged "${selectedTag}"`}
            </h2>
            
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-48 h-32 bg-gray-200 dark:bg-gray-700"></div>
                      <div className="flex-1 p-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No articles found</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  {searchQuery ? 'Try adjusting your search terms' : 'Check back soon for new content'}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedTag}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {filteredArticles.map((article, index) => (
                    <motion.article
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all group"
                    >
                      <Link href={`/media/${article.slug}`} className="flex flex-col md:flex-row">
                        {/* Article Image */}
                        <div className="md:w-48 h-48 md:h-32 relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                          {article.coverImage ? (
                            <img
                              src={article.coverImage}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Article Content */}
                        <div className="flex-1 p-6">
                          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {article.excerpt}
                          </p>
                          
                          {/* Article Meta */}
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {article.author.firstName || article.author.email.split('@')[0]}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(article.publishedAt)}
                            </span>
                            {article.readTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {article.readTime} min read
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {article.viewCount}
                            </span>
                          </div>

                          {/* Tags */}
                          {article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {article.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Read More Arrow */}
                        <div className="hidden md:flex items-center pr-6">
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Trending Articles */}
            {trendingArticles.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Trending Articles
                </h3>
                <div className="space-y-4">
                  {trendingArticles.map((article, index) => (
                    <Link
                      key={article.id}
                      href={`/media/${article.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        <span className="text-2xl font-bold text-gray-300 dark:text-gray-600">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                            {article.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {article.viewCount} views
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tags Cloud */}
            {popularTags.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTag === tag
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter CTA */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-2">Stay Updated</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Get the latest articles and updates delivered to your inbox.
              </p>
              <Link
                href="/newsletter"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Subscribe Now
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Pagination (placeholder for future implementation) */}
        {filteredArticles.length > 12 && (
          <div className="text-center mt-12">
            <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
              Load More Articles
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}