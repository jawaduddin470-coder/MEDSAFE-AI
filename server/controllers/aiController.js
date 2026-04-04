const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

// Initialize OpenAI client for OpenRouter
if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ OPENROUTER_API_KEY is missing from environment variables!');
}

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || '',
    defaultHeaders: {
        "HTTP-Referer": "https://medsuree.com", // Optional, for OpenRouter tracking
        "X-Title": "MedSuree AI",
    }
});

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

const chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!process.env.OPENROUTER_API_KEY) {
            return res.status(503).json({ message: "AI service is currently unavailable (API configuration missing)." });
        }

        if (!message) {
            return res.status(400).json({ message: "Message is required." });
        }

        console.log('Sending request to OpenRouter (gemini-2.0-flash-exp:free)');

        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001",
            messages: [
                { role: "system", content: SYSTEM_INSTRUCTION },
                ...(history || []).map(msg => ({
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: msg.content
                })),
                { role: "user", content: message }
            ],
            max_tokens: 500,
            temperature: 0.7,
        });

        const responseText = completion.choices[0].message.content;

        console.log('✅ AI Response received successfully');
        res.json({ response: responseText });

    } catch (error) {
        console.error("AI Error:", error);

        // Fallback or Simulation Mode
        if (error.status === 401 || (error.message && error.message.includes('API key'))) {
            return res.json({
                response: "*(Simulation Mode Enabled: Invalid API Key)* \n\nI noticed your OpenRouter API key is currently invalid. To help you test the UI, I'm responding in simulation mode.\n\nI can still help you understand how MedSuree works! You can manage medications, set reminders, and check safety scores in the main dashboard."
            });
        }

        if (error.status === 429) {
            return res.status(429).json({
                message: "The AI service is currently at maximum capacity. Please try again in 1 minute."
            });
        }

        res.status(500).json({ message: "I'm having trouble processing that right now. Please try again later." });
    }
};

module.exports = { chatWithAI };

