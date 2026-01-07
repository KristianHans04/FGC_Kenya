import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authenticateRequest } from '@/app/lib/middleware/auth'

// GET /api/admin/applications/calls - Get all application forms (calls)
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: { message: authResult.error } },
        { status: 401 }
      )
    }

    // Only admins can view application calls
    if (authResult.user?.role !== 'ADMIN' && authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: { message: 'Insufficient permissions' } },
        { status: 403 }
      )
    }

    // Get all application forms (which represent application calls)
    const forms = await prisma.applicationForm.findMany({
      include: {
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform forms to application calls format
    const calls = forms.map(form => ({
      id: form.id,
      title: form.title,
      description: form.description,
      season: form.season,
      isActive: form.isActive,
      isDraft: form.isDraft,
      applicationCount: form._count.applications,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt
    }))

    return NextResponse.json({
      success: true,
      data: { calls }
    })
  } catch (error) {
    console.error('Error fetching application calls:', error)
    return NextResponse.json(
      { error: { message: 'Failed to fetch application calls' } },
      { status: 500 }
    )
  }
}

// POST /api/admin/applications/calls - Create new application call
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: { message: authResult.error } },
        { status: 401 }
      )
    }

    // Only admins can create calls
    if (authResult.user?.role !== 'ADMIN' && authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: { message: 'Insufficient permissions' } },
        { status: 403 }
      )
    }

    const data = await request.json()

    // Check if season already exists
    const existingForm = await prisma.applicationForm.findUnique({
      where: {
        season: data.season
      }
    })

    if (existingForm) {
      return NextResponse.json(
        { error: { message: 'An application form for this season already exists' } },
        { status: 400 }
      )
    }

    // Create the application form
    const form = await prisma.applicationForm.create({
      data: {
        title: data.title,
        description: data.description,
        season: data.season,
        tabs: data.tabs || [],
        openDate: data.openDate || new Date(),
        closeDate: data.closeDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: data.isActive || false,
        isDraft: data.isDraft ?? true,
        themeColor: data.themeColor,
        accentColor: data.accentColor,
        coverImage: data.coverImage,
        allowSaveDraft: data.allowSaveDraft ?? true,
        requireDocumentLinks: data.requireDocumentLinks ?? true,
        enableAutoFill: data.enableAutoFill ?? true,
        createdById: authResult.user?.id || ''
      }
    })

    return NextResponse.json({
      success: true,
      data: { 
        call: {
          id: form.id,
          title: form.title,
          description: form.description,
          season: form.season,
          isActive: form.isActive,
          isDraft: form.isDraft
        }
      }
    })
  } catch (error) {
    console.error('Error creating application call:', error)
    return NextResponse.json(
      { error: { message: 'Failed to create application call' } },
      { status: 500 }
    )
  }
}