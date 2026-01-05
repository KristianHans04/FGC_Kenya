import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { authenticateRequest } from '@/app/lib/auth/api'
import { EventType } from '@prisma/client'
import { z } from 'zod'

const BulkCreateEventSchema = z.object({
  events: z.array(z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    type: z.nativeEnum(EventType).default(EventType.MEETING),
    startDate: z.string().transform(str => new Date(str)),
    endDate: z.string().transform(str => new Date(str)),
    allDay: z.boolean().default(false),
    location: z.string().optional(),
    isVirtual: z.boolean().default(false),
    meetingLink: z.string().url().optional().nullable(),
    audience: z.string().default('ALL'),
    specificEmails: z.array(z.string().email()).optional(),
    targetRoles: z.array(z.string()).optional(),
    isPublic: z.boolean().default(false)
  })),
  bulk: z.boolean()
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate request with detailed error handling
    const authResult = await authenticateRequest(request)
    
    if (authResult instanceof NextResponse) {
      console.error('[Bulk Events POST] Authentication failed')
      return authResult // This contains the detailed error
    }

    const { user } = authResult
    console.log('[Bulk Events POST] Authenticated user:', user.email, user.role)

    // Only admins can bulk create events
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          details: `Role ${user.role} cannot bulk create events. Only ADMIN and SUPER_ADMIN roles are allowed.`
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = BulkCreateEventSchema.parse(body)

    const createdEvents = []
    
    for (const eventData of validatedData.events) {
      // Determine attendees based on audience
      let attendeeIds: string[] = []
      
      if (eventData.audience === 'STUDENTS') {
        const students = await prisma.user.findMany({
          where: { role: 'STUDENT' },
          select: { id: true }
        })
        attendeeIds = students.map(s => s.id)
      } else if (eventData.audience === 'MENTORS') {
        const mentors = await prisma.user.findMany({
          where: { role: 'MENTOR' },
          select: { id: true }
        })
        attendeeIds = mentors.map(m => m.id)
      } else if (eventData.audience === 'ALUMNI') {
        const alumni = await prisma.user.findMany({
          where: { role: 'ALUMNI' },
          select: { id: true }
        })
        attendeeIds = alumni.map(a => a.id)
      } else if (eventData.audience === 'ADMINS') {
        const admins = await prisma.user.findMany({
          where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
          select: { id: true }
        })
        attendeeIds = admins.map(a => a.id)
      } else if (eventData.audience === 'SPECIFIC' && eventData.specificEmails) {
        const users = await prisma.user.findMany({
          where: { email: { in: eventData.specificEmails } },
          select: { id: true }
        })
        attendeeIds = users.map(u => u.id)
      } else if (eventData.audience === 'ROLES' && eventData.targetRoles) {
        const users = await prisma.user.findMany({
          where: { role: { in: eventData.targetRoles as any } },
          select: { id: true }
        })
        attendeeIds = users.map(u => u.id)
      } else if (eventData.audience === 'ALL') {
        // For public events, don't add specific attendees
        eventData.isPublic = true
      }

      // Generate slug from title and date
      const slug = `${eventData.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`

      const event = await prisma.calendarEvent.create({
        data: {
          title: eventData.title,
          slug,
          description: eventData.description,
          type: eventData.type,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          allDay: eventData.allDay,
          location: eventData.location,
          isVirtual: eventData.isVirtual,
          meetingLink: eventData.meetingLink,
          isPublic: eventData.isPublic,
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
          _count: {
            select: {
              attendees: true
            }
          }
        }
      })
      
      createdEvents.push(event)
    }

    return NextResponse.json({
      success: true,
      data: createdEvents,
      message: `Successfully created ${createdEvents.length} events`
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Error creating bulk events:', error)
    return NextResponse.json(
      { error: 'Failed to create events' },
      { status: 500 }
    )
  }
}