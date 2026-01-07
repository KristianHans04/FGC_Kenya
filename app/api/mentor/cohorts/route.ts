import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized',
        message: 'You must be logged in to access mentor cohorts'
      }, { status: 401 })
    }

    // Get cohorts where user is a mentor with active status
    const mentorCohorts = await prisma.cohortMember.findMany({
      where: {
        userId: authResult.user.id,
        role: 'MENTOR',
        isActive: true
      },
      orderBy: {
        cohort: 'desc'
      }
    })

    if (mentorCohorts.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No active mentor cohorts',
        message: 'You are not currently assigned as a mentor to any cohorts. Please contact an administrator.',
        data: []
      }, { status: 403 })
    }

    // Get student counts for each cohort
    const cohortsWithCounts = await Promise.all(
      mentorCohorts.map(async (cohort) => {
        const studentCount = await prisma.cohortMember.count({
          where: {
            cohort: cohort.cohort,
            role: 'STUDENT',
            isActive: true
          }
        })

        return {
          cohort: cohort.cohort,
          year: cohort.cohort.replace('FGC ', ''),
          joinedAt: cohort.joinedAt,
          isActive: cohort.isActive,
          studentCount
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: cohortsWithCounts,
      message: `Found ${cohortsWithCounts.length} active cohort(s) for mentor`
    })
  } catch (error) {
    console.error('[MENTOR_COHORTS_API] Error fetching mentor cohorts:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error', 
      message: 'Failed to fetch mentor cohorts. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}