# Video Generation API - Complete Guide

## 🎬 Overview

Your Dream Journey Analyzer has **video generation capabilities** using multiple AI providers. Here's everything you need to know about how it works and whether it generates the same video from the same dream description.

---

## 🔑 API Key Configuration

### Backend Configuration (`.env` file in `/backend`)

```env
# Video Generation APIs
RUNWAY_API_KEY=your_runway_api_key_here
PIKA_API_KEY=your_pika_api_key_here
KAIBER_API_KEY=your_kaiber_api_key_here
```

### Frontend Configuration (`.env` file in root)

```env
# Video Generation
VITE_RUNWAY_API_KEY=your_runway_api_key_here
RUNWAY_API_KEY=your_runway_api_key_here
PIKA_API_KEY=your_pika_api_key_here
KAIBER_API_KEY=your_kaiber_api_key_here
```

---

## 📹 Available Video Providers

### 1. **RunwayML Gen-3** (Primary)
- **Quality**: Highest quality, most realistic
- **Duration**: Up to 10 seconds
- **Styles**: Realistic, Cinematic, Artistic
- **Best For**: Premium users, high-quality outputs
- **API Endpoint**: `https://api.runwayml.com/v1`

### 2. **Pika Labs**
- **Quality**: Fast generation, creative
- **Duration**: Up to 4 seconds
- **Styles**: Cinematic, Anime, Cartoon
- **Best For**: Quick generations, artistic styles
- **API Endpoint**: `https://api.pika.art/v1`

### 3. **Kaiber AI**
- **Quality**: Artistic, animated
- **Duration**: Up to 16 seconds
- **Styles**: Anime, Artistic, Photorealistic
- **Best For**: Longer videos, animated styles
- **API Endpoint**: `https://api.kaiber.ai/v1`

---

## ❓ Will It Generate the SAME Video from the SAME Text?

### **Answer: NO, by default** ❌

Here's why:

### 1. **Random Seed Generation**

```javascript
// In videoGeneration.js line 23
seed: options.seed || Math.floor(Math.random() * 1000000)
```

**Each generation uses a RANDOM seed**, which means:
- Same prompt → Different visual output each time
- This is intentional for variety
- Creates unique interpretations of the same dream

### 2. **To Get CONSISTENT Results** ✅

You need to **pass the same seed value**. Here's how:

---

## 🔧 How to Generate IDENTICAL Videos

### Method 1: Use Fixed Seed (Backend Modification)

**Modify**: `backend/routes/videoGeneration.js`

```javascript
// Calculate seed from dream content (deterministic)
const calculateDreamSeed = (dreamContent) => {
  let hash = 0;
  for (let i = 0; i < dreamContent.length; i++) {
    const char = dreamContent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// In generateVideo method, replace line 23:
seed: options.seed || calculateDreamSeed(prompt)
```

**Result**: Same dream text → Same hash → Same seed → **SAME VIDEO** ✅

---

### Method 2: Store and Reuse Seeds

**Modify**: `backend/routes/videoGeneration.js`

```javascript
// Store seed in database with video metadata
const videoData = {
  id: generationResult.id,
  status: 'processing',
  title,
  dreamContent,
  style,
  duration,
  provider: providerUsed,
  seed: options.seed || Math.floor(Math.random() * 1000000), // Save seed
  created_at: new Date().toISOString(),
  user_id: req.user.id,
  prompt: enhancedPrompt
};

// To regenerate same video, pass stored seed:
await runwayClient.generateVideo(enhancedPrompt, {
  duration,
  seed: storedSeed // Use saved seed
});
```

**Result**: Can regenerate exact same video by reusing saved seed ✅

---

## 🎨 How Video Generation Works

### 1. **Dream Text Processing**

```javascript
// src/services/runwayML.js - Line 81-113
generateDreamPrompt(dreamText, emotions, keywords) {
  // Extract dominant emotions
  const dominantEmotions = emotions
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 3)
    .map(e => e.emotion);

  // Map emotions to visual styles
  const visualStyle = dominantEmotions
    .map(emotion => emotionStyles[emotion])
    .join(', ');

  // Create enhanced prompt
  const prompt = `A dreamlike video sequence: ${dreamText}. 
    Visual style: ${visualStyle}. 
    Key elements: ${keywords.join(', ')}. 
    Cinematic, ethereal, otherworldly atmosphere.`;

  return prompt;
}
```

### 2. **Emotion-Based Visual Styles**

| Emotion | Visual Style |
|---------|--------------|
| **Euphoria** | Vibrant, glowing, ethereal, golden light |
| **Fear** | Dark, mysterious, shadowy, dramatic lighting |
| **Joy** | Bright, colorful, playful, warm lighting |
| **Sadness** | Melancholic, blue tones, soft lighting |
| **Love** | Warm, romantic, soft focus, pink and red tones |
| **Peace** | Serene, calm, soft pastels, gentle movement |
| **Wonder** | Magical, surreal, otherworldly, dreamlike |

### 3. **Generation Process**

```
Dream Text → Emotion Analysis → Keyword Extraction
    ↓
Enhanced Prompt Creation
    ↓
API Call with Seed (Random or Fixed)
    ↓
Video Generation (30s - 5min)
    ↓
Status Polling
    ↓
Completed Video URL
```

---

## 🧪 Testing Video Generation

### 1. **Check if API Key is Configured**

```bash
# Backend
cd backend
grep RUNWAY_API_KEY .env

# Frontend
cd ..
grep VITE_RUNWAY_API_KEY .env
```

### 2. **Test API Endpoint**

**URL**: `GET /api/video-generation/providers`

**Response**:
```json
{
  "success": true,
  "providers": [
    {
      "id": "runway",
      "name": "RunwayML Gen-3",
      "available": true,
      "maxDuration": 10
    },
    {
      "id": "pika",
      "name": "Pika Labs",
      "available": false,
      "maxDuration": 4
    }
  ]
}
```

### 3. **Generate Test Video**

**Endpoint**: `POST /api/video-generation/generate-advanced`

**Body**:
```json
{
  "dreamContent": "I was flying over a magical city with golden towers",
  "title": "Test Dream",
  "style": "cinematic",
  "duration": 10,
  "provider": "runway"
}
```

---

## 🔄 Implementing Consistent Video Generation

### Full Implementation Code

**File**: `backend/routes/videoGeneration.js`

```javascript
// Add helper function at top
const crypto = require('crypto');

function generateConsistentSeed(text) {
  // Create SHA-256 hash of text
  const hash = crypto
    .createHash('sha256')
    .update(text)
    .digest('hex');
  
  // Convert first 8 characters to number
  return parseInt(hash.substring(0, 8), 16) % 1000000;
}

// Modify line 16-36 in RunwayMLClient.generateVideo()
async generateVideo(prompt, options = {}) {
  try {
    // Use consistent seed if requested
    const seed = options.useConsistentSeed 
      ? generateConsistentSeed(prompt)
      : options.seed || Math.floor(Math.random() * 1000000);

    const response = await axios.post(`${this.baseURL}/generate`, {
      prompt,
      model: options.model || 'gen3a_turbo',
      duration: options.duration || 10,
      resolution: options.resolution || '1280x768',
      seed: seed,
      // Store seed in response for reference
      _metadata: { seed, useConsistentSeed: options.useConsistentSeed }
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    logger.error('RunwayML API error:', error.response?.data || error.message);
    throw error;
  }
}

// In POST /generate-advanced endpoint (line 150), add option:
generationResult = await runwayClient.generateVideo(enhancedPrompt, {
  duration,
  model: style === 'realistic' ? 'gen3a' : 'gen3a_turbo',
  useConsistentSeed: req.body.useConsistentSeed || false // NEW!
});
```

### Frontend Usage

**File**: `src/services/runwayML.js`

```javascript
// Modify generateVideo method
async generateVideo(prompt, options = {}) {
  if (!this.apiKey) {
    console.warn('RunwayML API key not provided. Using demo mode.');
    return this.generateDemoVideo(prompt, options);
  }

  const response = await fetch(`${this.baseUrl}/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      prompt, 
      ...options,
      useConsistentSeed: true // Enable consistent generation
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`RunwayML API error: ${errorData.message}`);
  }

  return response.json();
}
```

---

## 📊 Comparison: Random vs Consistent

### Random Seed (Default)

```
Dream: "Flying over golden city"
Generation 1: Golden towers, sunset sky, birds
Generation 2: Silver buildings, night time, clouds
Generation 3: Bronze architecture, dawn light, fog
```

**Each generation is UNIQUE** ✨

### Consistent Seed (With Implementation)

```
Dream: "Flying over golden city"
Generation 1: Golden towers, sunset sky, birds
Generation 2: Golden towers, sunset sky, birds (SAME!)
Generation 3: Golden towers, sunset sky, birds (SAME!)
```

**Each generation is IDENTICAL** 🎯

---

## 💡 Recommendations

### For Your Use Case

1. **If you want variety**: Keep current random seed implementation
2. **If you want consistency**: Implement the `generateConsistentSeed` function
3. **If you want both**: Add a toggle option in UI

### Best Practice

```javascript
// Add to API request body
{
  "dreamContent": "...",
  "style": "cinematic",
  "duration": 10,
  "consistency": "strict" | "varied" | "similar"
}

// Backend logic
const seedOptions = {
  strict: generateConsistentSeed(prompt), // Always same
  varied: Math.floor(Math.random() * 1000000), // Always different
  similar: generateConsistentSeed(prompt) + Math.floor(Math.random() * 100) // Similar but not identical
};
```

---

## 🚀 Quick Start Checklist

- [ ] Add `RUNWAY_API_KEY` to `backend/.env`
- [ ] Add `VITE_RUNWAY_API_KEY` to root `.env`
- [ ] Restart backend server
- [ ] Test API endpoint `/api/video-generation/providers`
- [ ] Generate test video
- [ ] Implement consistent seed if needed
- [ ] Test with same dream text multiple times
- [ ] Compare results

---

## 📝 Summary

**Current Behavior**: 
- ❌ Same dream text → **Different videos** each time (random seed)

**After Implementation**: 
- ✅ Same dream text → **Exact same video** each time (consistent seed)

**Your Choice**:
- Keep random for **variety and creativity**
- Use consistent for **predictable, reproducible results**
- Offer both options to **users via toggle**

---

## 🔗 Useful Links

- [RunwayML API Docs](https://docs.runwayml.com)
- [Pika Labs API](https://pika.art/docs)
- [Kaiber AI API](https://kaiber.ai/api)

---

**Need help implementing consistent video generation? Let me know!** 🚀
