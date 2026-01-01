import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import { prisma } from '@/app/lib/db'

// In-memory storage for sent emails (in production, use a database)
const sentEmails: any[] = []

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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    // Mock email data with different folders
    let emails: any[] = []
    
    if (folder === 'inbox') {
      emails = [
        {
          id: '1',
          subject: 'New Application from John Doe',
          body: '<p>A new application has been submitted for review...</p>',
          plainText: 'A new application has been submitted for review...',
          toEmails: ['admin@fgckenya.org'],
          ccEmails: [],
          bccEmails: [],
          senderId: 'system',
          sender: {
            email: 'noreply@fgckenya.org',
            name: 'FGC Kenya System'
          },
          isRead: false,
          isStarred: false,
          isDraft: false,
          isArchived: false,
          sentAt: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          threadId: null,
          attachments: [],
          labels: ['Important']
        },
        {
          id: '2',
          subject: 'Meeting Schedule for Tomorrow',
          body: '<p>Please find attached the meeting schedule...</p>',
          plainText: 'Please find attached the meeting schedule...',
          toEmails: ['admin@fgckenya.org'],
          ccEmails: ['team@fgckenya.org'],
          bccEmails: [],
          senderId: 'coordinator',
          sender: {
            email: 'coordinator@fgckenya.org',
            name: 'Event Coordinator'
          },
          isRead: true,
          isStarred: true,
          isDraft: false,
          isArchived: false,
          sentAt: new Date(Date.now() - 7200000).toISOString(),
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          threadId: null,
          attachments: [{ name: 'schedule.pdf', size: 245000 }],
          labels: []
        }
      ]
    } else if (folder === 'sent') {
      // Include both the mock sent email and any actually sent emails
      const mockSentEmail = {
        id: '3',
        subject: 'Re: Application Approved',
        body: '<p>Your application has been approved. Welcome to FGC Kenya!</p>',
        plainText: 'Your application has been approved. Welcome to FGC Kenya!',
        toEmails: ['student@example.com'],
        ccEmails: [],
        bccEmails: [],
        senderId: authResult.user.id,
        sender: {
          email: authResult.user.email,
          name: 'Admin User'
        },
        isRead: true,
        isStarred: false,
        isDraft: false,
        isArchived: false,
        sentAt: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        threadId: null,
        attachments: [],
        labels: []
      }
      emails = [mockSentEmail, ...sentEmails]
    } else if (folder === 'drafts') {
      emails = [
        {
          id: '4',
          subject: 'Team Update - Draft',
          body: '<p>This is a draft email about the team update...</p>',
          plainText: 'This is a draft email about the team update...',
          toEmails: ['team@fgckenya.org'],
          ccEmails: [],
          bccEmails: [],
          senderId: authResult.user.id,
          sender: {
            email: authResult.user.email,
            name: 'Admin User'
          },
          isRead: true,
          isStarred: false,
          isDraft: true,
          isArchived: false,
          sentAt: null,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          threadId: null,
          attachments: [],
          labels: []
        }
      ]
    } else if (folder === 'starred') {
      emails = [
        {
          id: '2',
          subject: 'Meeting Schedule for Tomorrow',
          body: '<p>Please find attached the meeting schedule...</p>',
          plainText: 'Please find attached the meeting schedule...',
          toEmails: ['admin@fgckenya.org'],
          ccEmails: ['team@fgckenya.org'],
          bccEmails: [],
          senderId: 'coordinator',
          sender: {
            email: 'coordinator@fgckenya.org',
            name: 'Event Coordinator'
          },
          isRead: true,
          isStarred: true,
          isDraft: false,
          isArchived: false,
          sentAt: new Date(Date.now() - 7200000).toISOString(),
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          threadId: null,
          attachments: [{ name: 'schedule.pdf', size: 245000 }],
          labels: []
        }
      ]
    } else if (folder === 'archived') {
      emails = [
        {
          id: '5',
          subject: 'Old Newsletter - January 2024',
          body: '<p>This is an archived newsletter...</p>',
          plainText: 'This is an archived newsletter...',
          toEmails: ['all@fgckenya.org'],
          ccEmails: [],
          bccEmails: [],
          senderId: 'marketing',
          sender: {
            email: 'marketing@fgckenya.org',
            name: 'Marketing Team'
          },
          isRead: true,
          isStarred: false,
          isDraft: false,
          isArchived: true,
          sentAt: new Date('2024-01-15').toISOString(),
          createdAt: new Date('2024-01-15').toISOString(),
          threadId: null,
          attachments: [],
          labels: ['Newsletter']
        }
      ]
    } else if (folder === 'trash') {
      emails = [
        {
          id: '6',
          subject: 'Spam Message',
          body: '<p>This message was marked as spam...</p>',
          plainText: 'This message was marked as spam...',
          toEmails: ['admin@fgckenya.org'],
          ccEmails: [],
          bccEmails: [],
          senderId: 'unknown',
          sender: {
            email: 'spam@example.com',
            name: 'Unknown Sender'
          },
          isRead: true,
          isStarred: false,
          isDraft: false,
          isArchived: false,
          sentAt: new Date(Date.now() - 604800000).toISOString(),
          createdAt: new Date(Date.now() - 604800000).toISOString(),
          threadId: null,
          attachments: [],
          labels: ['Spam']
        }
      ]
    }

    // Apply search filter if provided
    if (search) {
      emails = emails.filter(email => 
        email.subject.toLowerCase().includes(search.toLowerCase()) ||
        email.plainText.toLowerCase().includes(search.toLowerCase()) ||
        email.sender.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        emails,
        totalPages: 1,
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
    
    // Create a sent email record
    const sentEmail = {
      id: `sent-${Date.now()}`,
      subject: body.subject || '(no subject)',
      body: body.body || '',
      plainText: body.body ? body.body.replace(/<[^>]*>/g, '') : '',
      toEmails: body.to || [],
      ccEmails: body.cc || [],
      bccEmails: body.bcc || [],
      senderId: authResult.user.id,
      sender: {
        email: authResult.user.email,
        name: 'Admin User'
      },
      isRead: true,
      isStarred: false,
      isDraft: false,
      isArchived: false,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      threadId: null,
      attachments: body.attachments || [],
      labels: []
    }
    
    // Add to sent emails
    sentEmails.unshift(sentEmail)
    
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