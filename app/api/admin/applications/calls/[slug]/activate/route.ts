import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authenticateRequest } from '@/app/lib/middleware/auth'

// POST /api/admin/applications/calls/[slug]/activate - Activate an application call
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: { message: authResult.error } },
        { status: 401 }
      )
    }

    // Only admins can activate calls
    if (authResult.user?.role !== 'ADMIN' && authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: { message: 'Insufficient permissions' } },
        { status: 403 }
      )
    }

    const { slug } = await params

    // First deactivate all other forms
    await prisma.applicationForm.updateMany({
      where: {
        isActive: true
      },
      data: {
        isActive: false
      }
    })

    // Activate the specified form
    const form = await prisma.applicationForm.update({
      where: {
        id: slug
      },
      data: {
        isActive: true,
        isDraft: false // Also mark as not draft when activating
      }
    })

    return NextResponse.json({
      success: true,
      data: { 
        message: 'Application call activated successfully',
        call: {
          id: form.id,
          title: form.title,
          season: form.season,
          isActive: form.isActive
        }
      }
    })
  } catch (error) {
    console.error('Error activating application call:', error)
    return NextResponse.json(
      { error: { message: 'Failed to activate application call' } },
      { status: 500 }
    )
  }
}