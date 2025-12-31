/**
 * Payment tracking API for Super Admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, type AuthenticatedRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/db'
import { addSecurityHeaders } from '@/app/lib/middleware/security'

export async function GET(request: NextRequest) {
  try {
    // Only super admin can view payments
    const authResult = await requireSuperAdmin(request, {})
    if (authResult) return authResult

    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Last 100 payments
    })

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: { payments }
      })
    )
  } catch (error) {
    console.error('Failed to fetch payments:', error)
    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch payments'
          }
        },
        { status: 500 }
      )
    )
  }
}