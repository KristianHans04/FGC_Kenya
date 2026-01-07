/**
 * @file app/api/admin/emails/send-task-notification/route.ts
 * @description API endpoint to send task assignment notification emails
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { sendEmail } from '@/app/lib/email'
import { createBaseTemplate } from '@/app/lib/email/templates/base'
import { EmailButton, InfoBox, Divider, StatusBadge } from '@/app/lib/email/templates/components'
import { getCurrentUser } from '@/app/lib/auth'
import { format } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    // Check authentication - only admins can send task notifications
    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, task } = await request.json()

    if (!userId || !task) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Priority colors and labels
    const priorityConfig = {
      LOW: { label: 'Low Priority', color: '#1565c0', bgcolor: '#e3f2fd' },
      MEDIUM: { label: 'Medium Priority', color: '#ef6c00', bgcolor: '#fff3e0' },
      HIGH: { label: 'High Priority', color: '#ef6c00', bgcolor: '#ffe0b2' },
      URGENT: { label: 'Urgent', color: '#c62828', bgcolor: '#ffebee' }
    }

    // Status labels
    const statusConfig = {
      TODO: 'To Do',
      IN_PROGRESS: 'In Progress',
      REVIEW: 'Under Review',
      COMPLETED: 'Completed'
    }

    const priority = priorityConfig[task.priority as keyof typeof priorityConfig]
    const statusLabel = statusConfig[task.status as keyof typeof statusConfig]

    // Create email content
    const subject = `New Task Assigned: ${task.title}`
    const preheader = `You have been assigned a new ${priority.label.toLowerCase()} task`

    const htmlContent = `
      <h2 style="color: #333;">New Task Assignment</h2>
      
      <p>Hello ${user.firstName || 'Team Member'},</p>
      
      <p>You have been assigned a new task by Admin:</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #006600; margin-top: 0;">${task.title}</h3>
        
        ${task.description ? `
          <p style="color: #666; line-height: 1.6; margin: 10px 0;">
            ${task.description}
          </p>
        ` : ''}
        
        <div style="margin: 15px 0;">
          <div style="display: inline-block; margin-right: 15px;">
            <strong style="color: #333;">Priority:</strong>
            <span style="
              display: inline-block;
              padding: 4px 12px;
              background: ${priority.bgcolor};
              color: ${priority.color};
              border-radius: 12px;
              font-weight: bold;
              font-size: 12px;
              margin-left: 5px;
            ">${priority.label}</span>
          </div>
          
          <div style="display: inline-block;">
            <strong style="color: #333;">Status:</strong>
            <span style="
              display: inline-block;
              padding: 4px 12px;
              background: #e8f5e9;
              color: #2e7d32;
              border-radius: 12px;
              font-weight: bold;
              font-size: 12px;
              margin-left: 5px;
            ">${statusLabel}</span>
          </div>
        </div>
        
        ${task.dueDate ? `
          <div style="margin-top: 10px;">
            <strong style="color: #333;">Due Date:</strong>
            <span style="color: #BB0000; font-weight: bold; margin-left: 5px;">
              ${format(new Date(task.dueDate), 'MMMM d, yyyy')}
            </span>
          </div>
        ` : ''}
        
        ${task.tags && task.tags.length > 0 ? `
          <div style="margin-top: 10px;">
            <strong style="color: #333;">Tags:</strong>
            ${task.tags.map((tag: string) => `
              <span style="
                display: inline-block;
                padding: 2px 8px;
                background: #006600;
                color: white;
                border-radius: 10px;
                font-size: 11px;
                margin: 2px;
              ">${tag}</span>
            `).join('')}
          </div>
        ` : ''}
      </div>
      
      ${Divider()}
      
      <div style="text-align: center; margin: 30px 0;">
        ${EmailButton('View Task Dashboard', `${process.env.NEXTAUTH_URL}/dashboard/tasks`, 'primary')}
      </div>
      
      ${InfoBox(
        'Task Guidelines',
        `
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Review the task details carefully</li>
            <li>Update task status as you progress</li>
            <li>Ask questions if you need clarification</li>
            <li>Complete the task before the due date</li>
          </ul>
        `,
        'info'
      )}
      
      ${Divider()}
      
      <p style="color: #666; font-size: 12px; text-align: center;">
        This is an automated notification from the FIRST Global Team Kenya Task Management System.
      </p>
    `

    const html = createBaseTemplate(htmlContent, {
      title: 'New Task Assignment - FIRST Global Team Kenya',
      preheader
    })

    const text = `
New Task Assignment

Hello ${user.firstName || 'Team Member'},

You have been assigned a new task by Admin:

TASK: ${task.title}
${task.description ? `\nDESCRIPTION: ${task.description}` : ''}

Priority: ${priority.label}
Status: ${statusLabel}
${task.dueDate ? `Due Date: ${format(new Date(task.dueDate), 'MMMM d, yyyy')}` : ''}
${task.tags && task.tags.length > 0 ? `Tags: ${task.tags.join(', ')}` : ''}

Task Guidelines:
- Review the task details carefully
- Update task status as you progress
- Ask questions if you need clarification
- Complete the task before the due date

View your tasks: ${process.env.NEXTAUTH_URL}/dashboard/tasks

This is an automated notification from the FIRST Global Team Kenya Task Management System.

FIRST Global Team Kenya
Off James Gichuru Road, Nairobi, Kenya
teamkenyarobotics254@gmail.com
    `.trim()

    // Send email
    const result = await sendEmail({
      to: user.email,
      subject,
      html,
      text
    })

    // Log the notification
    await prisma.auditLog.create({
      data: {
        action: 'EMAIL_SENT',
        entityType: 'Task',
        entityId: task.id,
        userId: currentUser.id,
        details: {
          recipientId: user.id,
          taskTitle: task.title,
          emailType: 'task_notification'
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Task notification sent successfully',
      data: result
    })

  } catch (error) {
    console.error('Task notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send task notification' },
      { status: 500 }
    )
  }
}