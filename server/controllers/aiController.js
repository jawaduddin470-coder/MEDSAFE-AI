const OpenAI = require('openai');

// Initialize OpenRouter Client
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    defaultHeaders: {
        'HTTP-Referer': process.env.FRONTEND_URL || 'https://medsuree.com',
        'X-Title': 'MedSuree AI Assistant',
    },
});

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

// ─── Chat Handler ─────────────────────────────────────────────────────────────
const chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!process.env.OPENROUTER_API_KEY) {
            return res.status(503).json({ message: 'AI service is not configured (Missing OpenRouter API Key). Please contact support.' });
        }

        if (!message) {
            return res.status(400).json({ message: 'Message is required.' });
        }

        console.log(`[AIController] 💬 Routing request via OpenRouter (Gemini 2.0 Flash)`);

        // Format conversation history for OpenAI chat format
        const formattedMessages = [
            { role: 'system', content: SYSTEM_INSTRUCTION }
        ];

        if (history && Array.isArray(history)) {
            history.forEach(msg => {
                // Ignore any invalid roles
                if (msg.role === 'user' || msg.role === 'assistant') {
                    formattedMessages.push({
                        role: msg.role,
                        content: msg.content
                    });
                }
            });
        }

        // Add the current user message
        formattedMessages.push({ role: 'user', content: message });

        const completion = await openai.chat.completions.create({
            model: 'google/gemini-2.0-flash-001',
            messages: formattedMessages,
            max_tokens: 1000,
            temperature: 0.7,
        });

        const responseText = completion.choices[0]?.message?.content || "I couldn't generate a response.";

        console.log(`✅ AI Response ok (OpenRouter)`);

        res.json({ response: responseText });

    } catch (error) {
        console.error('[AIController] ❌ Error:', error?.message || error);

        let errorMessage = "I'm having trouble processing that right now.";

        if (error.message && error.message.includes('429')) {
            errorMessage = 'AI service is at capacity. Please wait a moment and try again.';
        } else if (error.message) {
            errorMessage = `Neural Error: ${error.message.substring(0, 250)}`;
        }

        res.status(500).json({ message: errorMessage });
    }
};

module.exports = { chatWithAI };
