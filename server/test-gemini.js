const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGeminiWithPrefix() {
    console.log('Testing Gemini API with models/ prefix...');
    console.log('API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');

    const modelsToTry = [
        "models/gemini-1.5-flash",
        "models/gemini-1.5-pro",
        "models/gemini-pro",
        "gemini-1.5-flash-latest",
        "gemini-pro-latest"
    ];

    for (const modelName of modelsToTry) {
        try {
            console.log(`\nTrying ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello");
            const response = await result.response;
            console.log(`✓ ${modelName} works!`);
            console.log('Response:', response.text());
            console.log('\n✅ SUCCESS! Use this model name in your code.');
            return;
        } catch (error) {
            console.log(`✗ ${modelName} failed:`, error.message.split('\n')[0]);
        }
    }

    console.log('\n❌ All models failed.');
}

testGeminiWithPrefix();
