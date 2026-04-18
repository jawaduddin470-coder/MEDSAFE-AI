const geminiKeyManager = require('../utils/geminiKeyManager');

// ─── System Instruction ───────────────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `You are "MedSuree Assistant", a medication safety awareness assistant integrated into the MedSuree platform.

YOUR RESPONSIBILITIES:
1. Explain medication risk analysis results in plain, non-technical language.
2. Answer general medication safety awareness questions (e.g., timing importance, adherence reminders).
3. Guide users on how to use platform features (input medicines, view reports, upgrade plans).
4. Provide general best-practice safety reminders.

STRICT PROHIBITIONS (YOU MUST REFUSE THESE):
- DO NOT provide medical diagnoses.
- DO NOT prescribe medications or recommend treatments.
- DO NOT give emergency medical advice.
- DO NOT interpret lab results beyond general educational context.

MANDATORY BEHAVIOR:
- If a user asks for medical advice, diagnosis, or treatment, YOU MUST REFUSE and state: "I am an AI assistant for safety awareness only. Please consult a healthcare professional for medical advice, diagnosis, or treatment."
- For emergency queries (e.g., chest pain, overdose), tell the user to contact emergency services immediately.
- Keep responses concise, friendly, and easy to understand.
- Use soft, supportive tone.`;

// ─── Simple request throttle ──────────────────────────────────────────────────
// Ensures we don't fire multiple parallel requests that burn through quota faster
let lastRequestTime = 0;
const MIN_REQUEST_GAP_MS = 1000; // minimum 1 second between requests

async function throttle() {
    const now = Date.now();
    const gap = now - lastRequestTime;
    if (gap < MIN_REQUEST_GAP_MS) {
        await new Promise(r => setTimeout(r, MIN_REQUEST_GAP_MS - gap));
    }
    lastRequestTime = Date.now();
}

// ─── Chat Handler ─────────────────────────────────────────────────────────────
const chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (geminiKeyManager.API_KEYS.length === 0) {
            return res.status(503).json({ message: 'AI service is not configured. Please contact support.' });
        }

        if (!message) {
            return res.status(400).json({ message: 'Message is required.' });
        }

        const status = geminiKeyManager.getStatus();
        console.log(`[AIController] 💬 Request | Key #${status.currentKeyIndex}/${status.totalKeys} | Available: ${status.keysAvailable}`);

        // Format conversation history into contents array
        // @google/genai uses { role, parts: [{ text }] } format
        const historyContents = (history || [])
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            }))
            .filter((msg, index, self) => {
                const firstUserIndex = self.findIndex(m => m.role === 'user');
                return index >= firstUserIndex && firstUserIndex !== -1;
            });

        // Full conversation: history + current message
        const contents = [
            ...historyContents,
            { role: 'user', parts: [{ text: message }] },
        ];

        // Throttle to avoid rapid-fire quota exhaustion
        await throttle();

        // callWithRetry tries model fallbacks + key rotation automatically
        const responseText = await geminiKeyManager.callWithRetry(async (ai, modelName) => {
            const response = await ai.models.generateContent({
                model: modelName,
                contents,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                },
            });
            return response.text;
        });

        const finalStatus = geminiKeyManager.getStatus();
        console.log(`✅ AI Response ok (key #${finalStatus.currentKeyIndex})`);

        res.json({ response: responseText });

    } catch (error) {
        console.error('[AIController] ❌ Error:', error?.message || error);

        let errorMessage = "I'm having trouble processing that right now.";

        if (error.message && error.message.includes('No Gemini API keys configured')) {
            errorMessage = 'AI service is not configured. Please contact support.';
        } else if (error.message && error.message.toLowerCase().includes('api key not valid')) {
            errorMessage = 'All AI keys are currently exhausted. Please try again in a few minutes.';
        } else if (error.message && (error.message.includes('429') || error.message.includes('exhausted') || error.message.includes('quota'))) {
            errorMessage = 'AI service is at capacity. Please wait 30 seconds and try again.';
        } else if (error.message && error.message.includes('SAFETY')) {
            errorMessage = 'Neural safety filters blocked this request. Try rephrasing.';
        } else if (error.message) {
            errorMessage = `Neural Error: ${error.message.substring(0, 250)}`;
        }

        res.status(500).json({ message: errorMessage });
    }
};

module.exports = { chatWithAI };
