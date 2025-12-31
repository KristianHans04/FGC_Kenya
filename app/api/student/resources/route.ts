import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      data: { resources: [] }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 })
  }
}
