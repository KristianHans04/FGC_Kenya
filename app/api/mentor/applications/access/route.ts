import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to check application access permissions',
        location: 'mentor/applications/access'
      }, { status: 401 })
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
      console.log('[MENTOR_ACCESS] User is not an active mentor:', authResult.user.id)
      return NextResponse.json({ 
        success: false,
        error: 'Mentor role required',
        message: 'You must be an active mentor to access this feature. If you believe this is an error, please contact an administrator.',
        location: 'mentor/applications/access',
        details: {
          userId: authResult.user.id,
          hasMentorRole: false
        }
      }, { status: 403 })
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
      console.log('[MENTOR_ACCESS] No active cohort membership found for mentor:', user.id)
      return NextResponse.json({
        success: false,
        error: 'No active cohort assignment',
        message: 'You are not currently assigned to any cohorts. Please contact an administrator to be assigned to a cohort.',
        location: 'mentor/applications/access',
        details: {
          userId: user.id,
          hasMentorRole: true,
          hasActiveCohort: false
        }
      }, { status: 403 })
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
      console.log('[MENTOR_ACCESS] Mentor lacks application review permissions:', {
        userId: user.id,
        cohort: cohortMembership.cohort,
        hasPermissions: !!permissions,
        canReview: permissions?.canReviewApplications || false,
        validUntil: permissions?.validUntil,
        reviewExpiresAt: permissions?.reviewAccessExpiresAt
      })
      
      return NextResponse.json({
        success: false,
        error: 'Application review access denied',
        message: permissions 
          ? 'Your application review access has expired or is not enabled. Please contact an administrator to renew your access.'
          : 'You do not have permission to review applications. Please contact an administrator to grant you access.',
        location: 'mentor/applications/access',
        data: {
          hasAccess: false,
          cohort: cohortMembership.cohort,
          permissionsExist: !!permissions,
          canReviewApplications: permissions?.canReviewApplications || false,
          expired: permissions?.reviewAccessExpiresAt ? permissions.reviewAccessExpiresAt < now : false
        }
      }, { status: 403 })
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