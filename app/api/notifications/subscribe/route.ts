import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken } from '@/app/lib/auth/jwt';

const prisma = new PrismaClient();

// POST: Subscribe to push notifications
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { subscription, deviceInfo } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint }
    });

    if (existing) {
      // Update existing subscription
      await prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          isActive: true,
          lastUsed: new Date(),
          deviceType: deviceInfo?.deviceType,
          browser: deviceInfo?.browser,
          os: deviceInfo?.os
        }
      });
    } else {
      // Create new subscription
      await prisma.pushSubscription.create({
        data: {
          userId: decoded.userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          deviceType: deviceInfo?.deviceType,
          browser: deviceInfo?.browser,
          os: deviceInfo?.os
        }
      });

      // Enable push notifications in preferences if first subscription
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId: decoded.userId }
      });

      if (!preferences) {
        await prisma.notificationPreference.create({
          data: {
            userId: decoded.userId,
            pushEnabled: true
          }
        });
      } else if (!preferences.pushEnabled) {
        await prisma.notificationPreference.update({
          where: { id: preferences.id },
          data: { pushEnabled: true }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Push subscription saved successfully'
    });
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save push subscription' },
      { status: 500 }
    );
  }
}