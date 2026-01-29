const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    console.log('Listing available models...\n');

    try {
        const models = await genAI.listModels();

        console.log('Available models:');
        for await (const model of models) {
            console.log(`- ${model.name}`);
            console.log(`  Display Name: ${model.displayName}`);
            console.log(`  Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
            console.log('');
        }
    } catch (error) {
        console.error('Error listing models:', error.message);
    }
}

listModels();
