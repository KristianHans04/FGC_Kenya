import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { getCurrentUser } from '@/app/lib/auth'
import { TaskPriority, TaskStatus } from '@prisma/client'
import { z } from 'zod'

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  dueDate: z.string().transform(str => new Date(str)).optional(),
  assignedToId: z.string().optional(),
  tags: z.array(z.string()).optional()
})

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as TaskStatus | null
    const priority = searchParams.get('priority') as TaskPriority | null
    const assignedToId = searchParams.get('assignedToId')
    const createdById = searchParams.get('createdById')
    const dueBefore = searchParams.get('dueBefore')
    const dueAfter = searchParams.get('dueAfter')

    const where: any = {}

    // Status filter
    if (status) {
      where.status = status
    }

    // Priority filter
    if (priority) {
      where.priority = priority
    }

    // Due date filters
    if (dueBefore || dueAfter) {
      where.dueDate = {}
      if (dueBefore) where.dueDate.lte = new Date(dueBefore)
      if (dueAfter) where.dueDate.gte = new Date(dueAfter)
    }

    // User filters
    if (['ADMIN', 'SUPER_ADMIN', 'MENTOR'].includes(user.role)) {
      // Admins and mentors can see all tasks
      if (assignedToId) where.assignedToId = assignedToId
      if (createdById) where.createdById = createdById
    } else {
      // Regular users can only see tasks assigned to them or created by them
      where.OR = [
        { assignedToId: user.id },
        { createdById: user.id }
      ]
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: tasks
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = CreateTaskSchema.parse(body)

    // Verify assignee exists if provided
    if (validatedData.assignedToId) {
      const assignee = await prisma.user.findUnique({
        where: { id: validatedData.assignedToId },
        select: { id: true }
      })

      if (!assignee) {
        return NextResponse.json(
          { error: 'Assigned user not found' },
          { status: 400 }
        )
      }

      // Only admins and mentors can assign tasks to others
      if (validatedData.assignedToId !== user.id && 
          !['ADMIN', 'SUPER_ADMIN', 'MENTOR'].includes(user.role)) {
        return NextResponse.json(
          { error: 'You can only create tasks for yourself' },
          { status: 403 }
        )
      }
    }

    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        status: validatedData.status,
        dueDate: validatedData.dueDate,
        assignedToId: validatedData.assignedToId,
        createdById: user.id,
        tags: validatedData.tags || []
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: task
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}