/**
 * Test Gemini API Key
 * Run this to verify your GEMINI_API_KEY is working
 * 
 * Usage: node test-gemini.js
 */

require('dotenv').config();
const axios = require('axios');

async function testGemini() {
  console.log('\n🔍 Testing Gemini API Key...\n');

  // Check if key exists
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ ERROR: GEMINI_API_KEY not found in .env file');
    console.log('\n📝 To fix:');
    console.log('1. Open backend/.env file');
    console.log('2. Add: GEMINI_API_KEY=your-actual-key');
    console.log('3. Get free key: https://makersuite.google.com/app/apikey\n');
    process.exit(1);
  }

  console.log('✅ GEMINI_API_KEY found in .env');
  console.log(`Key starts with: ${process.env.GEMINI_API_KEY.substring(0, 10)}...`);

  // Test API call
  try {
    console.log('\n🌐 Testing API connection...\n');

    // Helper to list models (v1, then v1beta)
    const listModels = async () => {
      const results = [];
      try {
        const { data } = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`, { timeout: 15000 });
        results.push(...(data.models || []));
      } catch (_) {}
      if (results.length === 0) {
        try {
          const { data } = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`, { timeout: 15000 });
          results.push(...(data.models || []));
        } catch (_) {}
      }
      return results;
    };

    const preferred = [
      process.env.GEMINI_MODEL,
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-1.0-pro',
      'gemini-pro',
    ].filter(Boolean);

    const available = await listModels();
    const genModels = available
      .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
      .map(m => (m.name || '').replace(/^models\//, ''));

    const seen = new Set();
    const candidates = [];
    for (const m of [...preferred, ...genModels]) {
      if (m && !seen.has(m)) { seen.add(m); candidates.push(m); }
    }
    if (candidates.length === 0) {
      candidates.push('gemini-1.5-flash-latest');
    }

    let reply = null;
    let usedModel = null;
    let lastError = null;

    for (const model of candidates) {
      const v1 = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const v1beta = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

      const tryEndpoint = async (endpoint) => {
        const response = await axios.post(endpoint, {
          contents: [
            {
              role: 'user',
              parts: [{ text: 'Hello! Say "API key is working!" in a friendly way.' }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100
          }
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        });
        return response;
      };

      try {
        let resp;
        try {
          resp = await tryEndpoint(v1);
        } catch (e1) {
          const status = e1?.response?.status;
          if (status === 404) {
            console.log(`⚠️  Model not found or unsupported on v1: ${model}. Trying v1beta...`);
            resp = await tryEndpoint(v1beta);
          } else {
            throw e1;
          }
        }

        reply = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          usedModel = model;
          break;
        }
        lastError = new Error('Empty response');
      } catch (err) {
        lastError = err;
        const status = err?.response?.status;
        if (status === 404) {
          console.log(`⚠️  Model not found or unsupported: ${model}. Trying next...`);
          continue;
        }
        throw err;
      }
    }

    if (reply) {
      console.log(`✅ SUCCESS! Gemini API is working using model: ${usedModel}\n`);
      console.log('📩 Response from Gemini:');
      console.log('─'.repeat(50));
      console.log(reply);
      console.log('─'.repeat(50));
      console.log('\n🎉 Your API key is valid and working!\n');
      console.log('Tip: Pin this model by setting GEMINI_MODEL in backend/.env');
    } else {
      throw lastError || new Error('Failed to get response from all tested models');
    }

  } catch (error) {
    console.error('\n❌ ERROR: API call failed\n');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 400) {
        console.log('\n💡 Fix: Check your API key format. It should look like: AIzaSy...');
      } else if (error.response.status === 403) {
        console.log('\n💡 Fix: API key is invalid or expired. Get a new one:');
        console.log('   https://makersuite.google.com/app/apikey');
      }
    } else {
      console.error('Error message:', error.message);
      console.log('\n💡 Fix: Check your internet connection');
    }
    
    process.exit(1);
  }
}

// Run test
testGemini();
