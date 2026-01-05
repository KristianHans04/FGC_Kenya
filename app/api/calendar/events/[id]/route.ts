import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { authenticateRequest } from '@/app/lib/auth/api'
import { z } from 'zod'
import { EventType } from '@prisma/client'

const UpdateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  type: z.nativeEnum(EventType).optional(),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
  allDay: z.boolean().optional(),
  location: z.string().optional(),
  isVirtual: z.boolean().optional(),
  meetingLink: z.string().url().optional().nullable(),
  isPublic: z.boolean().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Authenticate request
    const authResult = await authenticateRequest(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const { user } = authResult

    const event = await prisma.calendarEvent.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          }
        },
        reminders: true,
        _count: {
          select: {
            attendees: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if user can view this event
    const canView = event.isPublic || 
                    event.createdById === user.id || 
                    event.attendees.some(a => a.userId === user.id) ||
                    ['ADMIN', 'SUPER_ADMIN'].includes(user.role)

    if (!canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: event
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Authenticate request
    const authResult = await authenticateRequest(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const { user } = authResult

    const event = await prisma.calendarEvent.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      },
      select: { id: true, createdById: true }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Only creator or admin can update
    if (event.createdById !== user.id && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = UpdateEventSchema.parse(body)

    // Validate date range if both dates provided
    if (validatedData.startDate && validatedData.endDate && 
        validatedData.endDate < validatedData.startDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: event.id },
      data: validatedData as any,
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

    return NextResponse.json({
      success: true,
      data: updatedEvent
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Authenticate request
    const authResult = await authenticateRequest(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const { user } = authResult

    const event = await prisma.calendarEvent.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      },
      select: { id: true, createdById: true }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Only creator or admin can delete
    if (event.createdById !== user.id && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.calendarEvent.delete({
      where: { id: event.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}