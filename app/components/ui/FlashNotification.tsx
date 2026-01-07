'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/app/lib/utils'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface FlashNotification {
  id: string
  message: string
  type: NotificationType
  duration?: number
}

interface FlashNotificationProps {
  notification: FlashNotification
  onClose: (id: string) => void
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
    textColor: 'text-green-900 dark:text-green-100'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    textColor: 'text-red-900 dark:text-red-100'
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    textColor: 'text-yellow-900 dark:text-yellow-100'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-900 dark:text-blue-100'
  }
}

export function FlashNotificationItem({ notification, onClose }: FlashNotificationProps) {
  const config = typeConfig[notification.type]
  const Icon = config.icon

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id)
    }, notification.duration || 5000)

    return () => clearTimeout(timer)
  }, [notification.id, notification.duration, onClose])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm',
        config.bgColor,
        config.borderColor
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0', config.iconColor)} />
      <p className={cn('flex-1 text-sm font-medium', config.textColor)}>
        {notification.message}
      </p>
      <button
        onClick={() => onClose(notification.id)}
        className={cn(
          'p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors',
          config.textColor
        )}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export function FlashNotificationContainer({ notifications, onClose }: {
  notifications: FlashNotification[]
  onClose: (id: string) => void
}) {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full pointer-events-none">
      <AnimatePresence mode="sync">
        <div className="space-y-2 pointer-events-auto">
          {notifications.map((notification) => (
            <FlashNotificationItem
              key={notification.id}
              notification={notification}
              onClose={onClose}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  )
}