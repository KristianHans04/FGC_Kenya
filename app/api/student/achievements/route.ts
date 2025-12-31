import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock achievements data
    const achievements = [
      {
        id: 'ach1',
        title: 'Quick Learner',
        description: 'Complete your first module',
        icon: '🎯',
        earned: true,
        earnedAt: '2024-01-20',
        category: 'Learning'
      },
      {
        id: 'ach2',
        title: 'Team Player',
        description: 'Collaborate on 5 team projects',
        icon: '🤝',
        earned: true,
        earnedAt: '2024-02-15',
        category: 'Collaboration'
      },
      {
        id: 'ach3',
        title: 'Innovation Master',
        description: 'Submit 3 innovative solutions',
        icon: '💡',
        earned: false,
        progress: '1/3',
        category: 'Innovation'
      },
      {
        id: 'ach4',
        title: 'Competition Ready',
        description: 'Complete all training modules',
        icon: '🏆',
        earned: false,
        progress: '60%',
        category: 'Competition'
      }
    ]

    return NextResponse.json({
      success: true,
      data: { achievements }
    })
  } catch (error) {
    console.error('Achievements fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}