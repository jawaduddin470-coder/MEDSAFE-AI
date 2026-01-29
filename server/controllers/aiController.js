const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Google Generative AI
if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is missing from environment variables!');
} else {
    console.log('✅ GEMINI_API_KEY is present');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: `You are "MediSafe Assistant", a medication safety awareness assistant integrated into the MedTech platform.

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
- Use soft, supportive tone.`
});

const chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({ message: "AI service is currently unavailable (API configuration missing)." });
        }

        if (!message) {
            return res.status(400).json({ message: "Message is required." });
        }

        // Initialize chat with history
        const chat = model.startChat({
            history: (history || []).map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            })),
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
            },
        });

        console.log('Sending request to Gemini 2.0 Flash');
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const responseText = response.text();

        console.log('✅ AI Response received successfully');
        res.json({ response: responseText });

    } catch (error) {
        console.error("AI Error:", error);

        // Check for specific Gemini errors if possible, otherwise generic
        if (error.message && error.message.includes('429')) {
            return res.status(429).json({
                message: "I'm experiencing high demand right now. Please wait a moment and try again."
            });
        }

        if (error.message && (error.message.includes('safety') || error.message.includes('blocked'))) {
            return res.status(400).json({
                message: "I cannot answer this question due to safety constraints. If this is a medical emergency, please contact emergency services."
            });
        }

        res.status(500).json({ message: "I'm having trouble processing that right now. Please try again later." });
    }
};

module.exports = { chatWithAI };

