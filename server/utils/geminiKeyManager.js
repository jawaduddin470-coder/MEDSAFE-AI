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
 *    • 404  – model not available on this key/version
 *
 *  Model fallback chain per key:
 *    gemini-2.0-flash → gemini-1.5-flash → gemini-1.5-flash-latest → gemini-pro
 *
 *  Forces the stable v1 API endpoint (not v1beta) to avoid 404s.
 * ============================================================
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Model fallback chain ─────────────────────────────────────────────────────
// We try these models in order. If one isn't available on the key, we try the next.
const MODEL_FALLBACKS = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-pro',
];

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
const COOLDOWN_MS = 30 * 1000; // 30-second cooldown per key (Gemini free tier refreshes per minute)

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns true if the error indicates this key is exhausted/invalid → should rotate.
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
        msg.includes('permission denied') ||
        msg.includes('requests per minute')
    );
}

/**
 * Returns true if the error is a model-not-found (404) → try next model in fallback chain.
 */
function isModelNotFoundError(error) {
    const msg = (error?.message || '').toLowerCase();
    const status = error?.status || error?.statusCode || 0;

    return (
        status === 404 ||
        msg.includes('not found') ||
        msg.includes('not supported') ||
        msg.includes('not available') ||
        msg.includes('model')
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
    if (API_KEYS.length <= 1) return;

    console.warn(`[GeminiKeyManager] 🔄 Key #${currentIndex + 1} exhausted/invalid. Rotating...`);
    cooldownMap[currentIndex] = Date.now() + COOLDOWN_MS;

    const nextIdx = getNextAvailableIndex(currentIndex);
    if (nextIdx === -1) {
        console.error('[GeminiKeyManager] ❌ ALL Gemini API keys are in cooldown!');
        // Use the one whose cooldown expires soonest
        let soonest = 0;
        let soonestTime = Infinity;
        for (let i = 0; i < API_KEYS.length; i++) {
            const t = cooldownMap[i] || 0;
            if (t < soonestTime) { soonestTime = t; soonest = i; }
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
 * Forces the stable `v1` API version to avoid v1beta 404 issues.
 */
function getClient() {
    if (API_KEYS.length === 0) {
        throw new Error('No Gemini API keys configured. Set GEMINI_API_KEY_1 through GEMINI_API_KEY_10 in your environment.');
    }
    // Pass apiVersion: 'v1' if the SDK supports it (v0.21+)
    try {
        return new GoogleGenerativeAI(API_KEYS[currentIndex], { apiVersion: 'v1' });
    } catch (_) {
        // Older SDK version — fall back to default
        return new GoogleGenerativeAI(API_KEYS[currentIndex]);
    }
}

/**
 * Run an async callback that receives a `GoogleGenerativeAI` client + current model name.
 * Automatically retries with:
 *   1. The next model in the fallback chain (on 404 model-not-found errors)
 *   2. The next API key (on 429/403/quota errors)
 *
 * @param {function(client: GoogleGenerativeAI, modelName: string): Promise<any>} fn
 * @returns {Promise<any>}
 */
async function callWithRetry(fn) {
    const maxKeyAttempts = API_KEYS.length;
    let lastError;

    for (let keyAttempt = 0; keyAttempt <= maxKeyAttempts; keyAttempt++) {
        // Try each model in the fallback chain for this key
        for (let modelIdx = 0; modelIdx < MODEL_FALLBACKS.length; modelIdx++) {
            const modelName = MODEL_FALLBACKS[modelIdx];
            try {
                const client = getClient();
                console.log(`[GeminiKeyManager] 🔑 Trying key #${currentIndex + 1}, model: ${modelName}`);
                return await fn(client, modelName);
            } catch (error) {
                lastError = error;

                if (isModelNotFoundError(error)) {
                    // This key doesn't support this model — try the next model
                    console.warn(`[GeminiKeyManager] ⚠️ Model "${modelName}" not available. Trying next model...`);
                    await new Promise(r => setTimeout(r, 200));
                    continue;
                }

                if (isKeyExhaustedError(error) && keyAttempt < maxKeyAttempts) {
                    // Key is rate-limited/exhausted — rotate to next key
                    console.warn(`[GeminiKeyManager] ⚡ Key #${currentIndex + 1} rate-limited: ${error.message}`);
                    rotateKey();
                    await new Promise(r => setTimeout(r, 500));
                    break; // Break model loop → try all models again on new key
                }

                // Non-retriable error — bubble up immediately
                throw error;
            }
        }
    }

    // All keys × all models exhausted
    throw lastError || new Error('All Gemini API keys and model fallbacks exhausted.');
}

/**
 * Returns diagnostic info about the key pool (safe to log, no key values exposed).
 */
function getStatus() {
    const now = Date.now();
    return {
        totalKeys: API_KEYS.length,
        currentKeyIndex: currentIndex + 1,
        availableModels: MODEL_FALLBACKS,
        keysInCooldown: Object.entries(cooldownMap)
            .filter(([, until]) => now < until)
            .map(([idx]) => Number(idx) + 1),
        keysAvailable: API_KEYS.length - Object.values(cooldownMap).filter(until => now < until).length,
        cooldownSeconds: COOLDOWN_MS / 1000,
    };
}

// ─── Startup log ─────────────────────────────────────────────────────────────

console.log(`[GeminiKeyManager] 🔑 Loaded ${API_KEYS.length} Gemini key(s) | Models: ${MODEL_FALLBACKS.join(' → ')}`);

module.exports = { getClient, callWithRetry, rotateKey, getStatus, API_KEYS, MODEL_FALLBACKS };
