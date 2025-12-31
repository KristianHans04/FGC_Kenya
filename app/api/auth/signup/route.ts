/**
 * @file app/api/auth/signup/route.ts
 * @description API route for user signup with OTP
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { generateOTP } from '@/app/lib/auth/otp'
import { sendEmail } from '@/app/lib/email'
import { SECURITY, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/app/lib/constants'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// Validation schema for signup
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2).max(50).regex(/^[a-zA-Z\s-']+$/),
  lastName: z.string().min(2).max(50).regex(/^[a-zA-Z\s-']+$/),
  phone: z.string().regex(/^(\+254|0)[17]\d{8}$/),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = signupSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid input data',
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      )
    }

    const { email, firstName, lastName, phone } = validationResult.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // If user exists but not verified, allow re-registration
      if (!existingUser.emailVerified) {
        // Delete old OTP codes
        await prisma.oTPCode.deleteMany({
          where: { userId: existingUser.id },
        })

        // Update user details
        const user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            firstName,
            lastName,
            phone,
            updatedAt: new Date(),
          },
        })

        // Generate new OTP
        const otp = generateOTP()
        const expiresAt = new Date(Date.now() + SECURITY.OTP_EXPIRY_MINUTES * 60 * 1000)

        await prisma.oTPCode.create({
          data: {
            code: otp,
            type: 'VERIFY_EMAIL',
            expiresAt,
            userId: user.id,
          },
        })

        // Send verification email
        await sendEmail({
          to: email,
          subject: 'Verify Your Email - FIRST Global Team Kenya',
          template: 'otp_login',
          data: {
            name: firstName,
            otp,
            expiryMinutes: SECURITY.OTP_EXPIRY_MINUTES,
          },
        })

        return NextResponse.json(
          {
            success: true,
            message: SUCCESS_MESSAGES.AUTHENTICATION.OTP_SENT,
            data: {
              email,
              requiresVerification: true,
            },
          },
          { status: 200 }
        )
      }

      // User exists and is verified
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'An account with this email already exists',
          },
        },
        { status: 400 }
      )
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phone,
        role: 'USER',
        isActive: true,
        emailVerified: false,
      },
    })

    // Generate OTP for email verification
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + SECURITY.OTP_EXPIRY_MINUTES * 60 * 1000)

    await prisma.oTPCode.create({
      data: {
        code: otp,
        type: 'VERIFY_EMAIL',
        expiresAt,
        userId: newUser.id,
      },
    })

    // Send verification email
    await sendEmail({
      to: email,
      subject: 'Welcome to FIRST Global Team Kenya - Verify Your Email',
      template: 'welcome',
      data: {
        name: firstName,
        otp,
        expiryMinutes: SECURITY.OTP_EXPIRY_MINUTES,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.AUTHENTICATION.ACCOUNT_CREATED,
        data: {
          email,
          requiresVerification: true,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'An account with this email already exists',
            },
          },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: ERROR_MESSAGES.NETWORK.SERVER_ERROR,
        },
      },
      { status: 500 }
    )
  }
}