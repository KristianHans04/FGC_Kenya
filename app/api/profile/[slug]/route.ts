import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { getCurrentUser } from '@/app/lib/auth'
import { z } from 'zod'

const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().transform(str => new Date(str)).optional().nullable(),
  gender: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  school: z.string().optional().nullable(),
  grade: z.string().optional().nullable(),
  county: z.string().optional().nullable(),
  homeAddress: z.string().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.user.findUnique({
      where: { slug: slug },
      select: {
        id: true,
        slug: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        school: true,
        grade: true,
        county: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
        createdAt: true,
        lastLoginAt: true,
        // Include role-specific data
        _count: {
          select: {
            applications: true,
            createdEvents: true,
            createdTasks: true,
            uploadedResources: true
          }
        },
        // Recent activity
        createdEvents: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            type: true,
            startDate: true,
            createdAt: true
          }
        },
        createdTasks: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true
          }
        },
        uploadedResources: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            category: true,
            createdAt: true
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Determine what data to show based on viewer's role and relationship
    const isOwnProfile = profile.id === user.id
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role)

    // Filter sensitive data if not own profile or admin
    if (!isOwnProfile && !isAdmin) {
      // Remove sensitive fields
      delete (profile as any).phone
      delete (profile as any).lastLoginAt
      
      // Only show public social links
      if (!profile.linkedinUrl) delete (profile as any).linkedinUrl
      if (!profile.githubUrl) delete (profile as any).githubUrl
      if (!profile.portfolioUrl) delete (profile as any).portfolioUrl
    }

    return NextResponse.json({
      success: true,
      data: profile,
      permissions: {
        canEdit: isOwnProfile,
        canViewPrivate: isOwnProfile || isAdmin,
        canDelete: isAdmin && !isOwnProfile
      }
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Users can only update their own profile
    const profile = await prisma.user.findUnique({
      where: { slug: slug },
      select: { id: true }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Only allow users to update their own profile
    if (profile.id !== user.id && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = UpdateProfileSchema.parse(body)

    const updatedProfile = await prisma.user.update({
      where: { slug: slug },
      data: validatedData as any,
      select: {
        id: true,
        slug: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        nationality: true,
        school: true,
        grade: true,
        county: true,
        homeAddress: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
        role: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedProfile
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}