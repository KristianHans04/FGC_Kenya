import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Mock forms data
    const forms = [
      {
        id: '1',
        name: 'Student Application 2024',
        description: 'Main application form for 2024 cohort',
        status: 'active',
        fields: [
          { id: 'f1', type: 'text', label: 'Full Name', required: true },
          { id: 'f2', type: 'email', label: 'Email', required: true },
          { id: 'f3', type: 'textarea', label: 'Why do you want to join?', required: true }
        ],
        submissions: 145,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    return NextResponse.json({
      success: true,
      data: { forms }
    })
  } catch (error) {
    console.error('Forms fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forms' },
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
    
    return NextResponse.json({
      success: true,
      data: { message: 'Form created successfully', formId: 'new-form-id' }
    })
  } catch (error) {
    console.error('Form creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create form' },
      { status: 500 }
    )
  }
}