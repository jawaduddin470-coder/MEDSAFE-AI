/**
 * ============================================================
 *  MedSuree — Gemini API Key Rotation Manager
 * ============================================================
 *  Reads GEMINI_API_KEY_1 ... GEMINI_API_KEY_10 from env.
 *  Falls back to GEMINI_API_KEY for backwards-compatibility.
 *
 *  Auto-rotates to the next key when a request fails due to:
 *    • 429  – quota / rate limit exceeded
 *    • 403  – API key quota exhausted
 *    • "API key not valid" – invalid / revoked key
 *    • "RESOURCE_EXHAUSTED" – daily limit hit
 *
 *  Usage:
 *    const geminiKeyManager = require('../utils/geminiKeyManager');
 *
 *    // Get a ready-to-use Gemini model
 *    const { model, keyIndex } = geminiKeyManager.getModel({ modelName, systemInstruction });
 *
 *    // Or run a request with automatic retry on key failure:
 *    const result = await geminiKeyManager.callWithRetry(async (genAI) => {
 *        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
 *        return await model.generateContent('Hello');
 *    });
 * ============================================================
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Load all configured keys ────────────────────────────────────────────────

function loadKeys() {
    const keys = [];

    // Support GEMINI_API_KEY_1 through GEMINI_API_KEY_10
    for (let i = 1; i <= 10; i++) {
        const key = (process.env[`GEMINI_API_KEY_${i}`] || '').trim();
        if (key) keys.push(key);
    }

    // Fallback: single GEMINI_API_KEY for backward compatibility
    if (keys.length === 0) {
        const fallback = (process.env.GEMINI_API_KEY || '').trim();
        if (fallback) keys.push(fallback);
    }

    return keys;
}

// ─── State ───────────────────────────────────────────────────────────────────

const API_KEYS = loadKeys();
let currentIndex = 0;

// Track which keys are temporarily "cooled down" (quota hit)
// Key: keyIndex, Value: timestamp when it can be retried
const cooldownMap = {};
const COOLDOWN_MS = 60 * 1000; // 1 minute cooldown per key

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns true if the error indicates the current key should be rotated.
 */
function isKeyExhaustedError(error) {
    const msg = (error?.message || '').toLowerCase();
    const status = error?.status || error?.statusCode || 0;

    return (
        status === 429 ||
        status === 403 ||
        msg.includes('api key not valid') ||
        msg.includes('resource_exhausted') ||
        msg.includes('quota exceeded') ||
        msg.includes('rate limit') ||
        msg.includes('too many requests') ||
        msg.includes('invalid api key') ||
        msg.includes('permission denied')
    );
}

/**
 * Get the next available key index that is not in cooldown.
 * Returns -1 if all keys are in cooldown.
 */
function getNextAvailableIndex(startAfter) {
    const now = Date.now();
    const total = API_KEYS.length;

    for (let i = 1; i <= total; i++) {
        const idx = (startAfter + i) % total;
        const cooldownUntil = cooldownMap[idx];
        if (!cooldownUntil || now >= cooldownUntil) {
            return idx;
        }
    }
    return -1; // All keys are in cooldown
}

/**
 * Mark the current key as in cooldown and rotate to the next one.
 */
function rotateKey() {
    if (API_KEYS.length <= 1) return; // Nothing to rotate to

    console.warn(`[GeminiKeyManager] 🔄 Key #${currentIndex + 1} exhausted/invalid. Rotating...`);
    cooldownMap[currentIndex] = Date.now() + COOLDOWN_MS;

    const nextIdx = getNextAvailableIndex(currentIndex);
    if (nextIdx === -1) {
        console.error('[GeminiKeyManager] ❌ ALL Gemini API keys are in cooldown!');
        // Use the one whose cooldown expires soonest
        let soonest = 0;
        let soonestTime = Infinity;
        for (let i = 0; i < API_KEYS.length; i++) {
            if ((cooldownMap[i] || 0) < soonestTime) {
                soonestTime = cooldownMap[i] || 0;
                soonest = i;
            }
        }
        currentIndex = soonest;
    } else {
        currentIndex = nextIdx;
    }

    console.log(`[GeminiKeyManager] ✅ Now using key #${currentIndex + 1} of ${API_KEYS.length}`);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns a GoogleGenerativeAI client using the current active key.
 */
function getClient() {
    if (API_KEYS.length === 0) {
        throw new Error('No Gemini API keys configured. Set GEMINI_API_KEY_1 through GEMINI_API_KEY_10 in your environment.');
    }
    return new GoogleGenerativeAI(API_KEYS[currentIndex]);
}

/**
 * Returns a configured Gemini model using the current active key.
 *
 * @param {object} options
 * @param {string} options.modelName        - e.g. 'gemini-1.5-flash'
 * @param {string} [options.systemInstruction] - Optional system prompt
 * @returns {{ model, keyIndex }}
 */
function getModel({ modelName = 'gemini-2.0-flash', systemInstruction } = {}) {
    const client = getClient();
    const modelConfig = { model: modelName };
    if (systemInstruction) modelConfig.systemInstruction = systemInstruction;

    return {
        model: client.getGenerativeModel(modelConfig),
        keyIndex: currentIndex,
    };
}

/**
 * Run an async callback that receives a `GoogleGenerativeAI` client.
 * Automatically retries with the next key if a quota / key error occurs.
 * Tries up to `maxRetries` different keys before throwing.
 *
 * @param {function(GoogleGenerativeAI): Promise<any>} fn - Your Gemini logic
 * @param {number} maxRetries - Max number of key rotations to attempt (default: all keys)
 * @returns {Promise<any>}
 */
async function callWithRetry(fn, maxRetries) {
    const max = typeof maxRetries === 'number' ? maxRetries : API_KEYS.length;

    for (let attempt = 0; attempt <= max; attempt++) {
        try {
            const client = getClient();
            return await fn(client);
        } catch (error) {
            if (isKeyExhaustedError(error) && attempt < max) {
                console.warn(`[GeminiKeyManager] Key error on attempt ${attempt + 1}: ${error.message}`);
                rotateKey();
                // Brief pause before retry to respect rate limits
                await new Promise(r => setTimeout(r, 500));
            } else {
                throw error; // Non-key error or out of retries — bubble up
            }
        }
    }
}

/**
 * Returns diagnostic info about the key pool (safe to log, no key values exposed).
 */
function getStatus() {
    const now = Date.now();
    return {
        totalKeys: API_KEYS.length,
        currentKeyIndex: currentIndex + 1,
        keysInCooldown: Object.entries(cooldownMap)
            .filter(([, until]) => now < until)
            .map(([idx]) => Number(idx) + 1),
        keysAvailable: API_KEYS.length - Object.values(cooldownMap).filter(until => now < until).length,
    };
}

// ─── Startup log ─────────────────────────────────────────────────────────────

console.log(`[GeminiKeyManager] 🔑 Loaded ${API_KEYS.length} Gemini API key(s). Active: Key #${currentIndex + 1}`);

module.exports = { getClient, getModel, callWithRetry, rotateKey, getStatus, API_KEYS };
