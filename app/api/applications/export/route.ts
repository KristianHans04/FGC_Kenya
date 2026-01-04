import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authenticateRequest } from '@/app/lib/middleware/auth'

// GET /api/applications/export - Export applications data
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: { message: authResult.error } },
        { status: 401 }
      )
    }

    // Only admins can export data
    if (authResult.user?.role !== 'ADMIN' && authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: { message: 'Insufficient permissions' } },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const formId = searchParams.get('formId')
    const format = searchParams.get('format') || 'json'

    if (!formId) {
      return NextResponse.json(
        { error: { message: 'Form ID is required' } },
        { status: 400 }
      )
    }

    // Get the form to understand structure
    const form = await prisma.applicationForm.findUnique({
      where: { id: formId }
    })

    if (!form) {
      return NextResponse.json(
        { error: { message: 'Form not found' } },
        { status: 404 }
      )
    }

    // Get all applications for this form
    const applications = await prisma.application.findMany({
      where: {
        formId,
        status: { not: 'DRAFT' }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            school: true
          }
        }
      },
      orderBy: {
        submittedAt: 'asc'
      }
    })

    // Format data based on request
    if (format === 'csv') {
      const csv = await formatAsCSV(applications, form.tabs as any)
      
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="applications-${form.season}.csv"`
        }
      })
    } else {
      // JSON format
      const exportData = applications.map(app => ({
        id: app.id,
        status: app.status,
        submittedAt: app.submittedAt,
        user: {
          email: app.user.email,
          name: `${app.user.firstName} ${app.user.lastName}`,
          phone: app.user.phone,
          school: app.user.school
        },
        responses: app.responses,
        reviewedBy: app.reviewedBy,
        reviewedAt: app.reviewedAt,
        reviewNotes: app.reviewNotes
      }))

      // Log the export action
      await prisma.auditLog.create({
        data: {
          action: 'ADMIN_EXPORTED_DATA',
          entityType: 'ApplicationForm',
          entityId: formId,
          details: {
            format,
            count: applications.length,
            season: form.season
          },
          userId: authResult.user?.id
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          form: {
            id: form.id,
            season: form.season,
            title: form.title
          },
          exportDate: new Date().toISOString(),
          totalApplications: applications.length,
          applications: exportData
        }
      })
    }
  } catch (error) {
    console.error('Error exporting applications:', error)
    return NextResponse.json(
      { error: { message: 'Failed to export applications' } },
      { status: 500 }
    )
  }
}

// Helper function to format data as CSV
async function formatAsCSV(applications: any[], tabs: any[]): Promise<string> {
  const headers: string[] = [
    'Application ID',
    'Status',
    'Submitted At',
    'Email',
    'First Name',
    'Last Name',
    'Phone',
    'School'
  ]

  // Add field headers from form tabs
  tabs.forEach(tab => {
    if (tab.fields && Array.isArray(tab.fields)) {
      tab.fields.forEach((field: any) => {
        headers.push(field.label || field.id)
      })
    }
  })

  headers.push('Reviewed By', 'Reviewed At', 'Review Notes')

  // Create CSV rows
  const rows = applications.map(app => {
    const row = [
      app.id,
      app.status,
      app.submittedAt ? new Date(app.submittedAt).toISOString() : '',
      app.user.email,
      app.user.firstName,
      app.user.lastName,
      app.user.phone || '',
      app.user.school || ''
    ]

    // Add form data
    const responses = app.responses as any
    tabs.forEach(tab => {
      if (tab.fields && Array.isArray(tab.fields)) {
        tab.fields.forEach((field: any) => {
          const value = responses[field.id] || ''
          row.push(typeof value === 'object' ? JSON.stringify(value) : String(value))
        })
      }
    })

    row.push(
      app.reviewedBy || '',
      app.reviewedAt ? new Date(app.reviewedAt).toISOString() : '',
      app.reviewNotes || ''
    )

    return row
  })

  // Escape CSV values
  const escapeCSV = (value: string) => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  // Build CSV string
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n')

  return csvContent
}