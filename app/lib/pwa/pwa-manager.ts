'use client';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

class PWAManager {
  private registration: ServiceWorkerRegistration | null = null;
  private pushSubscription: PushSubscription | null = null;

  // Initialize PWA features
  async init() {
    if (typeof window === 'undefined') return;

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('Service workers not supported');
      return;
    }

    try {
      // Register service worker
      await this.registerServiceWorker();

      // Handle app install prompt
      this.handleInstallPrompt();

      // Check notification permission
      await this.checkNotificationPermission();

      // Setup push notifications if permitted
      if (Notification.permission === 'granted') {
        await this.setupPushNotifications();
      }

      // Handle updates
      this.handleServiceWorkerUpdates();
    } catch (error) {
      console.error('PWA initialization error:', error);
    }
  }

  // Register service worker
  private async registerServiceWorker() {
    try {
      this.registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully');

      // Check for updates periodically
      setInterval(() => {
        this.registration?.update();
      }, 60 * 60 * 1000); // Check every hour
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Handle install prompt
  private handleInstallPrompt() {
    let deferredPrompt: any = null;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install button or banner
      this.showInstallPrompt(deferredPrompt);
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      deferredPrompt = null;
      
      // Track installation
      this.trackEvent('pwa_installed');
    });
  }

  // Show install prompt UI
  private showInstallPrompt(prompt: any) {
    // This will be called by components that want to show install UI
    const event = new CustomEvent('pwa-install-available', { detail: { prompt } });
    window.dispatchEvent(event);
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await this.setupPushNotifications();
      }
      return permission;
    }

    return Notification.permission;
  }

  // Check current notification permission
  private async checkNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }

    console.log('Current notification permission:', Notification.permission);
  }

  // Setup push notifications
  private async setupPushNotifications() {
    if (!this.registration) {
      console.error('Service worker not registered');
      return;
    }

    try {
      // Get the server's public key
      const response = await fetch('/api/notifications/vapid-public-key');
      const { publicKey } = await response.json();

      // Subscribe to push notifications
      this.pushSubscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicKey)
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(this.pushSubscription);
      
      console.log('Push notifications setup complete');
    } catch (error) {
      console.error('Failed to setup push notifications:', error);
    }
  }

  // Send subscription to server
  private async sendSubscriptionToServer(subscription: PushSubscription) {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          deviceInfo: {
            deviceType: this.getDeviceType(),
            browser: this.getBrowserName(),
            os: this.getOSName()
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      console.log('Subscription saved to server');
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    if (!this.pushSubscription) {
      console.log('No active subscription');
      return;
    }

    try {
      // Unsubscribe from push manager
      await this.pushSubscription.unsubscribe();

      // Remove from server
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: this.pushSubscription.endpoint
        })
      });

      this.pushSubscription = null;
      console.log('Unsubscribed from push notifications');
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      throw error;
    }
  }

  // Show local notification
  async showNotification(options: NotificationOptions) {
    if (!this.registration) {
      console.error('Service worker not registered');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    try {
      const notificationOptions: any = {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        badge: options.badge || '/icons/badge-72x72.png',
        tag: options.tag || 'default',
        data: options.data || {},
        requireInteraction: options.requireInteraction || false,
        vibrate: [200, 100, 200],
        renotify: true
      };
      
      // Add actions if supported
      if (options.actions && 'actions' in Notification.prototype) {
        notificationOptions.actions = options.actions;
      }
      
      await this.registration.showNotification(options.title, notificationOptions);
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  // Handle service worker updates
  private handleServiceWorkerUpdates() {
    if (!this.registration) return;

    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          this.showUpdateNotification();
        }
      });
    });

    // Handle controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  // Show update notification
  private showUpdateNotification() {
    const event = new CustomEvent('pwa-update-available');
    window.dispatchEvent(event);
  }

  // Update service worker
  async updateServiceWorker() {
    if (!this.registration) return;

    try {
      await this.registration.update();
      
      // Skip waiting and activate new service worker
      if (this.registration.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (error) {
      console.error('Failed to update service worker:', error);
    }
  }

  // Clear all caches
  async clearCache() {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      // Also tell service worker to clear
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
      }
      
      console.log('All caches cleared');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }

  // Check if app is installed
  isInstalled(): boolean {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Check for iOS
    if ('standalone' in navigator && (navigator as any).standalone) {
      return true;
    }

    return false;
  }

  // Get device type
  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  // Get browser name
  private getBrowserName(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'firefox';
    if (ua.includes('Chrome')) return 'chrome';
    if (ua.includes('Safari')) return 'safari';
    if (ua.includes('Edge')) return 'edge';
    return 'unknown';
  }

  // Get OS name
  private getOSName(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'windows';
    if (ua.includes('Mac')) return 'macos';
    if (ua.includes('Linux')) return 'linux';
    if (ua.includes('Android')) return 'android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'ios';
    return 'unknown';
  }

  // Convert base64 to Uint8Array for VAPID
  private urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  }

  // Track events for analytics
  private trackEvent(eventName: string, data?: any) {
    // Send to analytics service
    console.log('Track event:', eventName, data);
  }
}

// Export singleton instance
const pwaManager = new PWAManager();
export default pwaManager;