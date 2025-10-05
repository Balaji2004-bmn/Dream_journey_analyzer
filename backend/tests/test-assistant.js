/**
 * Test script for Assistant API
 * Run with: node tests/test-assistant.js
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const ASSISTANT_ENDPOINT = `${API_URL}/api/assistant`;

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAssistant() {
  log('\n=== Testing Dream Journey Assistant API ===\n', 'blue');

  let conversationId = null;

  // Test 1: Project-related question
  log('Test 1: Project-related question (How to upgrade to Pro plan?)', 'yellow');
  try {
    const response1 = await axios.post(ASSISTANT_ENDPOINT, {
      userMessage: 'How do I upgrade to Pro plan?'
    });

    conversationId = response1.data.conversationId;

    log('✓ Response received', 'green');
    log(`  Provider: ${response1.data.provider}`, 'blue');
    log(`  IsProjectRelated: ${response1.data.isProjectRelated}`, 'blue');
    log(`  Message preview: ${response1.data.assistantMessage.substring(0, 100)}...`, 'blue');
    log(`  ConversationId: ${conversationId}\n`, 'blue');
  } catch (error) {
    log(`✗ Test 1 failed: ${error.message}`, 'red');
    if (error.response?.data) {
      log(`  Error details: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return;
  }

  // Test 2: Follow-up question (same conversation)
  log('Test 2: Follow-up question in same conversation', 'yellow');
  try {
    const response2 = await axios.post(ASSISTANT_ENDPOINT, {
      userMessage: 'What about video generation features?',
      conversationId: conversationId
    });

    log('✓ Response received', 'green');
    log(`  Provider: ${response2.data.provider}`, 'blue');
    log(`  Same ConversationId: ${response2.data.conversationId === conversationId}`, 'blue');
    log(`  Message preview: ${response2.data.assistantMessage.substring(0, 100)}...`, 'blue');
  } catch (error) {
    log(`✗ Test 2 failed: ${error.message}`, 'red');
    if (error.response?.data) {
      log(`  Error details: ${JSON.stringify(error.response.data)}`, 'red');
    }
  }

  // Test 3: General question (should be answered)
  log('\nTest 3: General question (date/time)', 'yellow');
  try {
    const response3 = await axios.post(ASSISTANT_ENDPOINT, {
      userMessage: 'What is the current date and time?'
    });

    log('✓ Response received for general question', 'green');
    log(`  Provider: ${response3.data.provider}`, 'blue');
    log(`  IsProjectRelated: ${response3.data.isProjectRelated}`, 'blue');
    log(`  Message preview: ${response3.data.assistantMessage.substring(0, 100)}...`, 'blue');
  } catch (error) {
    log(`✗ Test 3 failed: ${error.message}`, 'red');
  }

  // Test 3b: Math question (should be answered)
  log('\nTest 3b: General question (math)', 'yellow');
  try {
    const response3b = await axios.post(ASSISTANT_ENDPOINT, {
      userMessage: 'What is 5 + 3?'
    });

    log('✓ Response received for math question', 'green');
    log(`  IsProjectRelated: ${response3b.data.isProjectRelated}`, 'blue');
    log(`  Message: ${response3b.data.assistantMessage}`, 'blue');
  } catch (error) {
    log(`✗ Test 3b failed: ${error.message}`, 'red');
  }

  // Test 3c: Weather question (should explain limitations)
  log('\nTest 3c: General question (weather)', 'yellow');
  try {
    const response3c = await axios.post(ASSISTANT_ENDPOINT, {
      userMessage: 'What is the weather like?'
    });

    log('✓ Response received for weather question', 'green');
    log(`  IsProjectRelated: ${response3c.data.isProjectRelated}`, 'blue');
    log(`  Message preview: ${response3c.data.assistantMessage.substring(0, 100)}...`, 'blue');
  } catch (error) {
    log(`✗ Test 3c failed: ${error.message}`, 'red');
  }

  // Test 4: Technical question
  log('\nTest 4: Technical question about platform stack', 'yellow');
  try {
    const response4 = await axios.post(ASSISTANT_ENDPOINT, {
      userMessage: 'What technology stack does this project use?'
    });

    log('✓ Response received', 'green');
    log(`  Provider: ${response4.data.provider}`, 'blue');
    log(`  Message preview: ${response4.data.assistantMessage.substring(0, 100)}...`, 'blue');
  } catch (error) {
    log(`✗ Test 4 failed: ${error.message}`, 'red');
  }

  // Test 5: Clear conversation
  if (conversationId) {
    log('\nTest 5: Clear conversation history', 'yellow');
    try {
      const response5 = await axios.delete(`${ASSISTANT_ENDPOINT}/${conversationId}`);
      log('✓ Conversation cleared successfully', 'green');
      log(`  Message: ${response5.data.message}`, 'blue');
    } catch (error) {
      log(`✗ Test 5 failed: ${error.message}`, 'red');
    }
  }

  // Test 6: Invalid request (missing userMessage)
  log('\nTest 6: Invalid request (missing userMessage)', 'yellow');
  try {
    const response6 = await axios.post(ASSISTANT_ENDPOINT, {});
    log('✗ Should have returned error for missing userMessage', 'red');
  } catch (error) {
    if (error.response?.status === 400) {
      log('✓ Correctly returned 400 error', 'green');
      log(`  Error: ${error.response.data.error}`, 'blue');
    } else {
      log(`✗ Unexpected error: ${error.message}`, 'red');
    }
  }

  log('\n=== Test Suite Complete ===\n', 'blue');
}

// Run tests
testAssistant().catch(error => {
  log(`\nFatal error: ${error.message}`, 'red');
  process.exit(1);
});
