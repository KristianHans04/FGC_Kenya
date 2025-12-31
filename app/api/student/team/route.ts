import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock team data
    const team = {
      id: 'team1',
      name: 'Team Kenya Robotics',
      members: [
        {
          id: 'member1',
          name: 'John Doe',
          role: 'Team Captain',
          email: 'john@example.com',
          avatar: null
        },
        {
          id: 'member2',
          name: 'Jane Smith',
          role: 'Lead Programmer',
          email: 'jane@example.com',
          avatar: null
        },
        {
          id: 'member3',
          name: 'Bob Johnson',
          role: 'Mechanical Designer',
          email: 'bob@example.com',
          avatar: null
        }
      ],
      achievements: [
        'Regional Champions 2023',
        'Best Innovation Award'
      ],
      currentProject: 'Competition Robot 2024',
      teamScore: 850
    }

    return NextResponse.json({
      success: true,
      data: team
    })
  } catch (error) {
    console.error('Team fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    )
  }
}