/**
 * @file app/lib/ai/openrouter.ts
 * @description OpenRouter AI integration for generating application questions
 * @author Team Kenya Dev
 */

// Rate limiter for AI requests (simple in-memory implementation for development)
// In production, use Redis-based rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(userId: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const key = `ai:${userId}`
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (entry.count >= maxRequests) {
    return false
  }

  entry.count++
  return true
}

interface AIRequest {
  userId: string
  applicationData: Record<string, unknown>
  context: string
}

interface AIResponse {
  success: boolean
  questions?: string[]
  error?: string
}

/**
 * Generate tailored questions for application based on user submissions
 */
export async function generateApplicationQuestions(request: AIRequest): Promise<AIResponse> {
  try {
    // Rate limiting (10 requests per minute per user)
    const rateLimitSuccess = checkRateLimit(request.userId, 10, 60 * 1000)
    if (!rateLimitSuccess) {
      return {
        success: false,
        error: 'AI request rate limit exceeded. Please try again later.'
      }
    }

    // Validate input
    if (!request.applicationData || typeof request.applicationData !== 'object') {
      return {
        success: false,
        error: 'Invalid application data provided'
      }
    }

    // Sanitize and prepare context
    const context = prepareContext(request.applicationData)

    // Generate prompt
    const prompt = createQuestionPrompt(context, request.context)

    // Make AI request
    const response = await makeOpenRouterRequest(prompt)

    if (!response.success) {
      return {
        success: false,
        error: response.error || 'Failed to generate questions'
      }
    }

    // Parse and validate questions
    const questions = parseQuestions(response.content || '')

    return {
      success: true,
      questions
    }
  } catch (error) {
    console.error('AI question generation error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while generating questions'
    }
  }
}

/**
 * Prepare application data context for AI processing
 */
export function prepareContext(applicationData: Record<string, unknown>): string {
  const safeFields = [
    'firstName', 'lastName', 'school', 'grade', 'county',
    'experience', 'interests', 'motivation', 'additionalInfo'
  ]

  const context: string[] = []

  for (const field of safeFields) {
    const value = applicationData[field]
    if (value && typeof value === 'string' && value.trim()) {
      context.push(`${field}: ${value.trim()}`)
    } else if (Array.isArray(value) && value.length > 0) {
      context.push(`${field}: ${value.join(', ')}`)
    }
  }

  return context.join('\n')
}

/**
 * Create the AI prompt for question generation
 */
function createQuestionPrompt(context: string, additionalContext: string): string {
  return `You are an AI assistant helping FIRST Global Challenge Team Kenya evaluate student applications. Based on the following student information, generate exactly 3 thoughtful, specific questions that would help assess their robotics knowledge, passion, and suitability for the FIRST Global Challenge program.

Student Information:
${context}

Additional Context: ${additionalContext}

Requirements:
1. Each question should be directly relevant to FIRST Global robotics competitions
2. Questions should probe deeper into their stated interests and experiences
3. Avoid generic questions - make them specific to the information provided
4. Focus on technical understanding, problem-solving, and team collaboration
5. Questions should be appropriate for high school students

Generate exactly 3 questions, one per line, without numbering or bullet points.

Example format:
What specific sensors did you use in your robotics project and how did they contribute to the robot's functionality?
Can you explain the programming logic you implemented for autonomous navigation in your competition robot?
How did your team's collaborative problem-solving approach help overcome technical challenges during the competition?

Questions:`
}

/**
 * Make request to OpenRouter API
 */
async function makeOpenRouterRequest(prompt: string): Promise<{ success: boolean; content?: string; error?: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY
  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
  const model = process.env.AI_MODEL || 'gpt-3.5-turbo'
  const maxTokens = parseInt(process.env.AI_MAX_TOKENS || '500')
  const temperature = parseFloat(process.env.AI_TEMPERATURE || '0.7')

  if (!apiKey) {
    return {
      success: false,
      error: 'AI service not configured'
    }
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'FIRST Global Team Kenya Application System'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }),
      // Timeout after 30 seconds
      signal: AbortSignal.timeout(parseInt(process.env.AI_REQUEST_TIMEOUT || '30000'))
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenRouter API error:', response.status, errorData)
      return {
        success: false,
        error: `AI service error: ${response.status}`
      }
    }

    const data = await response.json()

    if (!data.choices?.[0]?.message?.content) {
      return {
        success: false,
        error: 'Invalid AI response format'
      }
    }

    return {
      success: true,
      content: data.choices[0].message.content.trim()
    }
  } catch (error) {
    console.error('OpenRouter request error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI request failed'
    }
  }
}

/**
 * Parse and validate questions from AI response
 */
function parseQuestions(content: string): string[] {
  // Split by newlines and clean up
  const questions = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 10 && !line.match(/^\d+\./)) // Remove numbered lines
    .filter(line => line.endsWith('?')) // Only keep questions
    .slice(0, 3) // Limit to 3 questions

  // Ensure we have at least 1 question
  if (questions.length === 0) {
    return ['Can you tell us more about your robotics experience and what interests you most about FIRST Global Challenge?']
  }

  return questions
}

/**
 * Validate AI-generated questions for safety
 */
export function validateQuestions(questions: string[]): boolean {
  if (!Array.isArray(questions) || questions.length === 0 || questions.length > 3) {
    return false
  }

  for (const question of questions) {
    // Check for inappropriate content
    if (question.length < 10 || question.length > 200) {
      return false
    }

    // Check for potentially harmful patterns
    if (question.match(/(password|secret|private|personal.*information)/i)) {
      return false
    }

    // Must end with question mark
    if (!question.trim().endsWith('?')) {
      return false
    }
  }

  return true
}

/**
 * Log AI usage for monitoring
 */
export async function logAIUsage(
  userId: string,
  action: string,
  success: boolean,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    // In a real implementation, this would log to a database or monitoring service
    console.log('AI Usage:', {
      userId,
      action,
      success,
      timestamp: new Date().toISOString(),
      metadata
    })
  } catch (error) {
    console.error('Failed to log AI usage:', error)
  }
}