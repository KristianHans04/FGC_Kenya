import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { getCurrentUser } from '@/app/lib/auth'
import { z } from 'zod'
import { TaskPriority, TaskStatus } from '@prisma/client'

const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  dueDate: z.string().transform(str => new Date(str)).optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  completedAt: z.string().transform(str => new Date(str)).optional().nullable()
})

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

    const task = await prisma.task.findUnique({
      where: { id: id },
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

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user can view this task
    const canView = task.createdById === user.id || 
                    task.assignedToId === user.id ||
                    ['ADMIN', 'SUPER_ADMIN', 'MENTOR'].includes(user.role)

    if (!canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: task
    })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
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
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: id },
      select: { 
        createdById: true,
        assignedToId: true,
        status: true
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user can update this task
    const canUpdate = task.createdById === user.id || 
                     task.assignedToId === user.id ||
                     ['ADMIN', 'SUPER_ADMIN', 'MENTOR'].includes(user.role)

    if (!canUpdate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = UpdateTaskSchema.parse(body)

    // If status is changing to COMPLETED, set completedAt
    if (validatedData.status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED) {
      validatedData.completedAt = new Date()
    }
    // If status is changing from COMPLETED, clear completedAt
    else if (validatedData.status && validatedData.status !== TaskStatus.COMPLETED && task.status === TaskStatus.COMPLETED) {
      validatedData.completedAt = null
    }

    // Verify new assignee exists if provided
    if (validatedData.assignedToId !== undefined && validatedData.assignedToId !== null) {
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
    }

    const updatedTask = await prisma.task.update({
      where: { id: id },
      data: validatedData as any,
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
      data: updatedTask
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
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

    const task = await prisma.task.findUnique({
      where: { id: id },
      select: { createdById: true }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Only creator or admin can delete
    if (task.createdById !== user.id && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.task.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}