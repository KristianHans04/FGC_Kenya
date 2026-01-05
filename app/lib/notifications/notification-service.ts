import { PrismaClient, NotificationType, User } from '@prisma/client';
import webpush from 'web-push';

const prisma = new PrismaClient();

// Initialize web-push with VAPID details
const initWebPush = () => {
  const vapidKeys = {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || ''
  };

  if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
    console.warn('VAPID keys not configured. Push notifications will not work.');
    return;
  }

  webpush.setVapidDetails(
    'mailto:' + (process.env.VAPID_EMAIL || 'noreply@fgckenya.com'),
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
};

// Initialize on module load
initWebPush();

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  data?: any;
}

export class NotificationService {
  // Send notification to user
  static async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      // Get user preferences
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId: payload.userId }
      });

      // Check if notifications are enabled
      if (!preferences) {
        // Create default preferences if not exist
        await prisma.notificationPreference.create({
          data: { userId: payload.userId }
        });
      }

      // Check quiet hours
      if (preferences && this.isInQuietHours(preferences)) {
        console.log('Notification delayed due to quiet hours');
        // Schedule for later or add to digest
        return;
      }

      // Save notification to database
      const notification = await prisma.notification.create({
        data: {
          userId: payload.userId,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          actionUrl: payload.actionUrl,
          data: payload.data
        }
      });

      // Send push notification if enabled
      if (preferences?.pushEnabled && this.shouldSendPush(preferences, payload.type)) {
        await this.sendPushNotification(payload.userId, notification.id, payload);
      }

      // Send email if enabled (integrate with existing email service)
      if (preferences?.emailEnabled && this.shouldSendEmail(preferences, payload.type)) {
        await this.sendEmailNotification(payload.userId, payload);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  // Send push notification
  private static async sendPushNotification(
    userId: string,
    notificationId: string,
    payload: NotificationPayload
  ): Promise<void> {
    try {
      // Get user's push subscriptions
      const subscriptions = await prisma.pushSubscription.findMany({
        where: {
          userId,
          isActive: true
        }
      });

      if (subscriptions.length === 0) {
        console.log('No active push subscriptions for user:', userId);
        return;
      }

      const pushPayload = JSON.stringify({
        title: payload.title,
        body: payload.message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: payload.type,
        data: {
          notificationId,
          url: payload.actionUrl || '/dashboard',
          ...payload.data
        }
      });

      // Send to all user's devices
      const sendPromises = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            },
            pushPayload
          );

          // Update last used
          await prisma.pushSubscription.update({
            where: { id: sub.id },
            data: { lastUsed: new Date() }
          });
        } catch (error: any) {
          console.error('Failed to send push to device:', error);
          
          // Handle expired subscriptions
          if (error.statusCode === 410) {
            await prisma.pushSubscription.update({
              where: { id: sub.id },
              data: { isActive: false }
            });
          }
        }
      });

      await Promise.allSettled(sendPromises);

      // Mark as delivered via push
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          sentViaPush: true,
          delivered: true,
          deliveredAt: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to send push notification:', error);
      throw error;
    }
  }

  // Send email notification (integrate with existing email service)
  private static async sendEmailNotification(
    userId: string,
    payload: NotificationPayload
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true, lastName: true }
      });

      if (!user) return;

      // Queue email for sending
      await prisma.emailQueue.create({
        data: {
          to: user.email,
          subject: payload.title,
          template: 'notification',
          data: {
            firstName: user.firstName,
            lastName: user.lastName,
            title: payload.title,
            message: payload.message,
            actionUrl: payload.actionUrl,
            type: payload.type
          }
        }
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  // Check if in quiet hours
  private static isInQuietHours(preferences: any): boolean {
    if (!preferences.quietHoursEnabled) return false;
    if (!preferences.quietHoursStart || !preferences.quietHoursEnd) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = preferences.quietHoursStart.split(':').map(Number);
    const [endHour, endMinute] = preferences.quietHoursEnd.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    // Check if it's weekend and weekend notifications are disabled
    const dayOfWeek = now.getDay();
    if ((dayOfWeek === 0 || dayOfWeek === 6) && !preferences.weekendNotifications) {
      return true;
    }

    // Handle overnight quiet hours
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime < endTime;
    } else {
      return currentTime >= startTime && currentTime < endTime;
    }
  }

  // Check if should send push for notification type
  private static shouldSendPush(preferences: any, type: NotificationType): boolean {
    const pushSettings: Record<string, NotificationType[]> = {
      pushOnMessage: ['NEW_MESSAGE', 'NEW_EMAIL'],
      pushOnCalendarEvent: ['EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_CANCELLED', 'EVENT_INVITATION', 'EVENT_RSVP'],
      pushOnCalendarReminder: ['EVENT_REMINDER'],
      pushOnTaskAssigned: ['TASK_ASSIGNED', 'TASK_UPDATED', 'TASK_DUE_SOON', 'TASK_OVERDUE'],
      pushOnApplicationUpdate: ['APPLICATION_SUBMITTED', 'APPLICATION_REVIEWED', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED', 'APPLICATION_SHORTLISTED', 'APPLICATION_INTERVIEW'],
      pushOnAnnouncement: ['ANNOUNCEMENT', 'MAINTENANCE', 'SECURITY_ALERT']
    };

    for (const [setting, types] of Object.entries(pushSettings)) {
      if (types.includes(type) && preferences[setting]) {
        return true;
      }
    }

    return false;
  }

  // Check if should send email for notification type
  private static shouldSendEmail(preferences: any, type: NotificationType): boolean {
    const emailSettings: Record<string, NotificationType[]> = {
      emailOnMessage: ['NEW_MESSAGE', 'NEW_EMAIL'],
      emailOnCalendarEvent: ['EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_CANCELLED', 'EVENT_INVITATION'],
      emailOnTaskAssigned: ['TASK_ASSIGNED', 'TASK_DUE_SOON', 'TASK_OVERDUE'],
      emailOnApplicationUpdate: ['APPLICATION_SUBMITTED', 'APPLICATION_REVIEWED', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED', 'APPLICATION_SHORTLISTED', 'APPLICATION_INTERVIEW'],
      emailOnAnnouncement: ['ANNOUNCEMENT', 'MAINTENANCE', 'SECURITY_ALERT']
    };

    for (const [setting, types] of Object.entries(emailSettings)) {
      if (types.includes(type) && preferences[setting]) {
        return true;
      }
    }

    return false;
  }

  // Send bulk notifications
  static async sendBulkNotification(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<void> {
    const promises = userIds.map(userId =>
      this.sendNotification({
        userId,
        type,
        title,
        message,
        actionUrl
      })
    );

    await Promise.allSettled(promises);
  }

  // Get user notifications
  static async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.update({
      where: {
        id: notificationId,
        userId // Ensure user owns the notification
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });
  }

  // Mark all as read
  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });
  }

  // Delete notification
  static async deleteNotification(notificationId: string, userId: string) {
    return prisma.notification.delete({
      where: {
        id: notificationId,
        userId // Ensure user owns the notification
      }
    });
  }

  // Get unread count
  static async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });
  }

  // Process notification digest
  static async processDigest(userId: string) {
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    if (!preferences?.digestEnabled) return;

    // Get unread notifications for digest
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        read: false,
        sentViaEmail: false
      },
      orderBy: { createdAt: 'desc' }
    });

    if (notifications.length === 0) return;

    // Group notifications by type
    const grouped = notifications.reduce((acc, notif) => {
      if (!acc[notif.type]) acc[notif.type] = [];
      acc[notif.type].push(notif);
      return acc;
    }, {} as Record<string, typeof notifications>);

    // Send digest email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true }
    });

    if (user) {
      await prisma.emailQueue.create({
        data: {
          to: user.email,
          subject: `Your ${preferences.digestFrequency.toLowerCase()} notification digest`,
          template: 'digest',
          data: {
            firstName: user.firstName,
            lastName: user.lastName,
            notifications: grouped,
            frequency: preferences.digestFrequency
          }
        }
      });

      // Mark notifications as sent via email
      await prisma.notification.updateMany({
        where: {
          id: { in: notifications.map(n => n.id) }
        },
        data: { sentViaEmail: true }
      });
    }
  }
}

export default NotificationService;