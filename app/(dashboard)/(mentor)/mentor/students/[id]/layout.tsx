import type { Metadata } from 'next'
import { generateMetadata as generatePageMetadata } from '@/app/lib/utils/metadata'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: 'Student Details - Mentor Dashboard',
    description: 'View detailed information about your student',
    noIndex: true,
  })
}

export default function StudentDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}