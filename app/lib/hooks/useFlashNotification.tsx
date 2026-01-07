'use client'

import { create } from 'zustand'
import type { FlashNotification, NotificationType } from '@/app/components/ui/FlashNotification'

interface FlashNotificationStore {
  notifications: FlashNotification[]
  addNotification: (message: string, type: NotificationType, duration?: number) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useFlashNotification = create<FlashNotificationStore>((set) => ({
  notifications: [],
  
  addNotification: (message: string, type: NotificationType, duration = 5000) => {
    // Check if a similar message already exists to prevent duplicates
    const existingNotification = useFlashNotification.getState().notifications.find(
      n => n.message === message && n.type === type
    )
    
    if (existingNotification) {
      return // Don't add duplicate notifications
    }
    
    const id = `${Date.now()}-${Math.random()}`
    const notification: FlashNotification = {
      id,
      message,
      type,
      duration
    }
    
    set((state) => ({
      notifications: [...state.notifications, notification]
    }))
    
    // Auto-remove after duration
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      }))
    }, duration)
  },
  
  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }))
  },
  
  clearAll: () => {
    set({ notifications: [] })
  }
}))

// Helper functions for common notifications
export const showSuccess = (message: string, duration?: number) => {
  useFlashNotification.getState().addNotification(message, 'success', duration)
}

export const showError = (message: string, duration?: number) => {
  useFlashNotification.getState().addNotification(message, 'error', duration)
}

export const showWarning = (message: string, duration?: number) => {
  useFlashNotification.getState().addNotification(message, 'warning', duration)
}

export const showInfo = (message: string, duration?: number) => {
  useFlashNotification.getState().addNotification(message, 'info', duration)
}