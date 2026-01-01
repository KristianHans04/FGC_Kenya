'use client'

import { useEffect } from 'react'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FileText, Scale, AlertTriangle, UserCheck, Code, Mail } from 'lucide-react'

/**
 * TermsOfServicePage component
 * Displays the terms of service agreement
 * 
 * @returns {JSX.Element} The terms of service page component
 */
export default function TermsOfServicePage() {
  useEffect(() => {
    document.title = 'Terms of Service | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Terms and conditions for using FIRST Global Team Kenya platform')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Terms and conditions for using FIRST Global Team Kenya platform'
      document.head.appendChild(meta)
    }
  }, [])


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
            <FileText className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              Terms of <span className="text-primary">Service</span>
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
                <Scale className="h-6 w-6 text-primary" />
                Agreement to Terms
              </h2>
              <p className="text-muted-foreground mb-6">
                By accessing and using the <i>FIRST</i> Global Team Kenya website ("Website"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Website.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">About <i>FIRST</i> Global Team Kenya</h2>
              <p className="text-muted-foreground mb-6">
                <i>FIRST</i> Global Team Kenya is Kenya's national team participating in the annual <i>FIRST</i> Global Challenge, an international robotics olympiad. We are dedicated to promoting STEM education and inspiring innovation among Kenyan youth.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8 flex items-center gap-3">
                <UserCheck className="h-6 w-6 text-primary" />
                Use of Website
              </h2>
              <h3 className="text-xl font-semibold mb-3">Permitted Use</h3>
              <p className="text-muted-foreground mb-4">
                You may use our Website for lawful purposes only. You agree not to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit any harmful code, viruses, or malware</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use automated systems to scrape or collect data</li>
                <li>Impersonate any person or entity</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">User Accounts</h3>
              <p className="text-muted-foreground mb-6">
                When creating an account, you must provide accurate information and maintain the security of your account credentials. You are responsible for all activities that occur under your account.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8 flex items-center gap-3">
                <Code className="h-6 w-6 text-primary" />
                Intellectual Property
              </h2>
              <p className="text-muted-foreground mb-6">
                The Website and its original content, features, and functionality are owned by <i>FIRST</i> Global Team Kenya and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-muted-foreground mb-6">
                <i>FIRST</i> Global® and related logos are trademarks of <i>FIRST</i> Global, Inc. Used with permission.
              </p>
              <p className="text-muted-foreground mb-6">
                You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any part of the Website without our prior written permission.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">User Content</h2>
              <p className="text-muted-foreground mb-6">
                If you submit content to our Website (comments, photos, videos, etc.), you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display that content for promotional and educational purposes. You retain all ownership rights to your content.
              </p>
              <p className="text-muted-foreground mb-6">
                You represent and warrant that you own or have the necessary rights to all content you submit and that such content does not violate any third-party rights.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">Program Participation</h2>
              <h3 className="text-xl font-semibold mb-3">Eligibility</h3>
              <p className="text-muted-foreground mb-6">
                Students aged 14-18 are eligible to apply for Team Kenya programs. Parental or guardian consent is required for all minors.
              </p>

              <h3 className="text-xl font-semibold mb-3">Code of Conduct</h3>
              <p className="text-muted-foreground mb-4">
                All participants must adhere to our Code of Conduct, which includes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                <li>Respect for all team members, mentors, and competitors</li>
                <li>Gracious professionalism and cooperation</li>
                <li>Ethical behavior and integrity in all activities</li>
                <li>Compliance with <i>FIRST</i> Global Challenge rules</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">Donations and Payments</h2>
              <p className="text-muted-foreground mb-6">
                All donations are voluntary and non-refundable unless otherwise required by law. We use secure payment processors to handle transactions. Please refer to our Privacy Policy for information on how payment data is handled.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-primary" />
                Disclaimers and Limitations
              </h2>
              <h3 className="text-xl font-semibold mb-3">Website "As Is"</h3>
              <p className="text-muted-foreground mb-6">
                The Website is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, regarding the Website's operation or the information, content, or materials included on the Website.
              </p>

              <h3 className="text-xl font-semibold mb-3">Limitation of Liability</h3>
              <p className="text-muted-foreground mb-6">
                To the fullest extent permitted by law, <i>FIRST</i> Global Team Kenya shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Website.
              </p>

              <h3 className="text-xl font-semibold mb-3">External Links</h3>
              <p className="text-muted-foreground mb-6">
                Our Website may contain links to third-party websites. We are not responsible for the content, privacy policies, or practices of these external sites.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">Indemnification</h2>
              <p className="text-muted-foreground mb-6">
                You agree to indemnify and hold harmless <i>FIRST</i> Global Team Kenya, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Website or violation of these Terms.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">Governing Law</h2>
              <p className="text-muted-foreground mb-6">
                These Terms shall be governed by and construed in accordance with the laws of the Republic of Kenya, without regard to its conflict of law provisions.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">Changes to Terms</h2>
              <p className="text-muted-foreground mb-6">
                We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes by posting the new Terms on this page and updating the "Last updated" date.
              </p>
              <p className="text-muted-foreground mb-6">
                Your continued use of the Website after any changes constitutes acceptance of the new Terms.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">Severability</h2>
              <p className="text-muted-foreground mb-6">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8 flex items-center gap-3">
                <Mail className="h-6 w-6 text-primary" />
                Contact Information
              </h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms of Service, please contact us:
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
