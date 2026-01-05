import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { authenticateRequest } from '@/app/lib/auth/api'
import { EventType } from '@prisma/client'
import NotificationService from '@/app/lib/notifications/notification-service'
import { z } from 'zod'

const CreateEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  type: z.nativeEnum(EventType).default(EventType.MEETING),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)).optional().nullable(), // Made optional and nullable
  allDay: z.boolean().default(false),
  location: z.string().optional().nullable(),
  isVirtual: z.boolean().default(false),
  meetingLink: z.string().optional().nullable(), // Removed .url() validation as it might be empty
  audience: z.string().default('ALL'),
  specificEmails: z.array(z.string()).optional().default([]),
  targetRoles: z.array(z.string()).optional().default([]),
  isPublic: z.boolean().default(false),
  attendeeIds: z.array(z.string()).optional().default([])
})

export async function GET(request: NextRequest) {
  try {
    // Authenticate request with detailed error handling
    const authResult = await authenticateRequest(request)
    
    if (authResult instanceof NextResponse) {
      console.error('[Calendar GET] Authentication failed')
      return authResult // This contains the detailed error
    }

    const { user } = authResult
    console.log('[Calendar GET] Authenticated user:', user.email, user.role)

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type') as EventType | null
    const userId = searchParams.get('userId')

    const where: any = {}

    // Date range filter
    if (startDate || endDate) {
      where.startDate = {}
      if (startDate) where.startDate.gte = new Date(startDate)
      if (endDate) where.startDate.lte = new Date(endDate)
    }

    // Type filter
    if (type) {
      where.type = type
    }

    // User filter - show public events and events user is invited to or created
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      where.OR = [
        { isPublic: true },
        { createdById: user.id },
        { attendees: { some: { userId: user.id } } }
      ]
    }

    // Specific user filter (for admin views)
    if (userId && ['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      where.OR = [
        { createdById: userId },
        { attendees: { some: { userId } } }
      ]
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            attendees: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: events
    })
  } catch (error) {
    console.error('[Calendar GET] Error fetching events:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch events',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate request with detailed error handling
    const authResult = await authenticateRequest(request)
    
    if (authResult instanceof NextResponse) {
      console.error('[Calendar POST] Authentication failed')
      return authResult // This contains the detailed error
    }

    const { user } = authResult
    console.log('[Calendar POST] Authenticated user:', user.email, user.role)

    // Only admins and mentors can create events
    if (!['ADMIN', 'SUPER_ADMIN', 'MENTOR'].includes(user.role)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          details: `Role ${user.role} cannot create events. Only ADMIN, SUPER_ADMIN, and MENTOR roles are allowed.`
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = CreateEventSchema.parse(body)
    
    // Validate meetingLink if provided
    if (validatedData.meetingLink && validatedData.meetingLink.trim() !== '') {
      try {
        new URL(validatedData.meetingLink)
      } catch {
        return NextResponse.json(
          { 
            error: 'Invalid meeting link',
            details: 'Please provide a valid URL for the meeting link'
          },
          { status: 400 }
        )
      }
    }

    // If no end date provided, use start date
    const eventEndDate = validatedData.endDate || validatedData.startDate

    // Validate date range if both dates provided
    if (validatedData.endDate && validatedData.endDate < validatedData.startDate) {
      return NextResponse.json(
        { 
          error: 'Invalid date range',
          details: 'End date must be after or equal to start date'
        },
        { status: 400 }
      )
    }

    // Determine attendees based on audience
    let attendeeIds: string[] = []
    
    if (validatedData.audience === 'STUDENTS') {
      const students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: { id: true }
      })
      attendeeIds = students.map(s => s.id)
    } else if (validatedData.audience === 'MENTORS') {
      const mentors = await prisma.user.findMany({
        where: { role: 'MENTOR' },
        select: { id: true }
      })
      attendeeIds = mentors.map(m => m.id)
    } else if (validatedData.audience === 'ALUMNI') {
      const alumni = await prisma.user.findMany({
        where: { role: 'ALUMNI' },
        select: { id: true }
      })
      attendeeIds = alumni.map(a => a.id)
    } else if (validatedData.audience === 'ADMINS') {
      const admins = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        select: { id: true }
      })
      attendeeIds = admins.map(a => a.id)
    } else if (validatedData.audience === 'SPECIFIC' && validatedData.specificEmails) {
      const users = await prisma.user.findMany({
        where: { email: { in: validatedData.specificEmails } },
        select: { id: true }
      })
      attendeeIds = users.map(u => u.id)
    } else if (validatedData.audience === 'ROLES' && validatedData.targetRoles) {
      const users = await prisma.user.findMany({
        where: { role: { in: validatedData.targetRoles as any } },
        select: { id: true }
      })
      attendeeIds = users.map(u => u.id)
    } else if (validatedData.attendeeIds) {
      attendeeIds = validatedData.attendeeIds
    }

    // Generate slug
    const slug = `${validatedData.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`

    const event = await prisma.calendarEvent.create({
      data: {
        title: validatedData.title,
        slug,
        description: validatedData.description,
        type: validatedData.type,
        startDate: validatedData.startDate,
        endDate: eventEndDate,
        allDay: validatedData.allDay,
        location: validatedData.location,
        isVirtual: validatedData.isVirtual,
        meetingLink: validatedData.meetingLink,
        isPublic: validatedData.isPublic || validatedData.audience === 'ALL',
        createdById: user.id,
        attendees: {
          create: attendeeIds.map(userId => ({
            userId,
            status: 'PENDING'
          }))
        }
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    })

    console.log('[Calendar POST] Event created successfully:', event.id)

    // Send notifications to attendees
    if (attendeeIds.length > 0) {
      await NotificationService.sendBulkNotification(
        attendeeIds,
        'EVENT_INVITATION',
        `New Event: ${validatedData.title}`,
        `You've been invited to ${validatedData.title} on ${validatedData.startDate.toLocaleDateString()}`,
        `/dashboard/calendar/events/${slug}`
      )
    }

    return NextResponse.json({
      success: true,
      data: event
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[Calendar POST] Validation error:', error.flatten())
      return NextResponse.json(
        { 
          error: 'Invalid data',
          details: error.flatten()
        },
        { status: 400 }
      )
    }

    console.error('[Calendar POST] Error creating event:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}