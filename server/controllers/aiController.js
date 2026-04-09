const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({ message: "AI service is currently unavailable (API configuration missing)." });
        }

        if (!message) {
            return res.status(400).json({ message: "Message is required." });
        }

        console.log('Sending request to Google Gemini (gemini-1.5-flash)');

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: SYSTEM_INSTRUCTION + "\n\nUnderstood. I will follow these instructions strictly." }] },
                { role: "model", parts: [{ text: "Hello! I am your MedSuree Assistant. I will help you with medication safety awareness and platform guidance while strictly avoiding medical diagnoses or prescriptions." }] },
                ...(history || []).map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                })),
            ],
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        console.log('✅ AI Response received successfully');
        res.json({ response: responseText });

    } catch (error) {
        console.error("AI Error:", error);

        // Fallback for quota issues
        if (error.message && error.message.includes('429')) {
            return res.status(429).json({
                message: "The AI service is currently at maximum capacity. Please try again in 1 minute."
            });
        }

        res.status(500).json({ message: "I'm having trouble processing that right now. Please try again later." });
    }
};

module.exports = { chatWithAI };

