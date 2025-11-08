'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Users, Target, Globe, Sparkles, Heart, Trophy, Calendar } from 'lucide-react'
import CountUp from '@/app/components/CountUp'
import ImageSlideshow from '@/app/components/ImageSlideshow'
import CountdownTimer from '@/app/components/CountdownTimer'
import MediaCarousel from '@/app/components/MediaCarousel'
import { getFeaturedStories } from '@/app/lib/media'

export default function HomePage() {
  const teamKenyaActionImages = [
    '/images/TeamKenyaAction/IMG_0504.jpg',
    '/images/TeamKenyaAction/IMG_20221028_192857_962.webp',
    '/images/TeamKenyaAction/PXL_20230617_130508851.jpg',
    '/images/TeamKenyaAction/PXL_20230826_124047312.jpg',
    '/images/TeamKenyaAction/WhatsApp Image 2025-06-20 at 18.57.00_9b9dbf6e.jpg'
  ]

  const featuredStories = getFeaturedStories(3)

  return (
    <>
      {/* Hero Section with Kenyan Flag Pattern */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero/PXL_20230812_161722174.jpg"
            alt="Team Kenya Hero"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 african-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-kenya-green/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-kenya-red/10 rounded-full blur-3xl"
          />
        </div>

        <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            {/* Kenya Flag Accent */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center space-x-2 mb-8"
            >
              <div className="h-1 w-12 bg-kenya-black"></div>
              <div className="h-1 w-12 bg-kenya-red"></div>
              <div className="h-1 w-12 bg-kenya-white border border-gray-200"></div>
              <div className="h-1 w-12 bg-kenya-green"></div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold font-heading mb-6"
            >
              <span className="text-kenya-black dark:text-white">Team</span>{' '}
              <span className="text-kenya-red">Kenya</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/90 mb-8 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]"
            >
              Inspiring the Future of STEM through Robotics
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link href="/join" className="btn-primary">
                Join Our Team
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/about" className="btn-secondary">
                Learn Our Story
                <Heart className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {[
                { label: 'Years Active', value: 9, suffix: '+', icon: Calendar },
                { label: 'Students Impacted', value: 500, suffix: '+', icon: Users },
                { label: 'Global Competitions', value: 9, icon: Globe },
                { label: 'Awards Won', value: 13, suffix: '+', icon: Trophy },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full mb-2">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white">
                    <CountUp end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-white/90">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="py-20 bg-muted/30 overflow-hidden">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
                Building Tomorrow's <span className="text-primary">Innovators</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Since 2017, FIRST Global Team Kenya has been at the forefront of inspiring young Kenyans to pursue careers in Science, Technology, Engineering, and Mathematics (STEM).
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Through hands-on robotics competitions, we're cultivating the next generation of problem-solvers, innovators, and leaders who will shape Kenya's technological future.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-start space-x-3">
                  <Sparkles className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Innovation</h3>
                    <p className="text-sm text-muted-foreground">Fostering creative problem-solving</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Target className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Excellence</h3>
                    <p className="text-sm text-muted-foreground">Pursuing the highest standards</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Teamwork</h3>
                    <p className="text-sm text-muted-foreground">Collaborating for success</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Global Impact</h3>
                    <p className="text-sm text-muted-foreground">Representing Kenya worldwide</p>
                  </div>
                </div>
              </div>
              <Link href="/about" className="btn-primary">
                Discover Our Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              <ImageSlideshow
                images={teamKenyaActionImages}
                interval={4000}
                showControls={true}
                className="shadow-2xl"
                aspectRatio="aspect-video"
                overlay={false}
              />
              {/* African Pattern Decoration */}
              <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 african-pattern rounded-lg opacity-20"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Competition Timeline */}
      <section className="py-20 relative overflow-hidden">
        {/* SVG Background */}
        <div 
          className="absolute inset-0 opacity-50 dark:opacity-20"
          style={{ 
            backgroundImage: "url('/images/SVG/TechBG.svg')",
            backgroundSize: '100%',
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center'
          }} 
        />
        <div className="absolute inset-0 bg-background/60 dark:bg-background/85" />
        
        <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Our Global <span className="text-primary">Journey</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From our debut in Washington D.C. to winning silver in Panama, Team Kenya continues to make its mark on the global stage.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line for large screens */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-kenya-green via-kenya-red to-kenya-black"></div>
            {/* Timeline Line for small screens */}
            <div className="lg:hidden absolute left-4 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-kenya-green via-kenya-red to-kenya-black"></div>

            {/* Timeline Items */}
            <div className="space-y-12">
              {[
                { year: '2017', location: 'Washington D.C., USA', city: 'Washington DC', flag: '🇺🇸', highlight: 'Our First Competition' },
                { year: '2018', location: 'Mexico City, Mexico', city: 'Mexico', flag: '🇲🇽', highlight: 'Cultural Exchange' },
                { year: '2019', location: 'Dubai, UAE', city: 'Dubai', flag: '🇦🇪', highlight: 'Middle East Debut' },
                { year: '2020-21', location: 'Virtual Competition', highlight: 'Adapting to COVID-19' },
                { year: '2022', location: 'Geneva, Switzerland', city: 'Geneva', flag: '🇨🇭', highlight: 'Return to In-Person' },
                { year: '2023', location: 'Singapore', city: 'Singapore', flag: '🇸🇬', highlight: 'Asian Excellence' },
                { year: '2024', location: 'Athens, Greece', city: 'Athens', flag: '🇬🇷', highlight: 'Mediterranean Success' },
                { year: '2025', location: 'Panama City, Panama', city: 'Panama', flag: '🇵🇦', highlight: 'Silver Medal - 1st Runners Up!' },
                // { year: '2026', location: 'TBA', highlight: 'Upcoming Challenge', upcoming: true, targetDate: new Date('2026-10-01') }, // Uncomment and update when next location is announced
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative lg:flex items-center ${index % 2 === 0 ? 'lg:justify-start' : 'lg:justify-end'}`}
                >
                  <div className={`w-full pl-12 lg:w-5/12 lg:pl-0 ${index % 2 === 0 ? 'lg:text-right lg:pr-8' : 'lg:text-left lg:pl-8'}`}>
                    <div 
                      className="relative inline-block p-6 rounded-lg bg-card border border-border shadow-lg overflow-hidden"
                    >
                      {/* Background layers for city and flag images */}
                      {item.city && (
                        <>
                          {/* City image background */}
                          <div 
                            className="absolute inset-0 opacity-40 dark:opacity-25"
                            style={{
                              backgroundImage: `url('/images/Cities/${item.city}.png')`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          />
                          {/* Flag overlay */}
                          <div 
                            className="absolute inset-0 opacity-30 dark:opacity-20"
                            style={{
                              backgroundImage: `url('/images/Flags/${item.city}.png')`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          />
                          {/* Gradient overlay for text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/50 to-background/85 dark:from-background/90 dark:via-background/70 dark:to-background/90" />
                        </>
                      )}
                      
                      <div className="relative z-10">
                        <div className="text-2xl font-bold text-primary mb-1">{item.year}</div>
                        <div className="font-semibold mb-1 flex items-center gap-2 justify-center">
                          {item.flag && <span className="text-2xl">{item.flag}</span>}
                          <span>{item.location}</span>
                        </div>
                        {/* Countdown Timer - Commented out until next competition location is announced */}
                        {/* {item.upcoming && item.targetDate ? (
                          <CountdownTimer targetDate={item.targetDate} label="Competition starts in" />
                        ) : ( */}
                          <div className="text-sm text-muted-foreground">{item.highlight}</div>
                        {/* )} */}
                      </div>
                    </div>
                  </div>
                  <div className="absolute left-4 lg:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Media Stories Carousel */}
      {featuredStories.length > 0 && (
        <section className="py-20 bg-muted/30 overflow-hidden">
          <div className="container px-4 sm:px-6 lg:px-8 max-w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                Latest <span className="text-primary">Stories</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover the latest updates, achievements, and inspiring stories from Team Kenya
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <MediaCarousel stories={featuredStories} autoPlayInterval={6000} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center mt-8"
            >
              <Link href="/media" className="btn-secondary">
                View All Stories
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-br from-kenya-green/10 to-kenya-red/10 overflow-hidden">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
              Be Part of Kenya's <span className="text-primary">STEM Revolution</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Whether you're a student eager to learn, or a supporter willing to invest in Kenya's future, there's a place for you in our mission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/join" className="btn-primary">
                Join as a Student
                <Users className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/support" className="btn-secondary">
                Support Our Mission
                <Heart className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}