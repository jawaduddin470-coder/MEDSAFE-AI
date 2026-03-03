const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const admin = require('../config/firebase');

/**
 * Medsafe AI Backend Scheduler
 * Runs every minute to check if any reminders are due.
 */
cron.schedule('* * * * *', async () => {
    const now = new Date();

    // Format current time to match "HH:mm" (24h)
    const currentTime = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    // Format current date to match "YYYY-MM-DD"
    const currentDate = now.toISOString().split('T')[0];

    try {
        // Find reminders that are upcoming, due/past-due today, and haven't been sent yet
        const dueReminders = await Reminder.find({
            status: 'upcoming',
            date: currentDate,
            time: { $lte: currentTime }, // handle slight delays by catching anything <= now
            sent: false
        }).populate('user');

        if (dueReminders.length > 0) {
            console.log(`[Scheduler] Found ${dueReminders.length} due reminders.`);

            for (const reminder of dueReminders) {
                await sendPushNotification(reminder);

                // Mark as sent and optionally completed (depending on biz logic)
                reminder.sent = true;
                // If it's a one-off, we can mark it completed
                if (reminder.repeat === 'none') {
                    reminder.status = 'completed';
                }
                await reminder.save();

                // Handle creation of next recurring reminder if needed
                if (reminder.repeat !== 'none') {
                    await scheduleNextRecurring(reminder);
                }
            }
        }
    } catch (error) {
        console.error('[Scheduler Error]:', error);
    }
});

/**
 * Real Firebase Push Notification Logic
 */
async function sendPushNotification(reminder) {
    const user = reminder.user;
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
        console.log(`[FCM] No tokens for user ${user?._id || 'unknown'}. Skipping push.`);
        return;
    }

    const payload = {
        notification: {
            title: '💊 Medication Reminder',
            body: `It's time to take your ${reminder.medicineName}${reminder.dosage ? ` (${reminder.dosage})` : ''}.`,
        },
        data: {
            reminderId: reminder._id.toString(),
            click_action: '/dashboard', // handled by service worker
        },
    };

    const tokens = user.fcmTokens;
    try {
        const response = await admin.messaging().sendEachForMulticast({
            tokens: tokens,
            notification: payload.notification,
            data: payload.data
        });

        console.log(`[FCM] Sent to ${response.successCount} devices, ${response.failureCount} failed.`);

        // Cleanup failed tokens if needed in the future
    } catch (error) {
        console.error('[FCM Error]:', error);
    }
}

async function scheduleNextRecurring(reminder) {
    const nextDate = calculateNextDate(reminder.date, reminder.repeat);
    if (!nextDate) return;

    await Reminder.create({
        user: reminder.user._id,
        medicineName: reminder.medicineName,
        dosage: reminder.dosage,
        date: nextDate,
        time: reminder.time,
        repeat: reminder.repeat,
        status: 'upcoming',
        sent: false
    });
}

function calculateNextDate(currentDate, repeat) {
    const date = new Date(currentDate);
    if (repeat === 'daily') {
        date.setDate(date.getDate() + 1);
    } else if (repeat === 'weekly') {
        date.setDate(date.getDate() + 7);
    } else {
        return null;
    }
    return date.toISOString().split('T')[0];
}

console.log('[Scheduler] Backend Reminder Watchdog Initialized.');
