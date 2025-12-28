/**
 * @file app/api/ai/questions/route.ts
 * @description API endpoint for generating AI-powered application questions
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAnyAuth, createAuditLog } from '@/app/lib/middleware/auth'
import { rateLimit } from '@/app/lib/middleware/security'
import { addSecurityHeaders } from '@/app/lib/middleware/security'
import { generateApplicationQuestions, validateQuestions, logAIUsage } from '@/app/lib/ai/openrouter'
import type { ApiResponse, ErrorCode } from '@/app/types/api'
import type { AuthenticatedRequest } from '@/app/lib/middleware/auth'

/**
 * POST /api/ai/questions
 * Generate AI-powered questions for application review
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting for AI requests
    const rateLimitResult = rateLimit(request, 'api')
    if (rateLimitResult) return rateLimitResult

    // Authentication
    const authResult = await requireAnyAuth(request)
    if (authResult) return authResult

    const authenticatedRequest = request as AuthenticatedRequest
    const { user } = authenticatedRequest

    if (!user) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED' as ErrorCode,
              message: 'Authentication required',
            },
          },
          { status: 401 }
        )
      )
    }

    // Parse request body
    const body = await request.json()
    const { applicationData, context } = body

    // Validate input
    if (!applicationData || typeof applicationData !== 'object') {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR' as ErrorCode,
              message: 'Application data is required',
            },
          },
          { status: 400 }
        )
      )
    }

    // Generate questions
    const aiResult = await generateApplicationQuestions({
      userId: user.id,
      applicationData,
      context: context || 'FIRST Global Challenge application review'
    })

    if (!aiResult.success) {
      // Log failed AI usage
      await logAIUsage(user.id, 'generate_questions', false, {
        error: aiResult.error,
        applicationData: Object.keys(applicationData)
      })

      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'AI_ERROR' as ErrorCode,
              message: aiResult.error || 'Failed to generate questions',
            },
          },
          { status: 500 }
        )
      )
    }

    // Validate generated questions
    if (!aiResult.questions || !validateQuestions(aiResult.questions)) {
      await logAIUsage(user.id, 'generate_questions', false, {
        error: 'Invalid questions generated',
        questionCount: aiResult.questions?.length
      })

      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'AI_VALIDATION_ERROR' as ErrorCode,
              message: 'Generated questions failed validation',
            },
          },
          { status: 500 }
        )
      )
    }

    // Log successful AI usage
    await logAIUsage(user.id, 'generate_questions', true, {
      questionCount: aiResult.questions.length,
      applicationData: Object.keys(applicationData)
    })

    // Create audit log
    await createAuditLog(
      'AI_QUESTIONS_GENERATED',
      'Application',
      'ai-generated',
      {
        userId: user.id,
        questionCount: aiResult.questions.length,
        applicationFields: Object.keys(applicationData)
      },
      authenticatedRequest
    )

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: {
          questions: aiResult.questions
        }
      } as ApiResponse<{ questions: string[] }>)
    )
  } catch (error) {
    console.error('AI questions API error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'An unexpected error occurred',
          },
        },
        { status: 500 }
      )
    )
  }
}

/**
 * Handle OPTIONS request for CORS
 */
export async function OPTIONS(): Promise<NextResponse> {
  return addSecurityHeaders(new NextResponse(null, { status: 200 }))
}