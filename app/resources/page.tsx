/**
 * @file page.tsx
 * @description Resources page for FIRST Global Team Kenya with learning materials and links
 * @author Team Kenya Dev
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen,
  Video,
  Code,
  FileText,
  Download,
  ExternalLink,
  Search,
  Filter,
  Cpu,
  Wrench,
  Lightbulb,
  GraduationCap,
  Users,
  Trophy,
  Globe,
  Zap,
  Box,
  Cog,
  Sparkles,
  ChevronRight,
  Clock,
  Star,
  ArrowUpRight,
  Youtube,
  Github,
  BookMarked,
  Microscope
} from 'lucide-react'
import Link from 'next/link'

// Resource categories
const categories = [
  { id: 'all', name: 'All Resources', icon: BookOpen },
  { id: 'robotics', name: 'Robotics', icon: Cpu },
  { id: 'programming', name: 'Programming', icon: Code },
  { id: 'mechanical', name: 'Mechanical', icon: Cog },
  { id: 'electrical', name: 'Electrical', icon: Zap },
  { id: 'competition', name: 'Competition', icon: Trophy },
  { id: 'stem', name: 'STEM Education', icon: Microscope },
]

// Learning resources data
const resources = [
  // Robotics Resources
  {
    id: 1,
    category: 'robotics',
    type: 'guide',
    title: 'Introduction to Robotics',
    description: 'Comprehensive guide covering robotics fundamentals, sensors, and actuators',
    difficulty: 'beginner',
    duration: '2 hours',
    format: 'PDF',
    icon: Cpu,
    link: '#',
    featured: true,
  },
  {
    id: 2,
    category: 'robotics',
    type: 'video',
    title: 'Building Your First Robot',
    description: 'Step-by-step video tutorial on assembling a basic competition robot',
    difficulty: 'beginner',
    duration: '45 mins',
    format: 'Video',
    icon: Video,
    link: '#',
  },
  {
    id: 3,
    category: 'robotics',
    type: 'guide',
    title: 'Advanced Robot Design',
    description: 'Design principles for competitive robotics and optimization techniques',
    difficulty: 'advanced',
    duration: '3 hours',
    format: 'PDF',
    icon: Box,
    link: '#',
  },

  // Programming Resources
  {
    id: 4,
    category: 'programming',
    type: 'tutorial',
    title: 'Python for Robotics',
    description: 'Learn Python programming specifically for robotics applications',
    difficulty: 'intermediate',
    duration: '4 hours',
    format: 'Interactive',
    icon: Code,
    link: '#',
    featured: true,
  },
  {
    id: 5,
    category: 'programming',
    type: 'guide',
    title: 'Arduino Programming Basics',
    description: 'Getting started with Arduino microcontrollers and basic programming',
    difficulty: 'beginner',
    duration: '2 hours',
    format: 'PDF',
    icon: Cpu,
    link: '#',
  },
  {
    id: 6,
    category: 'programming',
    type: 'video',
    title: 'ROS (Robot Operating System)',
    description: 'Introduction to ROS for advanced robot control and navigation',
    difficulty: 'advanced',
    duration: '5 hours',
    format: 'Video Series',
    icon: Video,
    link: '#',
  },

  // Mechanical Resources
  {
    id: 7,
    category: 'mechanical',
    type: 'guide',
    title: 'CAD Design with Fusion 360',
    description: 'Learn 3D modeling and design for robot parts and assemblies',
    difficulty: 'intermediate',
    duration: '3 hours',
    format: 'PDF + Videos',
    icon: Wrench,
    link: '#',
  },
  {
    id: 8,
    category: 'mechanical',
    type: 'tutorial',
    title: 'Gear Systems and Drivetrains',
    description: 'Understanding mechanical advantage and drivetrain design',
    difficulty: 'intermediate',
    duration: '2 hours',
    format: 'Interactive',
    icon: Cog,
    link: '#',
  },

  // Electrical Resources
  {
    id: 9,
    category: 'electrical',
    type: 'guide',
    title: 'Circuit Design Fundamentals',
    description: 'Basic electrical engineering concepts for robotics',
    difficulty: 'beginner',
    duration: '2 hours',
    format: 'PDF',
    icon: Zap,
    link: '#',
  },
  {
    id: 10,
    category: 'electrical',
    type: 'video',
    title: 'Motor Control Systems',
    description: 'Understanding and implementing various motor control techniques',
    difficulty: 'intermediate',
    duration: '1.5 hours',
    format: 'Video',
    icon: Video,
    link: '#',
  },

  // Competition Resources
  {
    id: 11,
    category: 'competition',
    type: 'guide',
    title: 'FIRST Global Game Manual 2024',
    description: 'Official game rules and scoring for the current season',
    difficulty: 'all',
    duration: '1 hour',
    format: 'PDF',
    icon: Trophy,
    link: '#',
    featured: true,
  },
  {
    id: 12,
    category: 'competition',
    type: 'video',
    title: 'Strategy and Alliance Play',
    description: 'Winning strategies for FIRST Global competitions',
    difficulty: 'advanced',
    duration: '2 hours',
    format: 'Video',
    icon: Users,
    link: '#',
  },

  // STEM Education
  {
    id: 13,
    category: 'stem',
    type: 'course',
    title: 'Introduction to STEM',
    description: 'Foundational concepts in Science, Technology, Engineering, and Mathematics',
    difficulty: 'beginner',
    duration: '6 hours',
    format: 'Online Course',
    icon: GraduationCap,
    link: '#',
  },
  {
    id: 14,
    category: 'stem',
    type: 'guide',
    title: 'Project-Based Learning',
    description: 'How to design and implement STEM projects for students',
    difficulty: 'intermediate',
    duration: '3 hours',
    format: 'PDF',
    icon: Lightbulb,
    link: '#',
  },
]

// External links
const externalLinks = [
  {
    title: 'FIRST Global Official',
    description: 'Official FIRST Global website with rules and updates',
    url: 'https://first.global',
    icon: Globe,
  },
  {
    title: 'GitHub - Team Kenya',
    description: 'Our open-source code and projects',
    url: 'https://github.com/firstglobalkenya',
    icon: Github,
  },
  {
    title: 'YouTube Channel',
    description: 'Video tutorials and competition footage',
    url: 'https://youtube.com/@firstglobalkenya',
    icon: Youtube,
  },
  {
    title: 'Online Learning Platform',
    description: 'Interactive courses and certifications',
    url: '#',
    icon: GraduationCap,
  },
]

// Quick start guides
const quickStartGuides = [
  {
    title: 'Student Starter Pack',
    description: 'Everything you need to begin your robotics journey',
    icon: Sparkles,
    color: 'text-kenya-green',
    items: ['Basic robotics concepts', 'Programming fundamentals', 'Tool usage', 'Safety guidelines'],
  },
  {
    title: 'Teacher Resources',
    description: 'Materials for educators and mentors',
    icon: BookMarked,
    color: 'text-kenya-red',
    items: ['Lesson plans', 'Workshop materials', 'Assessment tools', 'Best practices'],
  },
  {
    title: 'Competition Prep',
    description: 'Get ready for FIRST Global Challenge',
    icon: Trophy,
    color: 'text-accent',
    items: ['Game analysis', 'Robot inspection', 'Team strategies', 'Judging criteria'],
  },
]

// Difficulty colors
const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  all: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
}

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter resources based on category and search
  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Get featured resources
  const featuredResources = resources.filter(r => r.featured)

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 african-pattern opacity-5" aria-hidden="true"></div>
        <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex items-center justify-center space-x-2 mb-6" aria-hidden="true">
              <div className="h-1 w-8 bg-kenya-black"></div>
              <div className="h-1 w-8 bg-kenya-red"></div>
              <div className="h-1 w-8 bg-kenya-green"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              Learning <span className="text-primary">Resources</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore our comprehensive collection of robotics, programming, and STEM educational materials
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Start Guides */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-center mb-8">Quick Start Guides</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {quickStartGuides.map((guide, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card hover:shadow-xl transition-shadow"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4`}>
                    <guide.icon className={`h-6 w-6 ${guide.color}`} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{guide.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                  <ul className="space-y-1">
                    {guide.items.map((item, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <ChevronRight className="h-4 w-4 text-muted-foreground mr-2" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-4 btn-secondary w-full text-sm">
                    Get Started
                    <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Resources Section */}
      <section className="py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Search and Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-grow relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    aria-label="Search resources"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    aria-label="Filter by category"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-white'
                        : 'bg-muted hover:bg-muted/70'
                    }`}
                    aria-pressed={selectedCategory === cat.id}
                  >
                    <cat.icon className="inline h-4 w-4 mr-2" aria-hidden="true" />
                    {cat.name}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Featured Resources */}
            {selectedCategory === 'all' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Star className="h-6 w-6 text-accent mr-2" aria-hidden="true" />
                  Featured Resources
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {featuredResources.map((resource, index) => (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="card hover:shadow-xl transition-all border-2 border-accent/20"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg">
                          <resource.icon className="h-6 w-6 text-accent" aria-hidden="true" />
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColors[resource.difficulty as keyof typeof difficultyColors]}`}>
                          {resource.difficulty}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-2">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                          {resource.duration}
                        </span>
                        <span>{resource.format}</span>
                      </div>
                      <a
                        href={resource.link}
                        className="btn-primary w-full text-sm inline-flex items-center justify-center"
                      >
                        Access Resource
                        <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                      </a>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Resources Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-6">
                {selectedCategory === 'all' ? 'All Resources' : categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              
              {filteredResources.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource, index) => (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      viewport={{ once: true }}
                      className="card hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                          <resource.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColors[resource.difficulty as keyof typeof difficultyColors]}`}>
                          {resource.difficulty}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                          {resource.duration}
                        </span>
                        <span>{resource.format}</span>
                      </div>
                      <a
                        href={resource.link}
                        className="btn-secondary w-full text-sm inline-flex items-center justify-center"
                      >
                        View Resource
                        <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
                      </a>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                  <p className="text-muted-foreground">No resources found matching your criteria.</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* External Links */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-3xl font-bold font-heading text-center mb-12">
              External <span className="text-primary">Resources</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {externalLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card flex items-start space-x-4 hover:shadow-xl transition-all group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg flex-shrink-0">
                    <link.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {link.title}
                      <ExternalLink className="inline h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    </h3>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center card bg-gradient-to-r from-kenya-green/10 to-kenya-red/10"
          >
            <Download className="h-12 w-12 text-primary mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Download Resource Pack
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Get our complete collection of beginner resources, templates, and guides in one convenient package
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary inline-flex items-center justify-center">
                <Download className="mr-2 h-5 w-5" aria-hidden="true" />
                Download Pack (25MB)
              </button>
              <Link href="/contact" className="btn-secondary inline-flex items-center justify-center">
                Request Access
                <ChevronRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contribute CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-2xl font-bold mb-4">
              Have Resources to Share?
            </h2>
            <p className="text-muted-foreground mb-6">
              Help grow our resource library by contributing tutorials, guides, or educational materials
            </p>
            <Link href="/contact" className="btn-primary">
              Contribute Resources
              <FileText className="ml-2 h-5 w-5" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}