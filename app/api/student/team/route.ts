import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all cohorts the current user is/was part of
    const userCohorts = await prisma.cohortMember.findMany({
      where: {
        userId: authResult.user.id,
        role: 'STUDENT'
      },
      orderBy: {
        cohort: 'desc'
      }
    })

    if (userCohorts.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          cohorts: [],
          message: 'You are not part of any cohort yet.'
        }
      })
    }

    // Get team members for each cohort
    const cohortsWithMembers = await Promise.all(
      userCohorts.map(async (userCohort) => {
        const cohortMembers = await prisma.cohortMember.findMany({
          where: {
            cohort: userCohort.cohort
          },
          include: {
            user: {
              select: {
                id: true,
                slug: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                school: true,
                linkedinUrl: true,
                githubUrl: true,
                portfolioUrl: true,
                role: true
              }
            }
          },
          orderBy: [
            { role: 'asc' }, // Mentors first
            { user: { firstName: 'asc' } }
          ]
        })

        // Separate mentors and students
        const mentors = cohortMembers
          .filter(m => m.role === 'MENTOR')
          .map(m => ({
            ...m.user,
            cohortRole: 'MENTOR',
            joinedAt: m.joinedAt,
            isActive: m.isActive
          }))

        const students = cohortMembers
          .filter(m => m.role === 'STUDENT')
          .map(m => ({
            ...m.user,
            cohortRole: 'STUDENT',
            joinedAt: m.joinedAt,
            isActive: m.isActive
          }))

        return {
          cohort: userCohort.cohort,
          year: userCohort.cohort.replace('FGC', ''),
          joinedAt: userCohort.joinedAt,
          isActive: userCohort.isActive,
          mentors,
          students,
          totalMembers: cohortMembers.length
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        cohorts: cohortsWithMembers,
        currentUserId: authResult.user.id
      }
    })
  } catch (error) {
    console.error('Team fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    )
  }
}