import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // Return mock data for now
    return NextResponse.json({
      success: true,
      data: {
        id: id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@school.ac.ke',
        phone: '+254 700 123456',
        school: 'Nairobi High School',
        cohort: 'FGC 2026',
        joinedAt: '2024-01-15',
        progress: {
          modulesCompleted: 8,
          totalModules: 12,
          assignmentsSubmitted: 15,
          totalAssignments: 20,
          averageScore: 85
        },
        achievements: [],
        recentActivity: []
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch student details' }, { status: 500 })
  }
}