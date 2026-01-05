/**
 * @file app/api/admin/users/filters/route.ts
 * @description API endpoint to get filter options for user forms
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import { addSecurityHeaders } from '@/app/lib/middleware/security'
import prisma from '@/app/lib/db'
import type { ApiResponse, ErrorCode } from '@/app/types/api'

/**
 * GET /api/admin/users/filters
 * Get unique values for schools, cities, counties for autocomplete
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request)
    if (!authResult.user) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED' as ErrorCode,
              message: 'Not authenticated',
            },
          },
          { status: 401 }
        )
      )
    }

    // Check admin permissions
    if (authResult.user.role !== 'ADMIN' && authResult.user.role !== 'SUPER_ADMIN') {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN' as ErrorCode,
              message: 'Admin access required',
            },
          },
          { status: 403 }
        )
      )
    }

    // Get unique schools
    const schools = await prisma.user.findMany({
      where: {
        school: {
          not: null
        }
      },
      select: {
        school: true
      },
      distinct: ['school']
    })

    // Get unique addresses/locations for cities and counties
    const addresses = await prisma.user.findMany({
      where: {
        homeAddress: {
          not: null
        }
      },
      select: {
        homeAddress: true
      },
      distinct: ['homeAddress']
    })

    // Extract unique schools
    const uniqueSchools = schools
      .map(user => user.school)
      .filter(Boolean)
      .sort()

    // Extract cities from addresses (assuming format "City, County, Country")
    const cities = new Set<string>()
    const counties = new Set<string>()
    
    addresses.forEach(user => {
      if (user.homeAddress) {
        const parts = user.homeAddress.split(',').map(part => part.trim())
        if (parts.length >= 1 && parts[0]) cities.add(parts[0])
        if (parts.length >= 2 && parts[1]) counties.add(parts[1])
      }
    })

    // Standard year options for students
    const yearOptions = [
      'Form 1', 'Form 2', 'Form 3', 'Form 4',
      'Year 1', 'Year 2', 'Year 3', 'Year 4',
      'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
      'Alumni', 'Graduate', 'Undergraduate', 'Postgraduate'
    ]

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: {
          schools: uniqueSchools,
          cities: Array.from(cities).sort(),
          counties: Array.from(counties).sort(),
          years: yearOptions
        }
      })
    )
  } catch (error) {
    console.error('Get filters error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to get filter options',
          },
        },
        { status: 500 }
      )
    )
  }
}