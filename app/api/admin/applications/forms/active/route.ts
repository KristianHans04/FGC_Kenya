import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock active form data
    const activeForm = {
      id: '1',
      name: 'Student Application 2024',
      description: 'Main application form for 2024 cohort',
      status: 'active',
      fields: [
        { id: 'f1', type: 'text', label: 'Full Name', required: true },
        { id: 'f2', type: 'email', label: 'Email', required: true },
        { id: 'f3', type: 'tel', label: 'Phone Number', required: true },
        { id: 'f4', type: 'text', label: 'School', required: true },
        { id: 'f5', type: 'select', label: 'Grade Level', options: ['Form 1', 'Form 2', 'Form 3', 'Form 4'], required: true },
        { id: 'f6', type: 'textarea', label: 'Why do you want to join FGC Kenya?', required: true }
      ],
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: activeForm
    })
  } catch (error) {
    console.error('Active form fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch active form' },
      { status: 500 }
    )
  }
}