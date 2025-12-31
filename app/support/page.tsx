'use client'

/**
 * @file page.tsx
 * @description Streamlined support page for donations and sponsorship for <i>FIRST</i> Global Team Kenya
 * @author Team Kenya Dev
 */

import type { Metadata } from 'next'
import { motion } from 'framer-motion'

import { 
  Heart, 
  Gift, 
  Users, 
  Building2,
  HandHeart,
  School,
  Briefcase,
  Target,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Shield,
  Globe,
  Rocket
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Where funds go
const fundAllocation = [
  { category: 'Robot & Equipment', percentage: 40, color: 'bg-kenya-green' },
  { category: 'Competition & Travel', percentage: 30, color: 'bg-kenya-red' },
  { category: 'Student Training', percentage: 20, color: 'bg-kenya-black' },
  { category: 'Community Outreach', percentage: 10, color: 'bg-primary' },
]

const currentSponsors = [
  { name: 'TME Education', tier: 'Education', logo: '/images/Logo/tmeeducation-logo.d6f6a1fb.png' },
]

/**
 * SupportPage component
 * Displays information on how to support the team (donations, sponsorship)
 * 
 * @returns {JSX.Element} The support page component
 */
export default function SupportPage() {
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
              Support Team <span className="text-primary">Kenya</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Your contribution empowers Kenya's brightest young minds to innovate and compete on a global stage.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Your Support Matters */}
      <section className="py-16 overflow-hidden">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Why Your Support <span className="text-primary">Matters</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              We are more than just a robotics team. We are a launchpad for future leaders in science, technology, engineering, and math. Your support provides students with invaluable hands-on experience, mentorship, and the opportunity to represent Kenya internationally. By investing in us, you invest in the technological future of our nation.
            </p>
          </div>
        </div>
      </section>

      {/* Ways to Support Us */}
      <section className="py-16 bg-muted/30 overflow-hidden" id="support">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Individual Donations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="card"
            >
              <HandHeart className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4">Individual Donations</h3>
              <p className="text-muted-foreground mb-6">
                Every contribution, big or small, makes a difference. Help us buy robot parts, fund travel, and run workshops.
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {['$25', '$50', '$100'].map(amount => (
                    <Link key={amount} href="https://www.mchanga.africa/fundraiser/98925" target="_blank" rel="noopener noreferrer">
                      <button className="btn-secondary w-full">{amount}</button>
                    </Link>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input type="text" placeholder="Custom Amount" className="w-full px-3 py-2 border border-border rounded-md bg-background" />
                  <Link href="https://www.mchanga.africa/fundraiser/98925" target="_blank" rel="noopener noreferrer">
                    <button className="btn-primary">Donate</button>
                  </Link>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  <Shield className="inline h-4 w-4 mr-1" />
                  Securely processed by our partners.
                </p>
              </div>
            </motion.div>

            {/* Corporate Sponsorship */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="card"
            >
              <Building2 className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4">Corporate Sponsorship</h3>
              <p className="text-muted-foreground mb-6">
                Partner with us to showcase your brand's commitment to innovation and youth empowerment. We offer various sponsorship levels with significant benefits.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-primary mr-2" />Brand visibility on team uniforms and robot.</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-primary mr-2" />Media coverage and social media campaigns.</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-primary mr-2" />Opportunities for employee engagement.</li>
              </ul>
              <Link href="/contact" className="btn-primary w-full">
                Become a Sponsor <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Your Impact Section */}
      <section className="py-16 overflow-hidden">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-12">
              Where Your <span className="text-primary">Contribution</span> Goes
            </h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-muted-foreground mb-6">
                  We are committed to transparency. Your donation directly fuels our team's journey and educational outreach.
                </p>
                <div className="space-y-4">
                  {fundAllocation.map((item) => (
                    <div key={item.category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className={`${item.color} h-2.5 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '500+', label: 'Students Trained', icon: Users },
                  { value: '50+', label: 'Schools Reached', icon: School },
                  { value: '8', label: 'Global Competitions', icon: Globe },
                  { value: '10+', label: 'Innovation Awards', icon: Rocket },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-4">
                    <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Partners */}
      <section className="py-16 bg-muted/30 overflow-hidden">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-8">
              Our <span className="text-primary">Partners</span>
            </h2>
            <div className="inline-flex items-center justify-center p-8 bg-background rounded-lg shadow">
              <Image 
                src="/images/Logo/tmeeducation-logo.d6f6a1fb.png"
                alt="TME Education Partner Logo"
                width={200}
                height={80}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
