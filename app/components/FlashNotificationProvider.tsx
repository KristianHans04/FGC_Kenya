'use client'

import { FlashNotificationContainer } from '@/app/components/ui/FlashNotification'
import { useFlashNotification } from '@/app/lib/hooks/useFlashNotification'

export function FlashNotificationProvider({ children }: { children: React.ReactNode }) {
  const { notifications, removeNotification } = useFlashNotification()

  return (
    <>
      {children}
      <FlashNotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </>
  )
}