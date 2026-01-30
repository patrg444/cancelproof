import { supabase } from './supabase';

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

// Get current notification permission
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    throw new Error('Notifications not supported');
  }

  const permission = await Notification.requestPermission();
  return permission;
}

// Register service worker and get push subscription
export async function registerPushSubscription(userId: string): Promise<PushSubscription | null> {
  if (!isNotificationSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;

    // Get VAPID public key from environment
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.warn('VAPID public key not configured');
      return null;
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // Save subscription to Supabase
    if (supabase) {
      const subscriptionJson = subscription.toJSON();
      await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscriptionJson.keys?.p256dh || '',
        auth: subscriptionJson.keys?.auth || '',
      });
    }

    return subscription;
  } catch (error) {
    console.error('Failed to register push subscription:', error);
    return null;
  }
}

// Unregister push subscription
export async function unregisterPushSubscription(userId: string): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();

      // Remove from Supabase
      if (supabase) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', userId)
          .eq('endpoint', subscription.endpoint);
      }
    }
  } catch (error) {
    console.error('Failed to unregister push subscription:', error);
  }
}

// Show a local notification (for testing or immediate feedback)
export async function showLocalNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    ...options,
  });
}

// Schedule reminder notifications (client-side for demo, server-side in production)
export function scheduleReminderCheck(
  subscriptions: Array<{ id: string; name: string; cancelByDate: string; status: string }>
): void {
  // Check every hour for upcoming deadlines
  const checkReminders = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    subscriptions.forEach((sub) => {
      if (sub.status === 'cancelled') return;

      const cancelDate = new Date(sub.cancelByDate);
      const daysUntil = Math.ceil((cancelDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Show notification for approaching deadlines
      if (daysUntil === 1) {
        showLocalNotification(`Cancel ${sub.name} tomorrow!`, {
          body: `Your cancel-by deadline is tomorrow. Don't forget to cancel to avoid charges.`,
          tag: `reminder-${sub.id}`,
          data: { subscriptionId: sub.id },
        });
      } else if (daysUntil === 0) {
        showLocalNotification(`Cancel ${sub.name} TODAY!`, {
          body: `Today is your last day to cancel. Act now to avoid being charged.`,
          tag: `reminder-${sub.id}`,
          requireInteraction: true,
          data: { subscriptionId: sub.id },
        });
      }
    });
  };

  // Initial check
  checkReminders();

  // Set up periodic check (every hour)
  setInterval(checkReminders, 60 * 60 * 1000);
}

// Helper: Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
