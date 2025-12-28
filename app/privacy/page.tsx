'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, Eye, Lock, Database, UserCheck, Mail } from 'lucide-react'

/**
 * PrivacyPolicyPage component
 * Displays the privacy policy information
 * 
 * @returns {JSX.Element} The privacy policy page component
 */
export default function PrivacyPolicyPage() {
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
            <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              Privacy <span className="text-primary">Policy</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto prose dark:prose-invert">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Eye className="h-6 w-6 text-primary" />
                Introduction
              </h2>
              <p className="text-muted-foreground mb-6">
                <i>FIRST</i> Global Team Kenya ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or interact with our programs.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8 flex items-center gap-3">
                <Database className="h-6 w-6 text-primary" />
                Information We Collect
              </h2>
              <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
              <p className="text-muted-foreground mb-4">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                <li>Register for our programs or events</li>
                <li>Fill out contact or application forms</li>
                <li>Subscribe to our newsletter</li>
                <li>Communicate with us via email or social media</li>
                <li>Make donations or payments</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                This may include: name, email address, phone number, school information, age, parent/guardian contact details, and any other information you choose to provide.
              </p>

              <h3 className="text-xl font-semibold mb-3">Automatically Collected Information</h3>
              <p className="text-muted-foreground mb-6">
                When you visit our website, we may automatically collect certain information about your device, including browser type, IP address, time zone, and some cookies. We may also collect information about your interactions with our website.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8 flex items-center gap-3">
                <Lock className="h-6 w-6 text-primary" />
                How We Use Your Information
              </h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                <li>Process applications and registrations for our programs</li>
                <li>Communicate with you about events, updates, and opportunities</li>
                <li>Send newsletters and promotional materials (with your consent)</li>
                <li>Process donations and maintain donor records</li>
                <li>Improve our website and user experience</li>
                <li>Comply with legal obligations</li>
                <li>Protect against fraud and unauthorized access</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8 flex items-center gap-3">
                <UserCheck className="h-6 w-6 text-primary" />
                Information Sharing and Disclosure
              </h2>
              <p className="text-muted-foreground mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                <li><strong>With your consent:</strong> When you explicitly authorize us to share information</li>
                <li><strong>Service providers:</strong> With trusted partners who assist us in operating our website and programs (e.g., payment processors, email services)</li>
                <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>FIRST Global:</strong> With <i>FIRST</i> Global Challenge organizers for official competition purposes</li>
                <li><strong>Partners and sponsors:</strong> Aggregated, non-personally identifiable information for reporting purposes</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">Data Security</h2>
              <p className="text-muted-foreground mb-6">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">Children's Privacy</h2>
              <p className="text-muted-foreground mb-6">
                Many of our participants are minors (under 18 years of age). We require parental or guardian consent before collecting personal information from minors. Parents/guardians have the right to review, modify, or delete their child's personal information at any time.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">Your Rights</h2>
              <p className="text-muted-foreground mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">Cookies</h2>
              <p className="text-muted-foreground mb-6">
                We use cookies and similar tracking technologies to enhance your experience on our website. You can control cookies through your browser settings, though disabling cookies may affect website functionality.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">Changes to This Policy</h2>
              <p className="text-muted-foreground mb-6">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8 flex items-center gap-3">
                <Mail className="h-6 w-6 text-primary" />
                Contact Us
              </h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="card p-6 bg-muted/30">
                <p className="text-muted-foreground mb-2">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:teamkenyarobotics254@gmail.com" className="text-primary hover:underline">
                    teamkenyarobotics254@gmail.com
                  </a>
                </p>
                <p className="text-muted-foreground">
                  <strong>Address:</strong> Off James Gichuru Road, Nairobi, Kenya
                </p>
              </div>

              <div className="mt-12 text-center">
                <Link href="/contact" className="btn-primary">
                  Contact Us
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
