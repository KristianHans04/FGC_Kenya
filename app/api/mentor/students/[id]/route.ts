import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const user = authResult.user

    // Get active cohort for mentor
    const cohortMembership = await prisma.cohortMember.findFirst({
      where: {
        userId: user.id,
        role: 'MENTOR',
        isActive: true,
        OR: [
          { leftAt: null },
          { leftAt: { gt: new Date() } }
        ]
      },
      orderBy: {
        joinedAt: 'desc'
      }
    })

    if (!cohortMembership) {
      return NextResponse.json(
        { error: 'No active mentor cohort found' },
        { status: 404 }
      )
    }

    // Check mentor permissions
    const permissions = await prisma.mentorPermission.findUnique({
      where: {
        mentorId_cohort: {
          mentorId: user.id,
          cohort: cohortMembership.cohort
        }
      }
    })

    const now = new Date()
    if (!permissions || 
        !permissions.canAccessStudentDetails ||
        (permissions.validUntil && permissions.validUntil < now)) {
      return NextResponse.json(
        { error: 'No permission to access student details' },
        { status: 403 }
      )
    }

    // Check if this student is assigned to the mentor
    const mentorStudent = await prisma.mentorStudent.findFirst({
      where: {
        mentorId: user.id,
        student: {
          slug: id
        },
        cohort: cohortMembership.cohort,
        isActive: true
      },
      include: {
        student: {
          select: {
            id: true,
            slug: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            school: true,
            grade: true,
            county: true,
            parentName: true,
            parentEmail: true,
            parentPhone: true,
            createdAt: true,
            lastLoginAt: true,
            // Include all articles by the student
            articles: {
              select: {
                id: true,
                slug: true,
                title: true,
                excerpt: true,
                status: true,
                publishedAt: true,
                viewCount: true,
                likes: true
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        }
      }
    })

    if (!mentorStudent) {
      return NextResponse.json(
        { error: 'Student not found or not assigned to you' },
        { status: 404 }
      )
    }

    const student = mentorStudent.student

    // Format recent activity based on articles
    const recentActivity = student.articles.slice(0, 5).map(article => ({
      id: article.id,
      type: article.status === 'PUBLISHED' ? 'achievement' : 'submission' as const,
      title: article.title,
      timestamp: article.publishedAt ? 
        new Date(article.publishedAt).toLocaleDateString() : 
        'Draft',
      status: article.status === 'PUBLISHED' ? 'completed' : 'pending' as const
    }))

    // Mock achievements for now
    const achievements = student.articles
      .filter(a => a.status === 'PUBLISHED')
      .slice(0, 3)
      .map((article, index) => ({
        id: article.id,
        title: index === 0 ? 'First Article Published' : 
               index === 1 ? 'Content Creator' : 
               'Prolific Writer',
        description: `Published "${article.title}"`,
        earnedAt: article.publishedAt?.toISOString() || new Date().toISOString(),
        icon: index === 0 ? '🏆' : index === 1 ? '✍️' : '📚'
      }))
    
    return NextResponse.json({
      success: true,
      data: {
        id: student.slug,
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email,
        phone: student.phone || '',
        school: student.school || '',
        grade: student.grade || '',
        county: student.county || '',
        cohort: cohortMembership.cohort,
        joinedAt: student.createdAt.toISOString(),
        lastLoginAt: student.lastLoginAt?.toISOString() || null,
        parentInfo: {
          name: student.parentName || '',
          email: student.parentEmail || '',
          phone: student.parentPhone || ''
        },
        articles: student.articles,
        articlesCount: student.articles.length,
        publishedArticles: student.articles.filter(a => a.status === 'PUBLISHED').length,
        progress: {
          modulesCompleted: 8,
          totalModules: 12,
          assignmentsSubmitted: student.articles.length,
          totalAssignments: 20,
          averageScore: 85
        },
        achievements,
        recentActivity
      }
    })
  } catch (error) {
    console.error('Error fetching student details:', error)
    return NextResponse.json({ error: 'Failed to fetch student details' }, { status: 500 })
  }
}