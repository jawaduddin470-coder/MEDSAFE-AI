const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function simpleTest() {
    console.log('Testing with simple generateContent (no chat)...\n');
    console.log('API Key:', process.env.GEMINI_API_KEY);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
        const result = await model.generateContent("Say hello in one word");
        const response = await result.response;
        console.log('\n✅ SUCCESS!');
        console.log('Response:', response.text());
    } catch (error) {
        console.log('\n❌ FAILED');
        console.log('Error:', error.message);
        if (error.errorDetails) {
            console.log('Error Details:', JSON.stringify(error.errorDetails, null, 2));
        }
    }
}

simpleTest();
