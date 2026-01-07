import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Get students assigned to this mentor in the cohort
    const mentorStudents = await prisma.mentorStudent.findMany({
      where: {
        mentorId: user.id,
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
            createdAt: true,
            lastLoginAt: true,
            // Include articles authored by students
            articles: {
              where: {
                status: 'PUBLISHED'
              },
              select: {
                id: true,
                slug: true,
                title: true,
                publishedAt: true,
                viewCount: true
              },
              orderBy: {
                publishedAt: 'desc'
              },
              take: 5
            }
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    })

    // Format the student data
    const students = mentorStudents.map(ms => {
      const student = ms.student
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      
      return {
        id: student.slug,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
        name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email.split('@')[0],
        phone: student.phone || '',
        school: student.school || '',
        grade: student.grade || '',
        county: student.county || '',
        cohort: cohortMembership.cohort,
        joinedAt: student.createdAt.toISOString(),
        lastActive: student.lastLoginAt ? 
          (student.lastLoginAt > weekAgo ? 'Recently active' : 
           `${Math.floor((Date.now() - student.lastLoginAt.getTime()) / (24 * 60 * 60 * 1000))} days ago`) 
          : 'Never logged in',
        status: student.lastLoginAt && student.lastLoginAt > weekAgo ? 'active' : 'inactive',
        assignedAt: ms.assignedAt.toISOString(),
        notes: ms.notes,
        articles: student.articles,
        articlesCount: student.articles.length,
        // Mock progress data for now - can be expanded with actual tracking
        progress: 75,
        modules: {
          completed: 9,
          total: 12
        },
        achievements: 5
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        cohort: cohortMembership.cohort,
        students,
        totalCount: students.length
      }
    })
  } catch (error) {
    console.error('Error fetching mentor students:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}
