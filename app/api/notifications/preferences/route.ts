import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken } from '@/app/lib/auth/jwt';

const prisma = new PrismaClient();

// GET: Fetch user notification preferences
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId: decoded.userId }
    });

    // Create default preferences if not exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId: decoded.userId,
          emailEnabled: true,
          pushEnabled: false,
          emailOnMessage: true,
          emailOnCalendarEvent: true,
          emailOnTaskAssigned: true,
          emailOnApplicationUpdate: true,
          emailOnAnnouncement: true,
          pushOnMessage: true,
          pushOnCalendarEvent: true,
          pushOnTaskAssigned: true,
          pushOnApplicationUpdate: true,
          pushOnAnnouncement: true,
          pushOnCalendarReminder: true,
          quietHoursEnabled: false,
          weekendNotifications: true,
          digestEnabled: false,
          digestFrequency: 'DAILY'
        }
      });
    }

    // Get push subscription status
    const pushSubscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: decoded.userId,
        isActive: true
      },
      select: {
        id: true,
        deviceType: true,
        browser: true,
        os: true,
        lastUsed: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        preferences,
        pushSubscriptions,
        hasPushSubscription: pushSubscriptions.length > 0
      }
    });
  } catch (error) {
    console.error('Failed to fetch preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// PUT: Update notification preferences
export async function PUT(req: NextRequest) {
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
    
    // Remove non-updatable fields
    delete body.id;
    delete body.userId;
    delete body.createdAt;
    delete body.updatedAt;

    // Validate quiet hours format if provided
    if (body.quietHoursStart && !/^\d{2}:\d{2}$/.test(body.quietHoursStart)) {
      return NextResponse.json(
        { error: 'Invalid quiet hours start format (use HH:MM)' },
        { status: 400 }
      );
    }
    
    if (body.quietHoursEnd && !/^\d{2}:\d{2}$/.test(body.quietHoursEnd)) {
      return NextResponse.json(
        { error: 'Invalid quiet hours end format (use HH:MM)' },
        { status: 400 }
      );
    }

    // Update or create preferences
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: decoded.userId },
      update: body,
      create: {
        userId: decoded.userId,
        ...body
      }
    });

    return NextResponse.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Failed to update preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

// DELETE: Reset preferences to default
export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Delete existing preferences (will be recreated with defaults on next GET)
    await prisma.notificationPreference.deleteMany({
      where: { userId: decoded.userId }
    });

    return NextResponse.json({
      success: true,
      message: 'Preferences reset to default'
    });
  } catch (error) {
    console.error('Failed to reset preferences:', error);
    return NextResponse.json(
      { error: 'Failed to reset preferences' },
      { status: 500 }
    );
  }
}