/**
 * Service Worker Registration
 * Handles registration and updates of the service worker
 */

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service Workers are not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('[PWA] Service Worker registered successfully:', registration);

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60000); // Check every minute

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker is ready
          console.log('[PWA] New service worker available');
          notifyUpdate();
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
    return null;
  }
};

/**
 * Unregister service worker
 */
export const unregisterServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();

    for (const registration of registrations) {
      await registration.unregister();
    }

    console.log('[PWA] Service Worker unregistered');
  } catch (error) {
    console.error('[PWA] Failed to unregister Service Worker:', error);
  }
};

/**
 * Notify user of update
 */
function notifyUpdate() {
  // You can emit an event or call a callback here
  window.dispatchEvent(
    new CustomEvent('sw-update', {
      detail: { message: 'A new version of NurPath is available' },
    })
  );
}

/**
 * Skip waiting and activate new service worker
 */
export const skipWaiting = async () => {
  const registrations = await navigator.serviceWorker.getRegistrations();

  for (const registration of registrations) {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  // Reload page to activate new service worker
  window.location.reload();
};

/**
 * Request background sync
 */
export const requestBackgroundSync = async (tag) => {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    console.log('[PWA] Background Sync is not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(tag);
    console.log('[PWA] Background sync registered:', tag);
    return true;
  } catch (error) {
    console.error('[PWA] Failed to register background sync:', error);
    return false;
  }
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('[PWA] Notifications are not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Show notification
 */
export const showNotification = async (title, options = {}) => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      ...options,
    });
  } catch (error) {
    console.error('[PWA] Failed to show notification:', error);
  }
};

/**
 * Check if app is installable
 */
export const isAppInstallable = () => {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    window.matchMedia('(display-mode: standalone)').matches === false
  );
};

/**
 * Get service worker status
 */
export const getServiceWorkerStatus = async () => {
  if (!('serviceWorker' in navigator)) {
    return { supported: false };
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const registration = registrations[0];

    if (!registration) {
      return { supported: true, registered: false };
    }

    return {
      supported: true,
      registered: true,
      active: !!registration.active,
      installing: !!registration.installing,
      waiting: !!registration.waiting,
      scope: registration.scope,
    };
  } catch (error) {
    console.error('[PWA] Failed to get service worker status:', error);
    return { supported: true, error: error.message };
  }
};
