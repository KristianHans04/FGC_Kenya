import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const user = authResult.user

    // Get active cohort membership for the mentor
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

    // Get mentor permissions for this cohort
    const permissions = await prisma.mentorPermission.findUnique({
      where: {
        mentorId_cohort: {
          mentorId: user.id,
          cohort: cohortMembership.cohort
        }
      }
    })

    // Check if mentorship is still valid
    const now = new Date()
    const isValid = permissions && 
      (!permissions.validUntil || permissions.validUntil > now) &&
      permissions.validFrom <= now

    if (!isValid) {
      return NextResponse.json(
        { error: 'Mentor permissions have expired' },
        { status: 403 }
      )
    }

    // Get cohort statistics
    const studentsCount = await prisma.mentorStudent.count({
      where: {
        mentorId: user.id,
        cohort: cohortMembership.cohort,
        isActive: true
      }
    })

    const cohortStudentsTotal = await prisma.cohortMember.count({
      where: {
        cohort: cohortMembership.cohort,
        role: 'STUDENT',
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        cohort: cohortMembership.cohort,
        joinedAt: cohortMembership.joinedAt,
        permissions: {
          canReviewApplications: permissions.canReviewApplications,
          canAccessStudentDetails: permissions.canAccessStudentDetails,
          canApproveContent: permissions.canApproveContent,
          reviewAccessExpiresAt: permissions.reviewAccessExpiresAt,
          validUntil: permissions.validUntil
        },
        stats: {
          assignedStudents: studentsCount,
          totalCohortStudents: cohortStudentsTotal
        }
      }
    })
  } catch (error) {
    console.error('Error fetching mentor cohort:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mentor cohort' },
      { status: 500 }
    )
  }
}