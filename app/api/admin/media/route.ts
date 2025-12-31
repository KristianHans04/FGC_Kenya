import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPER_ADMIN', 'MENTOR'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''

    // Mock media data
    const media = [
      {
        id: '1',
        title: 'Robot Assembly Guide',
        type: 'video',
        description: 'Complete guide for robot assembly',
        status: 'approved',
        uploadedBy: {
          id: 'student1',
          name: 'John Doe',
          cohort: '2024'
        },
        uploadedAt: new Date().toISOString(),
        approvedBy: authResult.user.role === ('MENTOR' as any) ? authResult.user.email : null,
        tags: ['robotics', 'assembly', 'tutorial'],
        views: 125,
        size: '45MB',
        url: '/media/video1.mp4'
      }
    ]

    return NextResponse.json({
      success: true,
      data: { media }
    })
  } catch (error) {
    console.error('Media fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media' },
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

    const formData = await req.formData()
    
    // Here you would handle file upload and media creation
    
    return NextResponse.json({
      success: true,
      data: { message: 'Media uploaded successfully' }
    })
  } catch (error) {
    console.error('Media upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPER_ADMIN', 'MENTOR'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { mediaId, action } = body

    if (!mediaId || !action) {
      return NextResponse.json(
        { error: 'Missing mediaId or action' },
        { status: 400 }
      )
    }

    // Here you would handle the media update based on action (publish, approve, reject)
    // For now, return success
    
    return NextResponse.json({
      success: true,
      data: { 
        message: `Media ${action} successfully`,
        mediaId,
        action 
      }
    })
  } catch (error) {
    console.error('Media update error:', error)
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    )
  }
}