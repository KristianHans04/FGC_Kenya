'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';
import pwaManager from '@/app/lib/pwa/pwa-manager';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    setIsInstalled(pwaManager.isInstalled());

    // Listen for install prompt
    const handleInstallAvailable = (event: CustomEvent) => {
      setInstallPrompt(event.detail.prompt);
      
      // Don't show if already dismissed recently
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('pwa-install-available' as any, handleInstallAvailable);

    return () => {
      window.removeEventListener('pwa-install-available' as any, handleInstallAvailable);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    try {
      // Show the install prompt
      installPrompt.prompt();
      
      // Wait for the user to respond
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setShowPrompt(false);
      setInstallPrompt(null);
    } catch (error) {
      console.error('Failed to install PWA:', error);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border border-border rounded-lg shadow-xl z-50 p-4 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 hover:bg-muted rounded-lg transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      <div className="flex items-start">
        <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg mr-3">
          <Smartphone className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-card-foreground mb-1">
            Install FGC Kenya App
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Install our app for a better experience with offline access, push notifications, and faster loading.
          </p>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-green-500 mr-1" />
              <span>Works offline</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-green-500 mr-1" />
              <span>Push notifications</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition-colors flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Install App
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// PWA Update Prompt Component
export function PWAUpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setShowUpdate(true);
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = () => {
    pwaManager.updateServiceWorker();
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border border-border rounded-lg shadow-xl z-50 p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg mr-3">
          <Download className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-card-foreground">Update Available</h4>
          <p className="text-sm text-muted-foreground mt-1">
            A new version of the app is available. Update now for the latest features and improvements.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end mt-3 space-x-2">
        <button
          onClick={() => setShowUpdate(false)}
          className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
        >
          Later
        </button>
        <button
          onClick={handleUpdate}
          className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
        >
          Update Now
        </button>
      </div>
    </div>
  );
}