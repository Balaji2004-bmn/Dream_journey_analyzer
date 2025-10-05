const axios = require('axios');

/**
 * Generate structured dream analysis using Google Gemini Pro via REST API
 * @param {string} dreamText
 * @returns {Promise<{ title: string, story: string, video_prompt: string }>} 
 */
async function generateDreamAnalysis(dreamText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
  if (!dreamText || !dreamText.trim()) throw new Error('dreamText is required');

  // Using gemini-2.0-flash (free tier compatible, faster than older models)
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const prompt = `You are an expert story writer and cinematic prompt engineer.
Return STRICT JSON only, no prose. Keys: title, story, video_prompt, keywords, emotions.
- title: short, 3-6 words, evocative
- story: 3-6 sentences, second person, emotional, coherent
- video_prompt: One paragraph, cinematic visual description for an AI video model (characters, environment, mood, style, camera movement, lighting). Max 480 chars.
- keywords: 5-8 thematic keywords as an array of strings (e.g., ["forest","flying"]).
- emotions: 3-6 items as an array of objects with fields {"emotion": string, "intensity": 0-100} (e.g., [{"emotion":"Wonder","intensity":88}]).
Dream text: ${dreamText}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024
    }
  };

  const { data } = await axios.post(endpoint, body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000
  });

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text) throw new Error('Empty response from Gemini');

  // Try direct parse, fallback to extracting first JSON object
  let jsonStr = text.trim();
  if (!jsonStr.startsWith('{')) {
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      jsonStr = jsonStr.slice(start, end + 1);
    }
  }

  let obj;
  try {
    obj = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error('Failed to parse Gemini output as JSON');
  }

  // Normalize keywords
  let keywords = Array.isArray(obj.keywords) ? obj.keywords : [];
  keywords = keywords
    .map(k => (typeof k === 'string' ? k : String(k?.keyword || k?.name || '')))
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 8);

  // Normalize emotions
  let emotions = [];
  if (Array.isArray(obj.emotions)) {
    emotions = obj.emotions
      .map(e => {
        const name = typeof e === 'string' ? e : (e?.emotion || e?.name || '');
        let intensity = Number(e?.intensity);
        if (!Number.isFinite(intensity)) intensity = 50;
        intensity = Math.max(0, Math.min(100, Math.round(intensity)));
        return { emotion: String(name).trim(), intensity };
      })
      .filter(e => e.emotion)
      .slice(0, 8);
  }

  return {
    title: String(obj.title || 'Untitled Dream'),
    story: String(obj.story || ''),
    video_prompt: String(obj.video_prompt || ''),
    keywords,
    emotions
  };
}

module.exports = { generateDreamAnalysis };
