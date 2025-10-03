/**
 * @file page.tsx
 * @description Support page for donations and sponsorship to <i>FIRST</i> Global Team Kenya
 * @author Team Kenya Dev
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Gift, 
  TrendingUp, 
  Users, 
  Award, 
  Building2,
  HandHeart,
  School,
  Briefcase,
  Target,
  CheckCircle,
  ArrowRight,
  DollarSign,
  CreditCard,
  Phone,
  Mail,
  Shield,
  Globe,
  Zap,
  Rocket
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Donation tiers
const donationTiers = [
  {
    name: 'Friend',
    amount: '$50',
    color: 'text-muted-foreground',
    benefits: [
      'Recognition on our website',
      'Thank you letter from team',
      'Updates on team progress',
    ],
  },
  {
    name: 'Supporter',
    amount: '$250',
    color: 'text-primary',
    benefits: [
      'All Friend benefits',
      'Team Kenya merchandise',
      'Invitation to local events',
      'Social media shoutout',
    ],
  },
  {
    name: 'Champion',
    amount: '$1,000',
    color: 'text-accent',
    benefits: [
      'All Supporter benefits',
      'Logo on team uniforms',
      'VIP event invitations',
      'Quarterly impact reports',
      'Recognition plaque',
    ],
  },
  {
    name: 'Partner',
    amount: '$5,000+',
    color: 'text-kenya-green',
    featured: true,
    benefits: [
      'All Champion benefits',
      'Prominent logo placement',
      'Speaking opportunities',
      'Custom partnership package',
      'Direct team mentorship',
    ],
  },
]

// Sponsorship packages
const sponsorshipPackages = [
  {
    icon: Rocket,
    title: 'Title Sponsor',
    investment: '$50,000+',
    benefits: [
      'Primary brand visibility',
      'Naming rights',
      'Media coverage',
      'Year-round partnership',
    ],
  },
  {
    icon: Award,
    title: 'Competition Sponsor',
    investment: '$25,000',
    benefits: [
      'Competition presence',
      'Team travel support',
      'Event branding',
      'Social media campaign',
    ],
  },
  {
    icon: School,
    title: 'Education Partner',
    investment: '$10,000',
    benefits: [
      'Workshop sponsorship',
      'Training program support',
      'Student mentorship',
      'Community outreach',
    ],
  },
  {
    icon: Building2,
    title: 'Equipment Sponsor',
    investment: 'In-Kind',
    benefits: [
      'Provide robotics kits',
      'Technical resources',
      'Software licenses',
      'Tools and materials',
    ],
  },
]

// Impact statistics
const impactStats = [
  { value: '500+', label: 'Students Trained', icon: Users },
  { value: '50+', label: 'Schools Reached', icon: School },
  { value: '8', label: 'Global Competitions', icon: Globe },
  { value: '20+', label: 'STEM Workshops', icon: Briefcase },
]

// Where funds go
const fundAllocation = [
  { category: 'Robot & Equipment', percentage: 35, color: 'bg-kenya-green' },
  { category: 'Travel & Accommodation', percentage: 30, color: 'bg-kenya-red' },
  { category: 'Training & Workshops', percentage: 20, color: 'bg-kenya-black' },
  { category: 'Outreach Programs', percentage: 10, color: 'bg-accent' },
  { category: 'Operations', percentage: 5, color: 'bg-primary' },
]

// Current sponsors (placeholder)
const currentSponsors = [
  { name: 'Partner 1', tier: 'Title' },
  { name: 'Partner 2', tier: 'Competition' },
  { name: 'Partner 3', tier: 'Education' },
  { name: 'Partner 4', tier: 'Equipment' },
]

export default function SupportPage() {
  const [selectedAmount, setSelectedAmount] = useState<string>('')
  const [customAmount, setCustomAmount] = useState<string>('')
  const [donationType, setDonationType] = useState<'once' | 'monthly'>('once')

  /**
   * Handle donation amount selection
   * @param amount - Selected donation amount
   */
  const handleAmountSelect = (amount: string) => {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  /**
   * Handle custom amount input
   * @param value - Custom amount value
   */
  const handleCustomAmount = (value: string) => {
    // Sanitize input - only allow numbers
    const sanitized = value.replace(/[^\d.]/g, '')
    setCustomAmount(sanitized)
    if (sanitized) {
      setSelectedAmount('custom')
    }
  }

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
              Your contribution helps us inspire the next generation of Kenyan innovators 
              and compete on the global stage.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Your Impact <span className="text-primary">Matters</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Together, we're building Kenya's STEM future
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {impactStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                  <stat.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Make a Donation */}
      <section className="py-16" id="donate">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-12">
              Make a <span className="text-primary">Donation</span>
            </h2>

            {/* Donation Type Toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-lg bg-muted p-1">
                <button
                  onClick={() => setDonationType('once')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    donationType === 'once'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground'
                  }`}
                  aria-pressed={donationType === 'once'}
                >
                  One-time
                </button>
                <button
                  onClick={() => setDonationType('monthly')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    donationType === 'monthly'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground'
                  }`}
                  aria-pressed={donationType === 'monthly'}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Donation Tiers */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {donationTiers.map((tier, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`card hover:shadow-xl transition-all ${
                    tier.featured ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {tier.featured && (
                    <div className="bg-primary text-white text-xs font-bold py-1 px-3 rounded-full mb-4 inline-block">
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className={`text-xl font-bold mb-2 ${tier.color}`}>
                    {tier.name}
                  </h3>
                  <div className="text-3xl font-bold mb-4">
                    {tier.amount}
                    {donationType === 'monthly' && <span className="text-sm text-muted-foreground">/mo</span>}
                  </div>
                  <ul className="space-y-2 mb-6">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleAmountSelect(tier.amount.replace('$', '').replace('+', ''))}
                    className={`w-full btn-${tier.featured ? 'primary' : 'secondary'} text-sm`}
                    aria-label={`Select ${tier.name} tier - ${tier.amount} ${donationType === 'monthly' ? 'per month' : ''}`}
                  >
                    Select
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="max-w-2xl mx-auto">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Custom Amount</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-grow relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    <input
                      type="text"
                      value={customAmount}
                      onChange={(e) => handleCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                      aria-label="Enter custom donation amount"
                    />
                  </div>
                  <button
                    disabled={!selectedAmount && !customAmount}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Proceed to donate"
                  >
                    Donate Now
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  <Shield className="inline h-4 w-4 mr-1" aria-hidden="true" />
                  Secure payment processed through our trusted partners
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Where Your Money Goes */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-12">
              Where Your Money <span className="text-primary">Goes</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Allocation Chart */}
              <div className="space-y-4">
                {fundAllocation.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className={`${item.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                        role="progressbar"
                        aria-valuenow={item.percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Description */}
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Every donation directly supports our mission to inspire and educate 
                  Kenya's youth in STEM fields. We maintain transparency in all our 
                  operations and provide regular updates on fund utilization.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <Zap className="h-5 w-5 text-primary mr-3 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Equipment & Technology</p>
                      <p className="text-sm text-muted-foreground">
                        Robot parts, tools, software, and training materials
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Globe className="h-5 w-5 text-primary mr-3 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Competition Participation</p>
                      <p className="text-sm text-muted-foreground">
                        Travel, accommodation, and competition fees
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <HandHeart className="h-5 w-5 text-primary mr-3 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Community Impact</p>
                      <p className="text-sm text-muted-foreground">
                        Free workshops, school visits, and mentorship programs
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Corporate Sponsorship */}
      <section className="py-16" id="sponsorship">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-4">
              Corporate <span className="text-primary">Sponsorship</span>
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Partner with us to invest in Kenya's future while gaining valuable 
              brand visibility and community impact
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {sponsorshipPackages.map((pkg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card text-center hover:shadow-xl transition-shadow"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <pkg.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{pkg.title}</h3>
                  <p className="text-2xl font-bold text-primary mb-4">{pkg.investment}</p>
                  <ul className="space-y-2 text-sm text-left">
                    {pkg.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Current Sponsors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center card"
            >
              <h3 className="text-xl font-bold mb-6">Our Current Partners</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {currentSponsors.map((sponsor, index) => (
                  <div
                    key={index}
                    className="p-4 bg-muted rounded-lg"
                  >
                    <p className="text-sm text-muted-foreground">{sponsor.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{sponsor.tier} Sponsor</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Other Ways to Help */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-12">
              Other Ways to <span className="text-primary">Help</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="card text-center"
              >
                <HandHeart className="h-12 w-12 text-primary mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-lg font-bold mb-2">Volunteer</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your expertise as a mentor or help at events
                </p>
                <Link href="/join#volunteer" className="btn-secondary text-sm">
                  Learn More
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="card text-center"
              >
                <Gift className="h-12 w-12 text-primary mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-lg font-bold mb-2">In-Kind Donations</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Donate equipment, software licenses, or services
                </p>
                <Link href="/contact" className="btn-secondary text-sm">
                  Contact Us
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="card text-center"
              >
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-lg font-bold mb-2">Spread the Word</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Follow us and share our story on social media
                </p>
                <button className="btn-secondary text-sm">
                  Follow Us
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center card bg-gradient-to-r from-kenya-green/10 to-kenya-red/10"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Have Questions?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              We'd love to discuss how you can support Team Kenya's mission
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@firstglobalkenya.org"
                className="btn-secondary inline-flex items-center justify-center"
              >
                <Mail className="mr-2 h-5 w-5" aria-hidden="true" />
                Email Us
              </a>
              <a
                href="tel:+254700000000"
                className="btn-primary inline-flex items-center justify-center"
              >
                <Phone className="mr-2 h-5 w-5" aria-hidden="true" />
                Call Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}