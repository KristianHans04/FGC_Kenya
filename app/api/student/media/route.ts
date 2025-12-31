import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock student media data
    const media = [
      {
        id: 'media1',
        title: 'Robot Assembly Tutorial',
        type: 'video',
        status: 'approved',
        description: 'Step-by-step guide for assembling the robot base',
        uploadedAt: new Date().toISOString(),
        approvedBy: 'Mentor John',
        views: 45,
        size: '125 MB',
        url: '/media/video1.mp4'
      },
      {
        id: 'media2',
        title: 'Competition Strategy Document',
        type: 'document',
        status: 'pending',
        description: 'Our team strategy for the upcoming competition',
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        views: 12,
        size: '2.3 MB',
        url: '/media/doc1.pdf'
      },
      {
        id: 'media3',
        title: 'Team Photo at Workshop',
        type: 'image',
        status: 'rejected',
        description: 'Team collaboration during the weekend workshop',
        uploadedAt: new Date(Date.now() - 172800000).toISOString(),
        rejectionReason: 'Image quality too low',
        views: 8,
        size: '4.5 MB',
        url: '/media/image1.jpg'
      }
    ]

    return NextResponse.json({
      success: true,
      data: { media }
    })
  } catch (error) {
    console.error('Student media fetch error:', error)
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

    // Handle media upload
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