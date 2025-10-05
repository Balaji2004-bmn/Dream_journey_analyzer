# Assistant Rejection Test Examples

## ✅ Questions That SHOULD Be Answered

These questions are about the Dream Journey Analyzer project:

1. ✅ "How do I record a dream?"
2. ✅ "What is the Pro plan pricing?"
3. ✅ "How do I generate videos from dreams?"
4. ✅ "What features does this platform have?"
5. ✅ "How do I upgrade my subscription?"
6. ✅ "What technology stack is used?"
7. ✅ "How does the dream analysis work?"
8. ✅ "Can I export my dreams?"
9. ✅ "What payment methods are supported?"
10. ✅ "How long does video generation take?"

---

## ❌ Questions That SHOULD Be Rejected

These questions are unrelated to the project:

1. ❌ "What is the weather today?"
2. ❌ "How do I code in Python?"
3. ❌ "What is 2 + 2?"
4. ❌ "Tell me a joke"
5. ❌ "Who is the president of USA?"
6. ❌ "What is the capital of France?"
7. ❌ "How do I bake a cake?"
8. ❌ "What is quantum physics?"
9. ❌ "Translate this to Spanish"
10. ❌ "What are the latest news?"

**Expected Response:**
```
"I am specialized to answer questions about the Adaptive Dream Journey Analyzer project. For other questions, please use a general AI service."
```

---

## 🧪 Quick Manual Tests

### Test 1: Project Question (Should Answer)
```bash
curl -X POST http://localhost:3001/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "How do I record my dreams?"}'
```
**Expected:** Detailed answer about dream recording

---

### Test 2: Weather Question (Should Reject)
```bash
curl -X POST http://localhost:3001/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "What is the weather today?"}'
```
**Expected:** Rejection message

---

### Test 3: Math Question (Should Reject)
```bash
curl -X POST http://localhost:3001/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "What is 5 + 3?"}'
```
**Expected:** Rejection message

---

### Test 4: Coding Question (Should Reject)
```bash
curl -X POST http://localhost:3001/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "How do I write a for loop?"}'
```
**Expected:** Rejection message

---

## 🤖 Run Automated Tests

```bash
cd backend
node tests/test-assistant.js
```

This will test:
- ✅ Project-related questions (should answer)
- ❌ Weather questions (should reject)
- ❌ Math questions (should reject)
- ❌ Coding questions (should reject)
- ✅ Conversation continuity
- ✅ Error handling

---

## 🔍 Debug Mode

If the assistant is answering general questions, check:

1. **Keyword Detection**: Look at `isProjectQuestion()` function in `routes/assistant.js`
2. **System Prompt**: Verify AI understands rejection rules in `PROJECT_SYSTEM_PROMPT`
3. **Test Response**: Check `isProjectRelated` field in API response

```javascript
{
  "assistantMessage": "...",
  "isProjectRelated": false  // Should be false for rejected questions
}
```

---

## 📊 Expected Test Results

```
Test 1: Project-related question
✓ Response received
  Provider: Gemini
  IsProjectRelated: true

Test 3: Unrelated question (weather)
✓ Correctly rejected unrelated question
  IsProjectRelated: false
  Message: I am specialized to answer questions about...

Test 3b: Unrelated question (math)
✓ Correctly rejected math question
  IsProjectRelated: false

Test 3c: Unrelated question (coding)
✓ Correctly rejected coding question
  IsProjectRelated: false
```
