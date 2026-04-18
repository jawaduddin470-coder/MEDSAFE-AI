/**
 * ============================================================
 *  MedSuree — Gemini API Key Rotation Manager
 *  Uses: @google/genai (v1 API — stable, not v1beta)
 * ============================================================
 *  Reads GEMINI_API_KEY_1 ... GEMINI_API_KEY_10 from env.
 *  Falls back to GEMINI_API_KEY for backwards-compatibility.
 *
 *  Auto-rotates to the next key when a request fails due to:
 *    • 429  – quota / rate limit exceeded
 *    • 403  – API key quota exhausted
 *    • "API key not valid" – invalid / revoked key
 *    • "RESOURCE_EXHAUSTED" – daily limit hit
 *    • 404  – model not available on this key
 *
 *  Model fallback chain per key:
 *    gemini-2.0-flash → gemini-1.5-flash → gemini-1.5-flash-8b
 * ============================================================
 */

const { GoogleGenAI } = require('@google/genai');

// ─── Model fallback chain ─────────────────────────────────────────────────────
const MODEL_FALLBACKS = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
];

// ─── Load all configured keys ────────────────────────────────────────────────

function loadKeys() {
    const keys = [];
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

const cooldownMap = {};
const COOLDOWN_MS = 30 * 1000; // 30s cooldown per key

// ─── Error classifiers ────────────────────────────────────────────────────────

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

function isModelNotFoundError(error) {
    const msg = (error?.message || '').toLowerCase();
    const status = error?.status || error?.statusCode || 0;
    return (
        status === 404 ||
        msg.includes('not found') ||
        msg.includes('not supported') ||
        msg.includes('not available')
    );
}

// ─── Key rotation ─────────────────────────────────────────────────────────────

function getNextAvailableIndex(startAfter) {
    const now = Date.now();
    const total = API_KEYS.length;
    for (let i = 1; i <= total; i++) {
        const idx = (startAfter + i) % total;
        if (!cooldownMap[idx] || now >= cooldownMap[idx]) return idx;
    }
    return -1;
}

function rotateKey() {
    if (API_KEYS.length <= 1) return;
    console.warn(`[GeminiKeyManager] 🔄 Key #${currentIndex + 1} exhausted. Rotating...`);
    cooldownMap[currentIndex] = Date.now() + COOLDOWN_MS;

    const nextIdx = getNextAvailableIndex(currentIndex);
    if (nextIdx === -1) {
        console.error('[GeminiKeyManager] ❌ ALL keys are in cooldown — picking soonest...');
        let soonest = 0, soonestTime = Infinity;
        for (let i = 0; i < API_KEYS.length; i++) {
            const t = cooldownMap[i] || 0;
            if (t < soonestTime) { soonestTime = t; soonest = i; }
        }
        currentIndex = soonest;
    } else {
        currentIndex = nextIdx;
    }
    console.log(`[GeminiKeyManager] ✅ Now using key #${currentIndex + 1}/${API_KEYS.length}`);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns a GoogleGenAI client (v1 API) using the current active key.
 */
function getClient() {
    if (API_KEYS.length === 0) {
        throw new Error('No Gemini API keys configured. Set GEMINI_API_KEY_1 through GEMINI_API_KEY_10.');
    }
    return new GoogleGenAI({ apiKey: API_KEYS[currentIndex] });
}

/**
 * Run an async callback with automatic model + key retry.
 * Callback receives: (ai: GoogleGenAI, modelName: string)
 *
 * Retry order:
 *   1. Try next model in fallback chain (on 404 model-not-found)
 *   2. Try next API key (on 429/403/quota errors)
 */
async function callWithRetry(fn) {
    const maxKeyAttempts = API_KEYS.length;
    let lastError;

    for (let keyAttempt = 0; keyAttempt <= maxKeyAttempts; keyAttempt++) {
        for (let modelIdx = 0; modelIdx < MODEL_FALLBACKS.length; modelIdx++) {
            const modelName = MODEL_FALLBACKS[modelIdx];
            try {
                const client = getClient();
                console.log(`[GeminiKeyManager] 🔑 Key #${currentIndex + 1}, model: ${modelName}`);
                return await fn(client, modelName);
            } catch (error) {
                lastError = error;

                if (isModelNotFoundError(error)) {
                    console.warn(`[GeminiKeyManager] ⚠️ Model "${modelName}" not found — trying next model...`);
                    await new Promise(r => setTimeout(r, 200));
                    continue; // try next model
                }

                if (isKeyExhaustedError(error) && keyAttempt < maxKeyAttempts) {
                    console.warn(`[GeminiKeyManager] ⚡ Key #${currentIndex + 1} rate-limited — rotating key...`);
                    rotateKey();
                    await new Promise(r => setTimeout(r, 500));
                    break; // restart model loop with new key
                }

                throw error; // unrecoverable error
            }
        }
    }

    throw lastError || new Error('All Gemini API keys and model fallbacks exhausted.');
}

/**
 * Safe status info — no key values exposed.
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
        keysAvailable: API_KEYS.length - Object.values(cooldownMap).filter(u => now < u).length,
    };
}

console.log(`[GeminiKeyManager] 🔑 ${API_KEYS.length} key(s) | Models: ${MODEL_FALLBACKS.join(' → ')}`);

module.exports = { getClient, callWithRetry, rotateKey, getStatus, API_KEYS, MODEL_FALLBACKS };
