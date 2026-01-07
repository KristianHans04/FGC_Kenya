import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = authResult.user

    // Get active cohort for mentor
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

    // Fetch upcoming training sessions (calendar events)
    const now = new Date()
    const sessions = await prisma.calendarEvent.findMany({
      where: {
        type: {
          in: ['WORKSHOP', 'PRACTICE', 'TEAM_BUILD', 'MEETING']
        },
        startDate: {
          gte: now
        },
        isPublic: true
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        type: true,
        startDate: true,
        endDate: true,
        allDay: true,
        location: true,
        isVirtual: true,
        meetingLink: true,
        _count: {
          select: {
            attendees: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      },
      take: 10
    })

    // Format sessions for the frontend
    const formattedSessions = sessions.map(session => {
      const duration = session.allDay ? 
        'All day' : 
        `${Math.round((session.endDate.getTime() - session.startDate.getTime()) / (60 * 60 * 1000))} hours`
      
      const status = session.startDate > now ? 'upcoming' : 
                    session.endDate > now ? 'ongoing' : 'completed'
      
      return {
        id: session.slug,
        title: session.title,
        description: session.description,
        type: session.type.toLowerCase(),
        date: session.startDate.toISOString(),
        endDate: session.endDate.toISOString(),
        duration,
        attendees: session._count.attendees,
        status,
        location: session.location,
        isVirtual: session.isVirtual,
        meetingLink: session.meetingLink
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        sessions: formattedSessions,
        cohort: cohortMembership.cohort
      }
    })
  } catch (error) {
    console.error('Error fetching mentor sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}
