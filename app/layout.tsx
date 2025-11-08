import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/app/components/ThemeProvider'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'FIRST Global Team Kenya - Inspiring the Future of STEM',
  description: 'Official website of FIRST Global Challenge Team Kenya. Join us in inspiring young Kenyans through robotics and STEM education.',
  keywords: 'FIRST Global, Team Kenya, Robotics, STEM, Education, Kenya, Technology, Innovation',
  authors: [{ name: 'FIRST Global Team Kenya' }],
  openGraph: {
    title: 'FIRST Global Team Kenya',
    description: 'Inspiring the Future of STEM through Robotics',
    url: 'https://fgckenya.com',
    siteName: 'FIRST Global Team Kenya',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FIRST Global Team Kenya',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FIRST Global Team Kenya',
    description: 'Inspiring the Future of STEM through Robotics',
    images: ['/images/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('RootLayout rendered');
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#006600" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col overflow-x-hidden">
            <Header />
            <main className="flex-grow overflow-x-hidden w-full">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}