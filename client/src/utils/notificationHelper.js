/**
 * Request notification permission on first visit.
 * Call this once from main.jsx or App.jsx.
 */
export async function requestNotificationPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
        await Notification.requestPermission();
    }
}

/**
 * Send a browser notification.
 * @param {string} title
 * @param {string} body
 */
export function sendNotification(title, body) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
        const notification = new Notification(title, {
            body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-72.png',
            tag: 'medsafe-reminder',
            requireInteraction: true,
        });

        // Auto close after 10 seconds
        setTimeout(() => notification.close(), 10_000);
    } catch (err) {
        console.warn('Notification failed:', err);
    }
}
