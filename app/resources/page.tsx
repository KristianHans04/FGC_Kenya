/**
 * @file page.tsx
 * @description Resources page for FIRST Global Team Kenya with learning materials and links
 * @author Team Kenya Dev
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Code, Cpu, Wrench, Users, Globe, Download, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function ResourcesPage() {
  useEffect(() => {
    document.title = 'Resources | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Educational resources and learning materials for FIRST Global participants')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Educational resources and learning materials for FIRST Global participants'
      document.head.appendChild(meta)
    }
  }, [])


  const [selectedCategory, setSelectedCategory] = useState('all')

  const resources = [
    {
      id: 1,
      title: 'Introduction to Robotics',
      description: 'Learn the basics of robotics, from mechanical design to programming fundamentals.',
      category: 'beginner',
      type: 'guide',
      difficulty: 'Beginner',
      duration: '2 hours',
      icon: Cpu,
    },
    {
      id: 2,
      title: 'FIRST Global Game Manual',
      description: 'Complete rules and specifications for the FIRST Global Challenge competition.',
      category: 'competition',
      type: 'document',
      difficulty: 'All Levels',
      duration: 'Reference',
      icon: BookOpen,
    },
    {
      id: 3,
      title: 'Arduino Programming Basics',
      description: 'Get started with microcontroller programming using Arduino.',
      category: 'programming',
      type: 'tutorial',
      difficulty: 'Intermediate',
      duration: '4 hours',
      icon: Code,
    },
    {
      id: 4,
      title: 'Mechanical Design Principles',
      description: 'Learn about gears, levers, and structural design for robot building.',
      category: 'mechanical',
      type: 'guide',
      difficulty: 'Intermediate',
      duration: '3 hours',
      icon: Wrench,
    },
    {
      id: 5,
      title: 'Team Kenya Past Projects',
      description: 'Explore our previous robot designs and competition strategies.',
      category: 'competition',
      type: 'case-study',
      difficulty: 'All Levels',
      duration: '1 hour',
      icon: Users,
    },
  ]

  const categories = [
    { id: 'all', name: 'All Resources', icon: BookOpen },
    { id: 'beginner', name: 'Beginner', icon: Globe },
    { id: 'programming', name: 'Programming', icon: Code },
    { id: 'mechanical', name: 'Mechanical', icon: Wrench },
    { id: 'competition', name: 'Competition', icon: Users },
  ]

  const filteredResources = selectedCategory === 'all'
    ? resources
    : resources.filter(r => r.category === selectedCategory)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-heading">Learning Resources</h1>
                <p className="text-muted-foreground">Educational materials and guides for robotics and STEM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-4 mb-8">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary'
                }`}
              >
                <Icon className="h-4 w-4" />
                {category.name}
              </button>
            )
          })}
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => {
            const Icon = resource.icon
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{resource.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                        {resource.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-full">
                        {resource.duration}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded-full capitalize">
                        {resource.type}
                      </span>
                    </div>

                    <button className="w-full btn-secondary flex items-center justify-center gap-2">
                      <Download className="h-4 w-4" />
                      Access Resource
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* External Resources */}
        <div className="card mt-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            External Resources & Links
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-medium mb-2">FIRST Global Official</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Official FIRST Global website with rules, resources, and competition information.
              </p>
              <a
                href="https://first.global"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-medium flex items-center gap-1"
              >
                Visit Website <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-medium mb-2">FIRST Robotics Resources</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Comprehensive learning materials, tutorials, and documentation for robotics education.
              </p>
              <a
                href="https://www.firstinspires.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-medium flex items-center gap-1"
              >
                Visit FIRST <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="card max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Ready to Join Team Kenya?</h2>
            <p className="text-muted-foreground mb-6">
              Apply now to become part of Kenya's premier robotics team and compete in the FIRST Global Challenge.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/join" className="btn-primary">
                Apply Now
              </Link>
              <Link href="/about" className="btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
