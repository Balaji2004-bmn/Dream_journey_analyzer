# Assistant API Documentation

## Overview
The Assistant API provides a **dual-purpose AI assistant** that:
1. **Specializes** in the Adaptive Dream Journey Analyzer platform (primary role)
2. **Helps** with general questions like date/time, math, weather, coding, etc. (secondary role)

Uses Google Gemini 2.0 Flash as the primary provider with automatic fallback to OpenAI GPT-3.5 when needed.

---

## Key Features

✅ **Dual-Purpose Assistant**: Answers both project-specific AND general questions  
✅ **Project Expertise**: Deep knowledge about Dream Journey Analyzer platform  
✅ **General Helpfulness**: Can answer date/time, math, weather, coding questions, etc.  
✅ **Gemini-First Strategy**: Prioritizes Google Gemini 2.0 Flash for cost-efficiency and performance  
✅ **Automatic Fallback**: Seamlessly switches to OpenAI if Gemini fails  
✅ **Conversation Memory**: Maintains context for last 10 exchanges (20 messages)  
✅ **Auto-Cleanup**: Removes conversations older than 1 hour to prevent memory leaks  
✅ **Real-Time Date/Time**: Always knows the current IST date and time  

---

## API Endpoints

### 1. Send Message to Assistant

**POST** `/api/assistant`

**Request Body:**
```json
{
  "userMessage": "How do I generate a video from my dream?",
  "conversationId": "conv_1234567890_abc123" // Optional, for continuing conversations
}
```

**Response (Success):**
```json
{
  "assistantMessage": "To generate a video from your dream, follow these steps:\n1. Record your dream...",
  "conversationId": "conv_1234567890_abc123",
  "timestamp": "2025-10-04T08:29:22.000Z",
  "provider": "Gemini",
  "isProjectRelated": true
}
```

**Response (General Question - e.g., "What is 5 + 3?"):**
```json
{
  "assistantMessage": "5 + 3 = 8",
  "conversationId": "conv_1234567890_abc123",
  "timestamp": "2025-10-04T08:29:22.000Z",
  "provider": "Gemini",
  "isProjectRelated": false
}
```

**Response (Date/Time Question):**
```json
{
  "assistantMessage": "The current date and time is 2025-10-04 14:15:30 IST (India Standard Time).",
  "conversationId": "conv_1234567890_abc123",
  "timestamp": "2025-10-04T08:29:22.000Z",
  "provider": "Gemini",
  "isProjectRelated": false
}
```

**Response (Error):**
```json
{
  "error": "Assistant service temporarily unavailable. Please try again later."
}
```

---

### 2. Clear Conversation History

**DELETE** `/api/assistant/:conversationId`

**Response (Success):**
```json
{
  "message": "Conversation cleared successfully"
}
```

**Response (Not Found):**
```json
{
  "error": "Conversation not found"
}
```

---

## Environment Variables

Add these to your `.env` file:

```env
# Google Gemini API Key (Primary)
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI API Key (Fallback)
OPENAI_API_KEY=your_openai_api_key_here
```

**Note:** At least one API key is required. If both are provided, Gemini will be used first.

---

## Platform Knowledge

The assistant has comprehensive knowledge about:

### Features
- Dream Journal (recording dreams with date, mood, tags)
- AI Dream Analysis (symbols, themes, emotions)
- Video Generation (cinematic story videos)
- Dream Gallery (browsing and filtering)
- Analytics Dashboard (patterns and insights)

### Subscription Plans
- **Free**: Basic journaling, 5 dreams/month
- **Pro ($5/month - ₹415)**: Priority video, 10s videos, HD thumbnails
- **Premium ($10/month - ₹830)**: 15s videos, priority support, custom styles

### Payment
- UPI integration with QR code
- Razorpay support
- Screenshot upload for verification

### Technical Stack
- Frontend: React + Vite + Tailwind CSS + shadcn/ui
- Backend: Node.js + Express + Gemini API
- Database: Supabase (PostgreSQL)
- Video APIs: RunwayML, Pika Labs, Stability AI

### Troubleshooting
- Video generation failures
- Payment reflection delays
- Account access issues

---

## Project-Related Keywords

The assistant recognizes questions containing these keywords:
```javascript
['dream', 'journey', 'video', 'story', 'project', 'analyzer', 
 'dream analyzer', 'dream video', 'adaptive', 'platform',
 'subscription', 'plan', 'payment', 'upi', 'feature',
 'analysis', 'journal', 'gallery', 'analytics', 'generate',
 'pro', 'premium', 'free', 'pricing', 'account', 'sign up',
 'login', 'technical', 'supabase', 'gemini', 'troubleshoot']
```

---

## Usage Examples

### Example 1: Getting Started
```bash
curl -X POST http://localhost:3001/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "userMessage": "How do I get started with the platform?"
  }'
```

### Example 2: Continuing Conversation
```bash
curl -X POST http://localhost:3001/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "userMessage": "What about the premium plan?",
    "conversationId": "conv_1234567890_abc123"
  }'
```

### Example 3: Clearing History
```bash
curl -X DELETE http://localhost:3001/api/assistant/conv_1234567890_abc123
```

---

## Conversation Flow

```
┌─────────────────┐
│  User Message   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Keyword Check  │◄─── Project Keywords
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[Related]  [Unrelated]
    │         │
    │         ▼
    │    [Polite Rejection]
    │
    ▼
┌─────────────────┐
│  Try Gemini API │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[Success] [Failure]
    │         │
    │         ▼
    │    ┌──────────────┐
    │    │ Try OpenAI   │
    │    └──────┬───────┘
    │           │
    └───────────┴────►┌────────────────┐
                      │ Return Response│
                      └────────────────┘
```

---

## Response Times

- **Gemini API**: Typically 1-3 seconds
- **OpenAI Fallback**: Typically 2-5 seconds
- **Timeout**: 30 seconds (after which fallback is attempted)

---

## Rate Limiting

The assistant endpoint is subject to the global rate limiter configured in `middleware/rateLimiter.js`. Ensure you're not exceeding the limits.

---

## Error Handling

The assistant gracefully handles:
- Missing API keys
- Network timeouts
- Invalid API responses
- Empty or malformed messages
- Conversation not found

---

## Best Practices

1. **Reuse Conversation IDs**: For multi-turn conversations, always pass the same `conversationId`
2. **Handle Errors Gracefully**: Always check for `error` field in responses
3. **Validate User Input**: Ensure `userMessage` is not empty before sending
4. **Monitor Provider Usage**: Check the `provider` field to track which API is being used
5. **Clear Old Conversations**: Manually delete conversations when chat sessions end

---

## Testing

### Test with Project-Related Question
```javascript
const response = await fetch('http://localhost:3001/api/assistant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userMessage: 'How do I upgrade to Pro plan?'
  })
});

const data = await response.json();
console.log(data.assistantMessage); // Should provide upgrade instructions
console.log(data.provider); // 'Gemini' or 'OpenAI'
```

### Test with Unrelated Question
```javascript
const response = await fetch('http://localhost:3001/api/assistant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userMessage: 'What is the weather today?'
  })
});

const data = await response.json();
console.log(data.assistantMessage); 
// "I am specialized to answer questions about the Adaptive Dream Journey Analyzer project..."
console.log(data.isProjectRelated); // false
```

---

## Troubleshooting

### Issue: "API keys not configured" error
**Solution**: Add `GEMINI_API_KEY` or `OPENAI_API_KEY` to your `.env` file

### Issue: Gemini always fails, only OpenAI works
**Solution**: Verify your Gemini API key is valid and has proper permissions

### Issue: Conversations not being remembered
**Solution**: Ensure you're passing the same `conversationId` in subsequent requests

### Issue: Getting general responses instead of project-specific
**Solution**: Ensure your question contains at least one project-related keyword

---

## Security Notes

- API keys are stored in environment variables (never commit `.env` to git)
- Conversations are stored in memory (cleared after 1 hour)
- No user data is stored in conversation history
- CORS is configured to prevent unauthorized access

---

## Future Enhancements

- [ ] Support for multiple languages in responses
- [ ] Integration with user authentication for personalized responses
- [ ] Persistent conversation storage in database
- [ ] Analytics on most asked questions
- [ ] Support for voice input/output

---

## Support

For issues or questions about the Assistant API, contact the development team or open an issue in the project repository.
