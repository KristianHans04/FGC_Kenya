/**
 * @file app/api/auth/signup/route.ts
 * @description API route for user signup with OTP
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { generateOTPCode } from '@/app/lib/auth/otp'
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
            details: validationResult.error.format(),
          },
        },
        { status: 400 }
      )
    }

    const { email, firstName, lastName, phone } = validationResult.data
  const school = '' // Default school value for new signups

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
        const otp = generateOTPCode()
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
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Welcome ${firstName}!</h2>
              <p>Your verification code is:</p>
              <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center; background: #f0f0f0; padding: 20px; border-radius: 8px;">${otp}</h1>
              <p>This code will expire in ${SECURITY.OTP_EXPIRY_MINUTES} minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
          `,
          text: `Welcome ${firstName}! Your verification code is: ${otp}. This code will expire in ${SECURITY.OTP_EXPIRY_MINUTES} minutes.`
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
        school,
        isActive: true,
        emailVerified: false,
      },
    })
    
    // Assign default USER role
    await prisma.userRole.create({
      data: {
        userId: newUser.id,
        role: 'USER',
        isActive: true,
        assignedBy: 'SYSTEM',
        notes: 'Default role for new signup',
      },
    })

    // Generate OTP for email verification
    const otp = generateOTPCode()
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
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Welcome to FIRST Global Team Kenya!</h1>
          <p>Hi ${firstName},</p>
          <p>Thank you for creating an account. Please verify your email address using the code below:</p>
          <h2 style="font-size: 32px; letter-spacing: 5px; text-align: center; background: #f0f0f0; padding: 20px; border-radius: 8px; color: #333;">${otp}</h2>
          <p>This code will expire in ${SECURITY.OTP_EXPIRY_MINUTES} minutes.</p>
          <p>Once verified, you can start your application to join the team!</p>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
        </div>
      `,
      text: `Welcome to FIRST Global Team Kenya! Hi ${firstName}, Your verification code is: ${otp}. This code will expire in ${SECURITY.OTP_EXPIRY_MINUTES} minutes.`
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