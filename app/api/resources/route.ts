import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { getCurrentUser } from '@/app/lib/auth'
import { ResourceCategory } from '@prisma/client'
import { z } from 'zod'

const CreateResourceSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.nativeEnum(ResourceCategory),
  fileUrl: z.string().url().optional(),
  linkUrl: z.string().url().optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().default(false)
})

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') as ResourceCategory | null
    const tag = searchParams.get('tag')
    const isPinned = searchParams.get('isPinned') === 'true'
    const search = searchParams.get('search')
    const uploadedById = searchParams.get('uploadedById')

    const where: any = {}

    if (category) {
      where.category = category
    }

    if (tag) {
      where.tags = { has: tag }
    }

    if (isPinned !== null) {
      where.isPinned = isPinned
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ]
    }

    if (uploadedById) {
      where.uploadedById = uploadedById
    }

    const resources = await prisma.teamResource.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: resources
    })
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = CreateResourceSchema.parse(body)

    // Validate that at least one content type is provided
    if (!validatedData.fileUrl && !validatedData.linkUrl && !validatedData.content) {
      return NextResponse.json(
        { error: 'Resource must have at least one content type (file, link, or content)' },
        { status: 400 }
      )
    }

    // Only admins can pin resources
    if (validatedData.isPinned && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      validatedData.isPinned = false
    }

    const resource = await prisma.teamResource.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        fileUrl: validatedData.fileUrl,
        linkUrl: validatedData.linkUrl,
        content: validatedData.content,
        tags: validatedData.tags || [],
        isPinned: validatedData.isPinned,
        uploadedById: user.id
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: resource
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Error creating resource:', error)
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    )
  }
}