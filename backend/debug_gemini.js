require('dotenv').config();
const axios = require('axios');

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ No API Key found in .env');
        return;
    }
    console.log(`Testing API Key: ${apiKey.substring(0, 5)}...`);

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    console.log(`\nFetching models from: ${url.replace(apiKey, 'HIDDEN_KEY')}`);

    try {
        const response = await axios.get(url);
        console.log('✅ Available Models:');
        response.data.models.forEach(m => {
            if (m.supportedGenerationMethods.includes('generateContent')) {
                console.log(`- ${m.name} (${m.version})`);
            }
        });
    } catch (error) {
        if (error.response) {
            console.error(`❌ FAILED: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(`❌ FAILED: ${error.message}`);
        }
    }
}

listModels();
