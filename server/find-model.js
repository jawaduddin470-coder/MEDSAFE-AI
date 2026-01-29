const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function findWorkingModel() {
    console.log('Testing all possible Gemini models...\n');
    console.log('API Key:', process.env.GEMINI_API_KEY.substring(0, 20) + '...\n');

    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-002",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-1.5-pro-001",
        "gemini-1.5-pro-002",
        "gemini-pro",
        "gemini-pro-latest",
        "gemini-1.0-pro",
        "gemini-1.0-pro-latest",
        "gemini-1.0-pro-001",
        "gemini-2.0-flash-exp",
    ];

    for (const modelName of modelsToTry) {
        try {
            console.log(`Testing: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            const response = await result.response;
            console.log(`✅ SUCCESS: ${modelName} works!`);
            console.log(`Response: ${response.text()}\n`);
            console.log(`\n🎉 USE THIS MODEL: "${modelName}"\n`);
            return;
        } catch (error) {
            const errorMsg = error.message.split('\n')[0];
            if (error.message.includes('429')) {
                console.log(`⚠️  Rate limited (but model exists): ${modelName}`);
            } else if (error.message.includes('404')) {
                console.log(`❌ Not found: ${modelName}`);
            } else if (error.message.includes('quota')) {
                console.log(`⚠️  Quota exceeded (but model exists): ${modelName}`);
            } else {
                console.log(`❌ Error: ${errorMsg}`);
            }
        }
    }

    console.log('\n❌ No working models found.');
}

findWorkingModel();
