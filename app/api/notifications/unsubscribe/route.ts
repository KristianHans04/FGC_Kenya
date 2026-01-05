import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken } from '@/app/lib/auth/jwt';

const prisma = new PrismaClient();

// POST: Unsubscribe from push notifications
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
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      );
    }

    // Deactivate the subscription
    await prisma.pushSubscription.updateMany({
      where: {
        endpoint,
        userId: decoded.userId
      },
      data: { isActive: false }
    });

    // Check if user has any other active subscriptions
    const activeCount = await prisma.pushSubscription.count({
      where: {
        userId: decoded.userId,
        isActive: true
      }
    });

    // If no active subscriptions, disable push in preferences
    if (activeCount === 0) {
      await prisma.notificationPreference.updateMany({
        where: { userId: decoded.userId },
        data: { pushEnabled: false }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Push subscription removed successfully'
    });
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}