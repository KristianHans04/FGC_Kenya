'use client'

import { motion } from 'framer-motion'
import { Quote, GraduationCap, Briefcase, Rocket, Heart, Star, Users } from 'lucide-react'
import CountUp from '@/app/components/CountUp'


/**
 * ImpactPage component
 * Displays impact stories and statistics about the team's outreach and educational efforts
 * Features alumni success stories, impact metrics, and community engagement highlights
 *
 * @returns {JSX.Element} The impact page component
 */
export default function ImpactPage() {
  const impactMetrics = [
    {
      icon: Users,
      value: 500,
      suffix: '+',
      label: 'Students Reached',
      description: 'Through our outreach programs and workshops'
    },
    {
      icon: GraduationCap,
      value: 50,
      suffix: '+',
      label: 'Schools Partnered',
      description: 'Across Kenya bringing STEM education'
    },
    {
      icon: Briefcase,
      value: 25,
      suffix: '+',
      label: 'Successful Alumni',
      description: 'Pursuing STEM careers worldwide'
    },
    {
      icon: Heart,
      value: 10,
      suffix: '+',
      label: 'Years of Impact',
      description: 'Transforming lives through robotics'
    }
  ]

  const impactStories = [
    {
      id: '1',
      name: 'Sarah Wanjiku',
      role: 'Software Engineer at Google',
      year: '2018 Alumni',
      story: 'FIRST Global Team Kenya gave me the confidence to pursue computer science. The robotics challenges taught me problem-solving skills that I use every day in my career.',
      impact: 'Leading AI initiatives at Google',
      image: '/images/team/member1.jpg'
    },
    {
      id: '2',
      name: 'David Kiprop',
      role: 'Robotics Engineer at Boston Dynamics',
      year: '2019 Alumni',
      story: 'The hands-on experience with robotics and the mentorship I received shaped my path to becoming an engineer. I\'m grateful for the opportunities Team Kenya provided.',
      impact: 'Developing advanced robotics systems',
      image: '/images/team/member2.jpg'
    },
    {
      id: '3',
      name: 'Grace Achieng',
      role: 'STEM Teacher & FIRST Coach',
      year: '2020 Alumni',
      story: 'Team Kenya inspired me to give back to the community. Now I coach the next generation of innovators and watch them discover their potential in STEM.',
      impact: 'Mentoring 200+ students annually',
      image: '/images/team/member3.jpg'
    }
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-50 dark:opacity-20"
          style={{ 
            backgroundImage: 'url(/images/SVG/FlagRibbon.svg)',
            backgroundSize: '100%',
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center'
          }}
        ></div>
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
              Our <span className="text-primary">Impact</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Transforming lives through robotics and STEM education, one student at a time
            </p>
          </motion.div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="py-16 bg-muted/30 overflow-hidden">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {impactMetrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <metric.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-4xl font-bold text-primary mb-2">
                  <CountUp end={metric.value} suffix={metric.suffix} />
                </div>
                <h3 className="font-semibold mb-2">{metric.label}</h3>
                <p className="text-sm text-muted-foreground">{metric.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 overflow-hidden">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Success <span className="text-primary">Stories</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real stories from students whose lives were transformed by Team Kenya
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {impactStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Quote className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{story.name}</h3>
                    <p className="text-sm text-muted-foreground">{story.role}</p>
                    <p className="text-xs text-primary">{story.year}</p>
                  </div>
                </div>
                
                <blockquote className="italic text-muted-foreground mb-4">
                  "{story.story}"
                </blockquote>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-sm font-semibold text-primary">{story.impact}</span>
                  <Star className="h-5 w-5 text-accent" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Outreach Programs - Commented out for now */}
      {/* <section className="py-16 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Outreach <span className="text-primary">Programs</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Extending our impact beyond competition to reach more Kenyan youth
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {outreachPrograms.map((program, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card flex items-start space-x-4"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <program.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{program.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{program.description}</p>
                  <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                    {program.beneficiaries}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Call to Action */}
      <section className="py-16 overflow-hidden">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center card bg-gradient-to-br from-primary/10 to-secondary/10"
          >
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">
              Be Part of the <span className="text-primary">Impact</span>
            </h2>
            <p className="text-muted-foreground mb-6">
              Your support helps us reach more students and create lasting change in Kenya's STEM landscape
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/support" className="btn-primary">
                Support Our Mission
              </a>
              <a href="/join" className="btn-secondary">
                Join as a Student
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}