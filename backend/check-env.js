// Quick script to check which API keys are loaded
require('dotenv').config();

console.log('\n🔍 Checking API Keys in Environment:\n');
console.log('=' .repeat(60));

const keys = {
  'GEMINI_API_KEY': process.env.GEMINI_API_KEY,
  'DEEPSEEK_API_KEY': process.env.DEEPSEEK_API_KEY,
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
};

for (const [name, value] of Object.entries(keys)) {
  if (value) {
    const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4);
    console.log(`✅ ${name.padEnd(20)} = ${masked}`);
  } else {
    console.log(`❌ ${name.padEnd(20)} = NOT SET`);
  }
}

console.log('=' .repeat(60));

if (!process.env.DEEPSEEK_API_KEY) {
  console.log('\n⚠️  DEEPSEEK_API_KEY is missing!');
  console.log('\n📝 Add this line to backend/.env:');
  console.log('   DEEPSEEK_API_KEY=sk-your_key_here');
  console.log('\n💡 Get your key from: https://platform.deepseek.com/api_keys\n');
} else {
  console.log('\n✅ All required keys are loaded!\n');
}
