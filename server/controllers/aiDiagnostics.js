const { GoogleGenAI } = require('@google/genai');
const geminiKeyManager = require('../utils/geminiKeyManager');

// Admin diagnostic tool: Test ALL keys sequentially and return their exact raw errors
const testAllKeys = async (req, res) => {
    const results = [];
    const keys = geminiKeyManager.API_KEYS;

    if (keys.length === 0) {
        return res.json({ success: false, message: 'No keys configured in environment.' });
    }

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        try {
            const ai = new GoogleGenAI({ apiKey: key });
            // Test a minimal generation
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: 'Say "hello" and nothing else.',
            });
            results.push({
                keyIndex: i + 1,
                status: '✅ Working',
                response: response.text,
            });
        } catch (error) {
            results.push({
                keyIndex: i + 1,
                status: '❌ Failed',
                errorStatus: error.status || 'unknown',
                errorMessage: error.message || String(error),
            });
        }
    }

    res.json({
        totalKeys: keys.length,
        results
    });
};

module.exports = { testAllKeys };
