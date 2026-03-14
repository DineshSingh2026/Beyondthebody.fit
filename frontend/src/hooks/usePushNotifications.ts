'use client';

import { useState, useCallback } from 'react';

/**
 * Push notifications — stub for future VAPID / NestJS integration.
 * Request permission on first session booking; subscribe to Web Push.
 */
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [isSupported] = useState(
    typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator
  );

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'denied';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const subscribe = useCallback(async () => {
    // TODO: VAPID keys from NestJS, subscribe and send endpoint to backend
    return null as unknown as PushSubscription | null;
  }, []);

  return {
    permission,
    isSupported,
    requestPermission,
    subscribe,
  };
}
