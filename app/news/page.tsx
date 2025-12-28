import type { Metadata } from 'next'
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, ArrowRight, Search, Filter, Tag } from 'lucide-react'
import Link from 'next/link'



/**
 * NewsPage component
 * Displays news articles with filtering and search functionality
 * Features a grid layout with article cards, category filtering, and search capabilities
 *
 * @returns {JSX.Element} The news page component
 */

// Mock data - In production, this would come from an API
const newsArticles = [
  {
    id: 1,
    title: 'Team Kenya Prepares for FIRST Global Challenge 2025: Eco Equilibrium',
    excerpt: 'Our team is intensively preparing for the Eco Equilibrium challenge in Panama City this October. With focus on environmental balance and sustainable solutions...',
    category: 'Competition',
    date: '2025-09-15',
    readTime: '5 min read',
    author: 'Team Kenya Admin',
    image: '/images/news/panama-prep.jpg',
    tags: ['FGC 2025', 'Panama', 'Eco Equilibrium', 'Preparation'],
    featured: true,
  },
  {
    id: 2,
    title: 'Kenya STEM Outreach Program Reaches 100 Schools',
    excerpt: 'Our outreach initiative has successfully reached its milestone of engaging with 100 schools across Kenya, inspiring thousands of students...',
    category: 'Outreach',
    date: '2025-09-10',
    readTime: '4 min read',
    author: 'Outreach Team',
    image: '/images/news/outreach.jpg',
    tags: ['Outreach', 'Education', 'STEM'],
    featured: false,
  },
  {
    id: 3,
    title: 'Alumni Success: Former Team Member Wins International Engineering Award',
    excerpt: 'Jane Wanjiru, a 2019 team member, has been recognized with the prestigious Young Engineer Award for her innovative work in renewable energy...',
    category: 'Alumni',
    date: '2025-09-05',
    readTime: '3 min read',
    author: 'Alumni Relations',
    image: '/images/news/alumni.jpg',
    tags: ['Alumni', 'Success Story', 'Awards'],
    featured: true,
  },
  {
    id: 4,
    title: 'New Partnership with Tech Company Boosts Team Resources',
    excerpt: 'We are excited to announce a new partnership that will provide our team with cutting-edge robotics equipment and opportunities...',
    category: 'Partnership',
    date: '2025-08-28',
    readTime: '6 min read',
    author: 'Team Kenya Admin',
    image: '/images/news/partnership.jpg',
    tags: ['Partnership', 'Sponsorship', 'Resources'],
    featured: false,
  },
  {
    id: 5,
    title: 'Workshop Series: Introduction to Robotics for Beginners',
    excerpt: 'Join us for our monthly workshop series designed to introduce young students to the exciting world of robotics and programming...',
    category: 'Workshop',
    date: '2025-08-20',
    readTime: '4 min read',
    author: 'Education Team',
    image: '/images/news/workshop.jpg',
    tags: ['Workshop', 'Education', 'Robotics'],
    featured: false,
  },
  {
    id: 6,
    title: 'Team Kenya Reflection: Lessons from Greece 2024 - Feeding the Future',
    excerpt: 'Looking back at our participation in Athens for the Feeding the Future challenge, we share key insights from our agricultural robotics solutions and experiences that shaped our team\'s growth...',
    category: 'Competition',
    date: '2025-08-15',
    readTime: '7 min read',
    author: 'Team Captain',
    image: '/images/news/greece.jpg',
    tags: ['FGC 2024', 'Greece', 'Feeding the Future', 'Reflection'],
    featured: false,
  },
]

const categories = ['All', 'Competition', 'Outreach', 'Alumni', 'Partnership', 'Workshop']

/**
 * NewsPage component
 * Displays news articles with search and filtering capabilities
 * Features featured stories and a list of regular updates
 * 
 * @returns {JSX.Element} The news page component
 */
export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredArticles = newsArticles.filter((article) => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const featuredArticles = filteredArticles.filter(article => article.featured)
  const regularArticles = filteredArticles.filter(article => !article.featured)

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
              News & <span className="text-primary">Updates</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Stay updated with Team Kenya's latest achievements, events, and STEM initiatives
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
                    placeholder="Search news, tags, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
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
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="py-12">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Featured Stories</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {featuredArticles.map((article, index) => (
                  <motion.article
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="card hover:shadow-xl transition-shadow group"
                  >
                    <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <span className="text-muted-foreground">Featured Image</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                        {article.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(article.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {article.readTime}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {article.author}
                      </div>
                      <Link
                        href={`/news/${article.id}`}
                        className="inline-flex items-center text-primary hover:text-primary-light transition-colors"
                      >
                        Read More
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Regular Articles Grid */}
      <section className="py-12 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Latest Updates</h2>
            
            {regularArticles.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularArticles.map((article, index) => (
                  <motion.article
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="card hover:shadow-xl transition-shadow group"
                  >
                    <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Article Image</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-muted text-xs rounded-md">
                        {article.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(article.date).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-background text-xs rounded-md">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/news/${article.id}`}
                      className="inline-flex items-center text-sm text-primary hover:text-primary-light transition-colors"
                    >
                      Read Article
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No articles found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center card bg-gradient-to-br from-primary/10 to-secondary/10"
          >
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter and never miss an update from Team Kenya
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="btn-primary">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}