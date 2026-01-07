import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is a mentor by looking at their cohort membership
    const mentorCheck = await prisma.cohortMember.findFirst({
      where: {
        userId: authResult.user.id,
        role: 'MENTOR',
        isActive: true
      }
    })
    
    if (!mentorCheck) {
      return NextResponse.json({ error: 'Unauthorized - Mentor access required' }, { status: 403 })
    }

    const user = authResult.user

    // Get active cohort for mentor
    const cohortMembership = await prisma.cohortMember.findFirst({
      where: {
        userId: user.id,
        role: 'MENTOR',
        isActive: true,
        OR: [
          { leftAt: null },
          { leftAt: { gt: new Date() } }
        ]
      },
      orderBy: {
        joinedAt: 'desc'
      }
    })

    if (!cohortMembership) {
      return NextResponse.json(
        { error: 'No active mentor cohort found' },
        { status: 404 }
      )
    }

    // Check mentor permissions
    const permissions = await prisma.mentorPermission.findUnique({
      where: {
        mentorId_cohort: {
          mentorId: user.id,
          cohort: cohortMembership.cohort
        }
      }
    })

    const now = new Date()
    
    // Check if mentor has review access and it's not expired
    const hasAccess = permissions && 
      permissions.canReviewApplications &&
      (!permissions.validUntil || permissions.validUntil > now) &&
      (!permissions.reviewAccessExpiresAt || permissions.reviewAccessExpiresAt > now)

    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        data: {
          hasAccess: false,
          message: 'You do not have permission to review applications. Please contact an administrator for access.',
          cohort: cohortMembership.cohort
        }
      })
    }

    // Calculate remaining time if there's an expiry
    let remainingDays = null
    if (permissions.reviewAccessExpiresAt) {
      const msRemaining = permissions.reviewAccessExpiresAt.getTime() - now.getTime()
      remainingDays = Math.ceil(msRemaining / (24 * 60 * 60 * 1000))
    }

    // Get the active application form for the cohort
    const applicationForm = await prisma.applicationForm.findFirst({
      where: {
        season: cohortMembership.cohort,
        isActive: true,
        isDraft: false
      },
      select: {
        id: true,
        slug: true,
        season: true,
        title: true,
        openDate: true,
        closeDate: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        hasAccess: true,
        cohort: cohortMembership.cohort,
        grantedAt: permissions.reviewAccessGrantedAt,
        expiresAt: permissions.reviewAccessExpiresAt,
        remainingDays,
        applicationForm: applicationForm ? {
          id: applicationForm.id,
          slug: applicationForm.slug,
          season: applicationForm.season,
          title: applicationForm.title,
          openDate: applicationForm.openDate,
          closeDate: applicationForm.closeDate
        } : null
      }
    })
  } catch (error) {
    console.error('Error checking mentor application access:', error)
    return NextResponse.json({ error: 'Failed to check application access' }, { status: 500 })
  }
}