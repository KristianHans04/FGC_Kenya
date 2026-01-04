import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { getCurrentUser } from '@/app/lib/auth'
import { AttendeeStatus } from '@prisma/client'
import { z } from 'zod'

const RSVPSchema = z.object({
  status: z.nativeEnum(AttendeeStatus)
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = RSVPSchema.parse(body)

    // Check if event exists
    const event = await prisma.calendarEvent.findUnique({
      where: { id: id },
      select: { 
        id: true,
        isPublic: true,
        createdById: true
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if user already has an RSVP
    const existingRSVP = await prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: user.id
        }
      }
    })

    let attendee

    if (existingRSVP) {
      // Update existing RSVP
      attendee = await prisma.eventAttendee.update({
        where: {
          eventId_userId: {
            eventId: id,
            userId: user.id
          }
        },
        data: {
          status,
          respondedAt: new Date()
        },
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
      })
    } else {
      // Create new RSVP
      attendee = await prisma.eventAttendee.create({
        data: {
          eventId: id,
          userId: user.id,
          status,
          respondedAt: new Date()
        },
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
      })
    }

    return NextResponse.json({
      success: true,
      data: attendee
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Error processing RSVP:', error)
    return NextResponse.json(
      { error: 'Failed to process RSVP' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's RSVP status for this event
    const attendee = await prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: user.id
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        status: attendee?.status || null,
        respondedAt: attendee?.respondedAt || null
      }
    })
  } catch (error) {
    console.error('Error fetching RSVP:', error)
    return NextResponse.json(
      { error: 'Failed to fetch RSVP' },
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
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if RSVP exists
    const attendee = await prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: user.id
        }
      }
    })

    if (!attendee) {
      return NextResponse.json({ error: 'RSVP not found' }, { status: 404 })
    }

    // Delete the RSVP
    await prisma.eventAttendee.delete({
      where: {
        eventId_userId: {
          eventId: id,
          userId: user.id
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'RSVP cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling RSVP:', error)
    return NextResponse.json(
      { error: 'Failed to cancel RSVP' },
      { status: 500 }
    )
  }
}