import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get cohorts where user is a mentor
    const mentorCohorts = await prisma.cohortMember.findMany({
      where: {
        userId: authResult.user.id,
        role: 'MENTOR'
      },
      orderBy: {
        cohort: 'desc'
      }
    })

    // Get student counts for each cohort
    const cohortsWithCounts = await Promise.all(
      mentorCohorts.map(async (cohort) => {
        const studentCount = await prisma.cohortMember.count({
          where: {
            cohort: cohort.cohort,
            role: 'STUDENT'
          }
        })

        return {
          cohort: cohort.cohort,
          year: cohort.cohort.replace('FGC', ''),
          joinedAt: cohort.joinedAt,
          isActive: cohort.isActive,
          studentCount
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: cohortsWithCounts
    })
  } catch (error) {
    console.error('Fetch mentor cohorts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cohorts' },
      { status: 500 }
    )
  }
}