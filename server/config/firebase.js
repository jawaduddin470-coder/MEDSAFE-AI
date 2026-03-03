const admin = require('firebase-admin');

/**
 * Initialize Firebase Admin SDK
 * Requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */
try {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
        console.warn('[FCM] Firebase environment variables not fully set. Push notifications will be disabled.');
    } else {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Handle the newline characters in the private key
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
        });
        console.log('[FCM] Firebase Admin SDK Initialized Successfully.');
    }
} catch (error) {
    console.error('[FCM] Error initializing Firebase Admin SDK:', error);
}

module.exports = admin;
