import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock cohort data
    const cohort = {
      id: '2024',
      name: '2024 Cohort',
      year: 2024,
      members: [
        {
          id: 'member1',
          name: 'John Doe',
          role: 'Team Lead',
          school: 'Example High School'
        },
        {
          id: 'member2',
          name: 'Jane Smith',
          role: 'Programmer',
          school: 'Tech Academy'
        }
      ],
      mentor: {
        id: 'mentor1',
        name: 'Dr. Mentor',
        email: 'mentor@example.com'
      },
      progress: 65,
      startDate: '2024-01-15',
      endDate: '2024-12-15'
    }

    return NextResponse.json({
      success: true,
      data: cohort
    })
  } catch (error) {
    console.error('Cohort fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cohort' },
      { status: 500 }
    )
  }
}