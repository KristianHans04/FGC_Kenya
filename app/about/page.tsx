'use client'

import { motion } from 'framer-motion'
import { Trophy, Award, Users, Target, Globe, Calendar, MapPin, Star } from 'lucide-react'
import Image from 'next/image'

const timeline = [
  {
    year: '2017',
    location: 'Washington D.C., USA',
    theme: 'H2O Flow',
    achievement: 'Inaugural participation, representing Kenya on the global stage',
    highlights: ['First Kenyan team', 'International exposure', 'Cultural exchange'],
  },
  {
    year: '2018',
    location: 'Mexico City, Mexico',
    theme: 'Energy Impact',
    achievement: 'Strengthened international partnerships',
    highlights: ['Improved ranking', 'Technical innovation', 'Team collaboration'],
  },
  {
    year: '2019',
    location: 'Dubai, UAE',
    theme: 'Ocean Opportunities',
    achievement: 'Excellence in Engineering Documentation Award',
    highlights: ['Award recognition', 'Middle East debut', 'Technical excellence'],
  },
  {
    year: '2020',
    location: 'Virtual Competition',
    theme: 'CONNECTING COMMUNITIES',
    achievement: 'Adapted to virtual format during COVID-19',
    highlights: ['Remote collaboration', 'Digital innovation', 'Resilience'],
  },
  {
    year: '2021',
    location: 'Virtual Competition',
    theme: 'DISCOVER & RECOVER',
    achievement: 'Continued excellence in virtual format',
    highlights: ['Improved virtual strategies', 'Community outreach', 'STEM advocacy'],
  },
  {
    year: '2022',
    location: 'Geneva, Switzerland',
    theme: 'Carbon Capture',
    achievement: 'Return to in-person competition',
    highlights: ['Strong comeback', 'Environmental focus', 'Global networking'],
  },
  {
    year: '2023',
    location: 'Singapore',
    theme: 'Hydrogen Horizons',
    achievement: 'Top African team performance',
    highlights: ['Regional excellence', 'Innovation award', 'Future energy solutions'],
  },
  {
    year: '2024',
    location: 'Athens, Greece',
    theme: 'Feeding the Future',
    achievement: 'Outstanding performance in agricultural robotics',
    highlights: ['Sustainability focus', 'Cross-cultural collaboration', 'Technical advancement'],
  },
  {
    year: '2025',
    location: 'Panama City, Panama',
    theme: 'Eco Equilibrium',
    achievement: 'Upcoming competition focused on environmental balance',
    highlights: ['Environmental solutions', 'Ecosystem protection', 'Sustainable innovation'],
  },
]

const milestones = [
  { number: '500+', label: 'Students Trained' },
  { number: '50+', label: 'Mentors & Volunteers' },
  { number: '8', label: 'Global Competitions' },
  { number: '12+', label: 'Awards & Recognitions' },
  { number: '20+', label: 'Partner Organizations' },
  { number: '100+', label: 'Outreach Programs' },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
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
              Our <span className="text-primary">Story</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Since 2017, <i>FIRST</i> Global Team Kenya has been inspiring young innovators, fostering STEM education, 
              and proudly representing Kenya in international robotics competitions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="card"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Target className="h-6 w-6 text-primary mr-3" />
                Our Mission
              </h2>
              <p className="text-muted-foreground mb-4">
                To inspire and empower Kenyan youth through hands-on STEM education and robotics, 
                developing critical thinking, innovation, and leadership skills that will drive 
                Kenya's technological advancement and economic growth.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-semibold">We achieve this through:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Excellence:</strong> Striving for the highest standards in everything we do</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Innovation:</strong> Pushing boundaries and thinking creatively</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="card"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Star className="h-6 w-6 text-primary mr-3" />
                Our Vision
              </h2>
              <p className="text-muted-foreground mb-4">
                To see Kenya become a leading force in technology and innovation in Africa, 
                with our students at the forefront of solving global challenges through 
                science, technology, engineering, and mathematics.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-semibold">Built on the foundation of:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Collaboration:</strong> Working together to achieve common goals</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span><strong>Global Mindset:</strong> Representing Kenya with pride on the world stage</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Competition Timeline */}
      <section className="py-16" id="fgc">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Competition <span className="text-primary">Journey</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Eight years of representing Kenya at the <i>FIRST</i> Global Challenge
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            {timeline.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative mb-8 last:mb-0"
              >
                <div className="flex items-start gap-6">
                  {/* Year Badge */}
                  <div className="flex-shrink-0 w-24 text-right">
                    <div className="inline-flex items-center justify-center px-3 py-1 bg-primary text-white rounded-full text-sm font-bold">
                      {event.year}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="flex-grow card hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold mb-1 flex items-center">
                          <MapPin className="h-5 w-5 text-primary mr-2" />
                          {event.location}
                        </h3>
                        <p className="text-sm text-muted-foreground">Theme: {event.theme}</p>
                      </div>
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="mb-3">{event.achievement}</p>
                    <div className="flex flex-wrap gap-2">
                      {event.highlights.map((highlight, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Connecting Line */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-[60px] top-10 bottom-0 w-0.5 bg-gradient-to-b from-primary to-transparent"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements & Milestones */}
      <section className="py-16" id="achievements">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Impact & <span className="text-primary">Achievements</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our journey is marked by continuous growth and meaningful impact
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-lg bg-card border border-border"
              >
                <div className="text-3xl font-bold text-primary mb-2">{milestone.number}</div>
                <div className="text-sm text-muted-foreground">{milestone.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Awards Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center p-6 bg-accent/10 rounded-lg w-full">
                <Award className="h-12 w-12 text-accent mr-4" />
                <div className="text-left">
                  <p className="text-2xl font-bold">Notable Achievements</p>
                  <p className="text-muted-foreground">2019: Outstanding Mentor - Lumona Mulengwa</p>
                  <p className="text-muted-foreground">2022: International Enthusiasm Award</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Partners Section (Placeholder) */}
      <section className="py-16" id="partners">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Our <span className="text-primary">Partners</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Together with our partners, we're building a brighter future for Kenya's youth
            </p>
            <div className="inline-flex items-center justify-center p-8 bg-muted rounded-lg">
              <Image 
                src="/images/Logo/tmeeducation-logo.d6f6a1fb.png"
                alt="TME Education Partner Logo"
                width={200}
                height={80}
                className="object-contain"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}