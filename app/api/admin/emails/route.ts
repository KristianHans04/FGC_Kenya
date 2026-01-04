import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import { prisma } from '@/app/lib/db'
import { sendEmail } from '@/app/lib/email'
import { createGenericEmailTemplate } from '@/app/lib/email/templates/index'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = req.nextUrl.searchParams
    const folder = searchParams.get('folder') || 'inbox'
    const emailId = searchParams.get('id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    // Get single email by ID
    if (emailId) {
      const email = await prisma.email.findUnique({
        where: { id: emailId },
        include: {
          sender: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })

      if (!email) {
        return NextResponse.json({ error: 'Email not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: { email }
      })
    }

    // Build where clause based on folder
    let whereClause: any = {}
    
    if (folder === 'sent') {
      whereClause = { senderId: authResult.user.id, isDraft: false }
    } else if (folder === 'drafts') {
      whereClause = { senderId: authResult.user.id, isDraft: true }
    } else if (folder === 'archived') {
      whereClause = { senderId: authResult.user.id, isArchived: true, isDraft: false }
    } else if (folder === 'trash') {
      whereClause = { senderId: authResult.user.id, isDeleted: true }
    } else if (folder === 'starred') {
      whereClause = { senderId: authResult.user.id, isStarred: true, isDraft: false }
    } else {
      // Inbox - show emails where user is recipient
      whereClause = { recipientId: authResult.user.id, isDraft: false, isArchived: false, isDeleted: false }
    }

    // Apply search filter
    if (search) {
      whereClause.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { plainText: { contains: search, mode: 'insensitive' } }
      ]
    }

    const emails = await prisma.email.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { sentAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit
    })

    const totalCount = await prisma.email.count({ where: whereClause })

    return NextResponse.json({
      success: true,
      data: {
        emails,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
      }
    })
  } catch (error) {
    console.error('Email fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { emailId, isRead, isStarred, isArchived, isDeleted } = body
    
    if (!emailId) {
      return NextResponse.json({ error: 'Email ID required' }, { status: 400 })
    }
    
    const updateData: any = {}
    if (typeof isRead === 'boolean') updateData.isRead = isRead
    if (typeof isStarred === 'boolean') updateData.isStarred = isStarred
    if (typeof isArchived === 'boolean') updateData.isArchived = isArchived
    if (typeof isDeleted === 'boolean') updateData.isDeleted = isDeleted
    
    const updatedEmail = await prisma.email.update({
      where: { id: emailId },
      data: updateData
    })
    
    return NextResponse.json({
      success: true,
      data: { 
        message: 'Email status updated',
        email: updatedEmail
      }
    })
  } catch (error) {
    console.error('Email update error:', error)
    return NextResponse.json(
      { error: 'Failed to update email' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    
    // Send actual email(s)
    const toEmails = Array.isArray(body.to) ? body.to : [body.to].filter(Boolean)
    const ccEmails = Array.isArray(body.cc) ? body.cc : [body.cc].filter(Boolean)
    const bccEmails = Array.isArray(body.bcc) ? body.bcc : [body.bcc].filter(Boolean)
    
    const allRecipients = [...toEmails, ...ccEmails, ...bccEmails]
    const plainText = body.body ? body.body.replace(/<[^>]*>/g, '') : ''
    
    // Create professional email template
    const emailTemplate = createGenericEmailTemplate({
      subject: body.subject || '(no subject)',
      body: body.body || '<p>No content provided.</p>'
    })
    
    // Send to all recipients
    const sendResults = await Promise.all(
      allRecipients.map(email => 
        sendEmail({
          to: email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        })
      )
    )
    
    // Check if at least one email was sent successfully
    const anySent = sendResults.some(result => result === true)
    
    if (!anySent) {
      return NextResponse.json(
        { error: 'Failed to send email to any recipient' },
        { status: 500 }
      )
    }
    
    // Save to database
    const sentEmail = await prisma.email.create({
      data: {
        subject: body.subject || '(no subject)',
        body: emailTemplate.html,
        plainText: emailTemplate.text,
        toEmails: toEmails,
        ccEmails: ccEmails,
        bccEmails: bccEmails,
        senderId: authResult.user.id,
        isRead: true,
        isStarred: false,
        isDraft: false,
        isArchived: false,
        isDeleted: false,
        sentAt: new Date(),
        threadId: null,
        attachments: body.attachments || []
      },
      include: {
        sender: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: { 
        message: 'Email sent successfully',
        email: sentEmail
      }
    })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}