import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock modules data
    const modules = [
      {
        id: 'mod1',
        title: 'Introduction to Robotics',
        description: 'Learn the basics of robotics and FGC competition',
        progress: 100,
        status: 'completed',
        duration: '2 hours',
        lessons: 8,
        completedLessons: 8,
        certificate: true
      },
      {
        id: 'mod2',
        title: 'Programming Fundamentals',
        description: 'Master programming concepts for robot control',
        progress: 60,
        status: 'in_progress',
        duration: '4 hours',
        lessons: 12,
        completedLessons: 7,
        certificate: false
      },
      {
        id: 'mod3',
        title: 'Mechanical Design',
        description: 'Design and build robot mechanisms',
        progress: 0,
        status: 'locked',
        duration: '3 hours',
        lessons: 10,
        completedLessons: 0,
        certificate: false
      }
    ]

    return NextResponse.json({
      success: true,
      data: { modules }
    })
  } catch (error) {
    console.error('Modules fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    )
  }
}