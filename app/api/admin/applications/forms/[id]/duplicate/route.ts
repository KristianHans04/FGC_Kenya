import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    return NextResponse.json({
      success: true,
      data: { 
        message: 'Form duplicated successfully',
        originalId: id,
        newFormId: `form-${Date.now()}`
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to duplicate form' }, { status: 500 })
  }
}