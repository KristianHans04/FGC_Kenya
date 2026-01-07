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
        message: 'You must be logged in to access cohorts'
      }, { status: 401 })
    }

    // Get distinct cohorts from cohortMember table
    const cohortMembers = await prisma.cohortMember.findMany({
      distinct: ['cohort'],
      select: {
        cohort: true
      },
      orderBy: {
        cohort: 'desc'
      }
    })

    // Extract unique cohorts
    const cohorts = [...new Set(cohortMembers.map(cm => cm.cohort))]

    // If no cohorts exist, provide defaults based on current year
    if (cohorts.length === 0) {
      const currentYear = new Date().getFullYear()
      for (let year = currentYear + 1; year >= currentYear - 3; year--) {
        cohorts.push(`FGC ${year}`)
      }
    }

    return NextResponse.json({
      success: true,
      data: cohorts,
      message: `Found ${cohorts.length} cohort(s)`
    })
  } catch (error) {
    console.error('[COHORTS_API] Error fetching cohorts:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch cohorts. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}