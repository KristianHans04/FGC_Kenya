'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { Bell, Mail, Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';
import pwaManager from '@/app/lib/pwa/pwa-manager';

interface Preferences {
  emailEnabled: boolean;
  emailOnMessage: boolean;
  emailOnCalendarEvent: boolean;
  emailOnTaskAssigned: boolean;
  emailOnApplicationUpdate: boolean;
  emailOnAnnouncement: boolean;
  pushEnabled: boolean;
  pushOnMessage: boolean;
  pushOnCalendarEvent: boolean;
  pushOnTaskAssigned: boolean;
  pushOnApplicationUpdate: boolean;
  pushOnAnnouncement: boolean;
  pushOnCalendarReminder: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  weekendNotifications: boolean;
  digestEnabled: boolean;
  digestFrequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  digestTime: string;
}

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [hasPushSubscription, setHasPushSubscription] = useState(false);

  useEffect(() => {
    loadPreferences();
    checkPushPermission();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.data.preferences);
        setHasPushSubscription(data.data.hasPushSubscription);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPushPermission = () => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  };

  const savePreferences = async (updates: Partial<Preferences>) => {
    if (!preferences) return;

    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.data);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof Preferences, value: boolean) => {
    if (!preferences) return;

    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    savePreferences({ [key]: value });
  };

  const requestPushPermission = async () => {
    const permission = await pwaManager.requestNotificationPermission();
    setPushPermission(permission);
    
    if (permission === 'granted') {
      // Initialize push notifications
      await pwaManager.init();
      setHasPushSubscription(true);
      handleToggle('pushEnabled', true);
    }
  };

  const testNotification = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: 'ANNOUNCEMENT',
          title: 'Test Notification',
          message: 'This is a test notification to verify your settings are working correctly.',
          actionUrl: '/dashboard'
        })
      });

      if (response.ok) {
        alert('Test notification sent! Check your notification channels.');
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      alert('Failed to send test notification');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <div className="space-y-6">
      {/* Push Notification Permission */}
      {pushPermission !== 'granted' && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start">
            <Bell className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">Enable Push Notifications</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Get instant updates even when you're not using the app
              </p>
              <button
                onClick={requestPushPermission}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
              >
                Enable Push Notifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Notifications */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold text-card-foreground">Email Notifications</h3>
          </div>
          <Switch
            checked={preferences.emailEnabled}
            onChange={(value) => handleToggle('emailEnabled', value)}
            className={`${
              preferences.emailEnabled ? 'bg-primary' : 'bg-muted'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
          >
            <span className="sr-only">Enable email notifications</span>
            <span
              className={`${
                preferences.emailEnabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </Switch>
        </div>

        {preferences.emailEnabled && (
          <div className="space-y-3 mt-4">
            <NotificationToggle
              label="Messages & Emails"
              enabled={preferences.emailOnMessage}
              onChange={(value) => handleToggle('emailOnMessage', value)}
            />
            <NotificationToggle
              label="Calendar Events"
              enabled={preferences.emailOnCalendarEvent}
              onChange={(value) => handleToggle('emailOnCalendarEvent', value)}
            />
            <NotificationToggle
              label="Task Assignments"
              enabled={preferences.emailOnTaskAssigned}
              onChange={(value) => handleToggle('emailOnTaskAssigned', value)}
            />
            <NotificationToggle
              label="Application Updates"
              enabled={preferences.emailOnApplicationUpdate}
              onChange={(value) => handleToggle('emailOnApplicationUpdate', value)}
            />
            <NotificationToggle
              label="Announcements"
              enabled={preferences.emailOnAnnouncement}
              onChange={(value) => handleToggle('emailOnAnnouncement', value)}
            />
          </div>
        )}
      </div>

      {/* Push Notifications */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bell className="w-5 h-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold text-card-foreground">Push Notifications</h3>
          </div>
          <Switch
            checked={preferences.pushEnabled}
            onChange={(value) => handleToggle('pushEnabled', value)}
            disabled={pushPermission !== 'granted'}
            className={`${
              preferences.pushEnabled ? 'bg-primary' : 'bg-muted'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50`}
          >
            <span className="sr-only">Enable push notifications</span>
            <span
              className={`${
                preferences.pushEnabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </Switch>
        </div>

        {preferences.pushEnabled && pushPermission === 'granted' && (
          <div className="space-y-3 mt-4">
            <NotificationToggle
              label="Messages & Emails"
              enabled={preferences.pushOnMessage}
              onChange={(value) => handleToggle('pushOnMessage', value)}
            />
            <NotificationToggle
              label="Calendar Events"
              enabled={preferences.pushOnCalendarEvent}
              onChange={(value) => handleToggle('pushOnCalendarEvent', value)}
            />
            <NotificationToggle
              label="Calendar Reminders"
              enabled={preferences.pushOnCalendarReminder}
              onChange={(value) => handleToggle('pushOnCalendarReminder', value)}
            />
            <NotificationToggle
              label="Task Assignments"
              enabled={preferences.pushOnTaskAssigned}
              onChange={(value) => handleToggle('pushOnTaskAssigned', value)}
            />
            <NotificationToggle
              label="Application Updates"
              enabled={preferences.pushOnApplicationUpdate}
              onChange={(value) => handleToggle('pushOnApplicationUpdate', value)}
            />
            <NotificationToggle
              label="Announcements"
              enabled={preferences.pushOnAnnouncement}
              onChange={(value) => handleToggle('pushOnAnnouncement', value)}
            />
          </div>
        )}
      </div>

      {/* Quiet Hours */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold text-card-foreground">Quiet Hours</h3>
          </div>
          <Switch
            checked={preferences.quietHoursEnabled}
            onChange={(value) => handleToggle('quietHoursEnabled', value)}
            className={`${
              preferences.quietHoursEnabled ? 'bg-primary' : 'bg-muted'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
          >
            <span className="sr-only">Enable quiet hours</span>
            <span
              className={`${
                preferences.quietHoursEnabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </Switch>
        </div>

        {preferences.quietHoursEnabled && (
          <div className="space-y-3 mt-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={preferences.quietHoursStart || '22:00'}
                  onChange={(e) => {
                    setPreferences({ ...preferences, quietHoursStart: e.target.value });
                    savePreferences({ quietHoursStart: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={preferences.quietHoursEnd || '08:00'}
                  onChange={(e) => {
                    setPreferences({ ...preferences, quietHoursEnd: e.target.value });
                    savePreferences({ quietHoursEnd: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
            </div>

            <NotificationToggle
              label="Weekend Notifications"
              enabled={preferences.weekendNotifications}
              onChange={(value) => handleToggle('weekendNotifications', value)}
            />
          </div>
        )}
      </div>

      {/* Digest Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold text-card-foreground">Notification Digest</h3>
          </div>
          <Switch
            checked={preferences.digestEnabled}
            onChange={(value) => handleToggle('digestEnabled', value)}
            className={`${
              preferences.digestEnabled ? 'bg-primary' : 'bg-muted'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
          >
            <span className="sr-only">Enable notification digest</span>
            <span
              className={`${
                preferences.digestEnabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </Switch>
        </div>

        {preferences.digestEnabled && (
          <div className="space-y-3 mt-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Frequency
              </label>
              <select
                value={preferences.digestFrequency}
                onChange={(e) => {
                  const value = e.target.value as Preferences['digestFrequency'];
                  setPreferences({ ...preferences, digestFrequency: value });
                  savePreferences({ digestFrequency: value });
                }}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Bi-weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Delivery Time
              </label>
              <input
                type="time"
                value={preferences.digestTime || '09:00'}
                onChange={(e) => {
                  setPreferences({ ...preferences, digestTime: e.target.value });
                  savePreferences({ digestTime: e.target.value });
                }}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
          </div>
        )}
      </div>

      {/* Test Notification */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={testNotification}
          className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
        >
          Send Test Notification
        </button>
      </div>

      {/* Save Indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg px-4 py-2 shadow-lg">
          <span className="text-sm text-muted-foreground">Saving preferences...</span>
        </div>
      )}
    </div>
  );
}

function NotificationToggle({
  label,
  enabled,
  onChange
}: {
  label: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Switch
        checked={enabled}
        onChange={onChange}
        className={`${
          enabled ? 'bg-primary' : 'bg-muted'
        } relative inline-flex h-5 w-9 items-center rounded-full transition-colors`}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`${
            enabled ? 'translate-x-5' : 'translate-x-1'
          } inline-block h-3 w-3 transform rounded-full bg-white transition`}
        />
      </Switch>
    </div>
  );
}