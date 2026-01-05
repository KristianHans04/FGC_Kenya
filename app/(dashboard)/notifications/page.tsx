'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Settings, Filter, Search, Calendar } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [filter, page]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '20',
        offset: String(page * 20),
        ...(filter === 'unread' && { unreadOnly: 'true' })
      });

      const response = await fetch(`/api/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (page === 0) {
          setNotifications(data.data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.data.notifications]);
        }
        setHasMore(data.data.hasMore);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ read: true })
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (!confirm('Are you sure you want to clear all notifications?')) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      NEW_MESSAGE: '💬',
      NEW_EMAIL: '📧',
      EVENT_CREATED: '📅',
      EVENT_UPDATED: '📝',
      EVENT_CANCELLED: '❌',
      EVENT_REMINDER: '⏰',
      EVENT_INVITATION: '✉️',
      EVENT_RSVP: '✓',
      TASK_ASSIGNED: '📋',
      TASK_UPDATED: '🔄',
      TASK_DUE_SOON: '⏳',
      TASK_OVERDUE: '⚠️',
      TASK_COMPLETED: '✅',
      APPLICATION_SUBMITTED: '📄',
      APPLICATION_REVIEWED: '👁️',
      APPLICATION_ACCEPTED: '🎉',
      APPLICATION_REJECTED: '😔',
      APPLICATION_SHORTLISTED: '📌',
      APPLICATION_INTERVIEW: '🎤',
      ANNOUNCEMENT: '📢',
      MAINTENANCE: '🔧',
      SECURITY_ALERT: '🔒',
      ACCOUNT_UPDATE: '👤',
      ROLE_CHANGED: '🔄',
      ARTICLE_PUBLISHED: '📰',
      RESOURCE_SHARED: '📁',
      COMMENT_RECEIVED: '💭'
    };
    return iconMap[type] || '📌';
  };

  const filteredNotifications = notifications.filter(n => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!n.title.toLowerCase().includes(query) && 
          !n.message.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (selectedType !== 'all' && n.type !== selectedType) {
      return false;
    }
    if (filter === 'read' && !n.read) return false;
    if (filter === 'unread' && n.read) return false;
    return true;
  });

  const notificationTypes = [...new Set(notifications.map(n => n.type))];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <Bell className="w-8 h-8 text-primary mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
              <p className="text-muted-foreground">Stay updated with all your activities</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/settings/notifications"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Notification settings"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Filter Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'all' 
                      ? 'bg-primary text-white' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'unread'
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'read'
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Read
                </button>
              </div>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="all">All Types</option>
                {notificationTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Mark all read
              </button>
              <button
                onClick={clearAllNotifications}
                className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading && page === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
            <p className="text-muted-foreground">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : searchQuery
                ? "No notifications match your search."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  !notification.read ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start">
                  <span className="text-2xl mr-4 mt-1">
                    {getNotificationIcon(notification.type)}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-base font-semibold ${
                          !notification.read ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true
                            })}
                          </span>
                          {notification.actionUrl && (
                            <Link
                              href={notification.actionUrl}
                              className="text-xs text-primary hover:text-primary-light"
                              onClick={() => !notification.read && markAsRead(notification.id)}
                            >
                              View details →
                            </Link>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center ml-4 gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-muted-foreground" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}