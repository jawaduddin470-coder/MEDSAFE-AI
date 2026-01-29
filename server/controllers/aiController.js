const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

// Initialize OpenAI with OpenRouter
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

const SYSTEM_PROMPT = `You are "MediSafe Assistant", a medication safety awareness assistant integrated into the MedTech platform.

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

const chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!process.env.OPENROUTER_API_KEY) {
            return res.status(503).json({ message: "AI service is currently unavailable (API configuration missing)." });
        }

        if (!message) {
            return res.status(400).json({ message: "Message is required." });
        }

        // Build messages array with system prompt and history
        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...(history || []).map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
            })),
            { role: "user", content: message }
        ];

        const completion = await openai.chat.completions.create({
            model: "openai/gpt-3.5-turbo",
            messages: messages,
            max_tokens: 500,
            temperature: 0.7,
        });

        const responseText = completion.choices[0].message.content;
        res.json({ response: responseText });

    } catch (error) {
        console.error("AI Error:", error);

        // Check for rate limit error
        if (error.status === 429) {
            return res.status(429).json({
                message: "I'm experiencing high demand right now. Please wait a moment and try again."
            });
        }

        // Check for quota/billing issues
        if (error.message && (error.message.includes('quota') || error.message.includes('insufficient'))) {
            return res.status(503).json({
                message: "The AI service has reached its usage limit. Please try again later or contact support."
            });
        }

        res.status(500).json({ message: "I'm having trouble processing that right now. Please try again later." });
    }
};

module.exports = { chatWithAI };
