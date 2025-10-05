/**
 * List Available Gemini Models
 * This will show which models your API key has access to
 * 
 * Usage: node list-gemini-models.js
 */

require('dotenv').config();
const axios = require('axios');

async function listModels() {
  console.log('\n🔍 Checking available Gemini models...\n');

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    process.exit(1);
  }

  try {
    // List models endpoint
    const endpoint = `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`;

    console.log('📡 Fetching models from Google AI...\n');

    const response = await axios.get(endpoint, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    const models = response.data.models || [];

    if (models.length === 0) {
      console.log('⚠️  No models found');
      return;
    }

    console.log(`✅ Found ${models.length} available models:\n`);
    console.log('─'.repeat(80));

    // Filter for generateContent capable models
    const contentModels = models.filter(m => 
      m.supportedGenerationMethods?.includes('generateContent')
    );

    console.log('\n📝 Models that support generateContent (text generation):\n');

    contentModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Display Name: ${model.displayName || 'N/A'}`);
      console.log(`   Description: ${model.description || 'N/A'}`);
      console.log(`   Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('');
    });

    console.log('─'.repeat(80));
    console.log('\n💡 Recommended for assistant: Use the first "gemini" model listed above\n');

    // Try to find best model
    const geminiModel = contentModels.find(m => 
      m.name.includes('gemini-1.5') || m.name.includes('gemini-pro')
    );

    if (geminiModel) {
      const modelName = geminiModel.name.replace('models/', '');
      console.log(`✅ Best match: ${modelName}`);
      console.log(`\nUpdate your assistant.js to use:`);
      console.log(`const endpoint = \`https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=\${process.env.GEMINI_API_KEY}\`;\n`);
    }

  } catch (error) {
    console.error('\n❌ Error fetching models:\n');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 403) {
        console.log('\n💡 Your API key is invalid or restricted.');
        console.log('Get a new key: https://makersuite.google.com/app/apikey');
      }
    } else {
      console.error('Message:', error.message);
    }
    
    process.exit(1);
  }
}

listModels();
