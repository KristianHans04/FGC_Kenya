import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/app/lib/auth/jwt';
import NotificationService from '@/app/lib/notifications/notification-service';

// POST: Mark all notifications as read
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

    const result = await NotificationService.markAllAsRead(decoded.userId);

    return NextResponse.json({
      success: true,
      message: `${result.count} notifications marked as read`
    });
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}