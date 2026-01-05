import { Metadata } from 'next';
import NotificationPreferences from '@/app/components/notifications/NotificationPreferences';
import { Bell, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Notification Settings | FGC Kenya',
  description: 'Manage your notification preferences for FGC Kenya',
};

export default function NotificationSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center">
            <div className="p-3 bg-primary/10 rounded-lg mr-4">
              <Bell className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Notification Settings</h1>
              <p className="text-muted-foreground mt-1">
                Manage how you receive notifications from FGC Kenya
              </p>
            </div>
          </div>
        </div>

        {/* Settings Component */}
        <NotificationPreferences />

        {/* Additional Information */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-semibold text-foreground mb-3">About Notifications</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Email notifications are sent to your registered email address</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Push notifications work when you have the app installed or the website open</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Quiet hours prevent non-urgent notifications during specified times</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Digest emails compile multiple notifications into a single email</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}