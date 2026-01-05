'use client';

import { useEffect, useState } from 'react';
import pwaManager from '@/app/lib/pwa/pwa-manager';
import PWAInstallPrompt, { PWAUpdatePrompt } from './PWAInstallPrompt';

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [debugMode, setDebugMode] = useState(false);
  const [swStatus, setSWStatus] = useState<string>('initializing');

  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isLocalhost = typeof window !== 'undefined' && 
                       (window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1');

    // Enable debug mode in development
    if (isDevelopment && isLocalhost) {
      setDebugMode(true);
    }

    const initializePWA = async () => {
      try {
        // Clear problematic service workers in development if needed
        if (isDevelopment && isLocalhost && 'serviceWorker' in navigator) {
          const hasIssues = sessionStorage.getItem('sw-has-issues') === 'true';
          
          if (hasIssues) {
            console.warn('[PWA] Clearing problematic service worker...');
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              await registration.unregister();
            }
            
            // Clear all caches
            if ('caches' in window) {
              const cacheNames = await caches.keys();
              await Promise.all(cacheNames.map(name => caches.delete(name)));
              console.log('[PWA] Caches cleared');
            }
            
            sessionStorage.removeItem('sw-has-issues');
            setSWStatus('cleared');
            
            // Wait a bit before reinitializing
            setTimeout(() => {
              window.location.reload();
            }, 1000);
            return;
          }
        }

        // Initialize PWA features
        setSWStatus('registering');
        await pwaManager.init();
        setSWStatus('active');
        console.log('[PWA] Initialized successfully');

        // Monitor for offline false positives
        if (isDevelopment) {
          let offlineCount = 0;
          const checkConnection = setInterval(() => {
            if (!navigator.onLine && window.location.hostname === 'localhost') {
              offlineCount++;
              if (offlineCount > 3) {
                console.error('[PWA] False offline detection in localhost');
                sessionStorage.setItem('sw-has-issues', 'true');
                clearInterval(checkConnection);
              }
            } else {
              offlineCount = 0;
            }
          }, 2000);

          // Clean up after 30 seconds
          setTimeout(() => clearInterval(checkConnection), 30000);
        }
      } catch (error) {
        console.error('[PWA] Initialization error:', error);
        setSWStatus('error');
        
        if (isDevelopment) {
          sessionStorage.setItem('sw-has-issues', 'true');
        }
      }
    };

    // Only initialize if in browser environment
    if (typeof window !== 'undefined') {
      // Small delay to ensure page is ready
      setTimeout(initializePWA, 500);
    }

    // Network status monitoring
    const handleOnline = () => {
      console.log('[PWA] Network: Online');
      document.body.classList.remove('offline-mode');
    };

    const handleOffline = () => {
      console.log('[PWA] Network: Offline');
      document.body.classList.add('offline-mode');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {children}
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
      
      {/* Debug panel for development */}
      {debugMode && (
        <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white p-2 rounded-lg text-xs max-w-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold">SW Status:</span>
            <span className={`px-2 py-0.5 rounded ${
              swStatus === 'active' ? 'bg-green-600' : 
              swStatus === 'error' ? 'bg-red-600' : 
              'bg-yellow-600'
            }`}>
              {swStatus}
            </span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold">Network:</span>
            <span className={`px-2 py-0.5 rounded ${
              navigator.onLine ? 'bg-green-600' : 'bg-red-600'
            }`}>
              {navigator.onLine ? 'Online' : 'Offline'}
            </span>
          </div>
          <button
            onClick={async () => {
              if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                  await registration.unregister();
                }
                if ('caches' in window) {
                  const cacheNames = await caches.keys();
                  await Promise.all(cacheNames.map(name => caches.delete(name)));
                }
                sessionStorage.removeItem('sw-has-issues');
                window.location.reload();
              }
            }}
            className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
          >
            Clear SW & Reload
          </button>
        </div>
      )}
    </>
  );
}