const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI((process.env.GEMINI_API_KEY || '').trim());
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: `You are "MedSuree Assistant", a medication safety awareness assistant integrated into the MedSuree platform.

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
            return res.status(503).json({ message: "AI service config missing (GEMINI_API_KEY)." });
        }

        if (!message) {
            return res.status(400).json({ message: "Message is required." });
        }

        console.log('Sending request to Google Gemini (gemini-1.5-flash)');

        // Gemini history MUST start with a 'user' message and alternate roles.
        // We filter out any leading model messages (like the initial greeting).
        const formattedHistory = (history || [])
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }))
            .filter((msg, index, self) => {
                // Find the first user message
                const firstUserIndex = self.findIndex(m => m.role === 'user');
                return index >= firstUserIndex && firstUserIndex !== -1;
            });

        const chat = model.startChat({
            history: formattedHistory,
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        console.log('✅ AI Response received successfully');
        res.json({ response: responseText });

    } catch (error) {
        console.error("AI Error Detailed:", error);

        // Capture specific Google API errors to show in UI
        let errorMessage = "I'm having trouble processing that right now.";
        
        if (error.message && error.message.includes('API key not valid')) {
            errorMessage = "Neural Sync Error: The API Key configured in Render is invalid.";
        } else if (error.message && error.message.includes('429')) {
            errorMessage = "Neural cloud reached capacity. Please wait 60 seconds.";
        } else if (error.message && error.message.includes('SAFETY')) {
            errorMessage = "Neural safety filters blocked this request. Try rephrasing.";
        } else if (error.message) {
            // Send the raw error message if it's safe and helpful
            errorMessage = `Neural Error: ${error.message.substring(0, 250)}`;
        }

        res.status(500).json({ message: errorMessage });
    }
};

module.exports = { chatWithAI };

