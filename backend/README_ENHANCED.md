# 🌟 Enhanced Dream Journey Analyzer - Complete Backend System

A comprehensive, production-ready backend system with advanced AI capabilities for dream analysis and video generation.

## 🚀 Complete Feature Set

### ✅ **1. Authentication & User Management**
- **Supabase Integration**: JWT-based authentication
- **Profile Management**: User profiles with metadata
- **Session Management**: Token refresh and validation
- **Security**: Rate limiting, CORS, input validation

### ✅ **2. Database Architecture (Supabase)**
```sql
-- Core Tables
users (handled by Supabase Auth)
dreams (user dreams with analysis)
demo_dreams (gallery content)
```

### ✅ **3. Advanced NLP Processing (Python Flask)**
- **spaCy**: Named entity recognition, linguistic analysis
- **Transformers**: Emotion classification, sentiment analysis
- **NLTK**: Text processing and keyword extraction
- **Psychological Analysis**: Symbol interpretation, theme extraction

### ✅ **4. Multi-Provider Video Generation**
- **RunwayML Gen-3**: Premium quality, realistic videos
- **Pika Labs**: Fast, creative generation
- **Kaiber AI**: Artistic and animated styles
- **Fallback System**: Automatic provider switching

### ✅ **5. Voice Assistant Integration**
- **OpenAI Whisper**: Speech-to-text conversion
- **OpenAI TTS**: Text-to-speech synthesis
- **Multi-format Support**: Audio upload and processing

### ✅ **6. Media Handling**
- **Image Processing**: Sharp-based optimization
- **Supabase Storage**: Cloud file storage
- **Multiple Formats**: Images, audio files
- **Automatic Optimization**: Resize, compress, format conversion

### ✅ **7. Comprehensive Dashboard APIs**
- **Dream Statistics**: Analytics and insights
- **User Progress**: Goals and achievements
- **Gallery Management**: Public/private content
- **Search & Filtering**: Advanced query capabilities

## 🏗️ Architecture Overview

```
Frontend (React/Vite) ←→ Node.js/Express API ←→ Python Flask NLP ←→ AI Services
                     ↓
                Supabase Database & Storage
                     ↓
            RunwayML/Pika/Kaiber Video APIs
```

## 📁 Project Structure

```
Dream_journey_analyzer/
├── backend/                 # Node.js Express API
│   ├── routes/             # API endpoints
│   │   ├── dreams.js       # Dream CRUD operations
│   │   ├── ai.js          # OpenAI integration
│   │   ├── video.js       # Basic video operations
│   │   ├── videoGeneration.js # Advanced video APIs
│   │   ├── auth.js        # Authentication
│   │   ├── media.js       # File upload/processing
│   │   └── speech.js      # Voice processing
│   ├── middleware/        # Security & validation
│   ├── utils/            # Utilities & logging
│   └── server.js         # Main server
├── nlp_backend/           # Python Flask NLP
│   ├── app.py            # Flask application
│   └── requirements.txt  # Python dependencies
├── src/                  # React frontend
└── supabase/            # Database migrations
```

## 🔧 Setup Instructions

### 1. **Install Dependencies**
```bash
# Main project
npm install

# Backend
cd backend && npm install

# NLP Backend
cd nlp_backend && pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 2. **Environment Configuration**

**Backend (.env):**
```env
# Server
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# AI Services
OPENAI_API_KEY=your_openai_key
RUNWAY_API_KEY=your_runway_key
PIKA_API_KEY=your_pika_key
KAIBER_API_KEY=your_kaiber_key

# Configuration
FRONTEND_URL=http://localhost:8083
```

**NLP Backend (.env):**
```env
FLASK_APP=app.py
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

### 3. **Database Setup**
Run these SQL files in Supabase SQL Editor:
1. `supabase/create-demo-dreams-table.sql`
2. `supabase/create-dreams-table.sql`
3. `supabase/insert-demo-data.sql`

### 4. **Start All Services**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Node.js Backend
cd backend && npm run dev

# Terminal 3: Python NLP Backend
cd nlp_backend && python app.py
```

## 🌐 API Endpoints

### **Dreams API** (`/api/dreams`)
- `GET /` - User dreams (paginated)
- `POST /` - Create dream
- `PUT /:id` - Update dream
- `DELETE /:id` - Delete dream
- `GET /public/gallery` - Public gallery
- `GET /stats/dashboard` - Statistics

### **AI Analysis** (`/api/ai`)
- `POST /analyze-dream` - Complete analysis
- `POST /extract-keywords` - Keywords only
- `POST /suggest-title` - Title suggestions
- `POST /analyze-emotions` - Emotion analysis

### **Advanced NLP** (Python Flask `:5000`)
- `POST /analyze` - Deep psychological analysis
- `POST /extract-keywords` - Advanced keyword extraction
- `POST /analyze-emotions` - Multi-model emotion analysis

### **Video Generation** (`/api/video-generation`)
- `POST /generate-advanced` - Multi-provider generation
- `GET /status-advanced/:id` - Status tracking
- `GET /providers` - Available providers

### **Media Handling** (`/api/media`)
- `POST /upload` - File upload
- `GET /my-files` - User files
- `DELETE /:filename` - Delete file

### **Speech Processing** (`/api/speech`)
- `POST /transcribe` - Speech-to-text
- `POST /synthesize` - Text-to-speech
- `GET /voices` - Available voices

## 🔒 Security Features

- **Rate Limiting**: Tiered limits (General/AI/Video)
- **Authentication**: JWT validation via Supabase
- **Input Validation**: Joi schema validation
- **File Security**: Type validation, size limits
- **CORS**: Configured origins
- **Error Handling**: Comprehensive logging

## 🎯 Production Deployment

### **Environment Variables**
```env
NODE_ENV=production
LOG_LEVEL=warn
RATE_LIMIT_MAX_REQUESTS=50
```

### **Recommended Stack**
- **Frontend**: Vercel/Netlify
- **Backend**: Railway/Render/DigitalOcean
- **NLP Backend**: Google Cloud Run/AWS Lambda
- **Database**: Supabase (managed)
- **Storage**: Supabase Storage

## 📊 Monitoring & Analytics

- **Winston Logging**: Structured logs
- **Health Endpoints**: `/health` monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance**: Request timing and metrics

## 🔄 Development Workflow

```bash
# Development (all services)
npm run dev:full

# Individual services
npm run dev          # Frontend only
npm run backend      # Backend only
cd nlp_backend && python app.py  # NLP service

# Production build
npm run build
```

## 🎨 Video Generation Providers

| Provider | Quality | Speed | Max Duration | Best For |
|----------|---------|-------|--------------|----------|
| RunwayML | Premium | Medium | 10s | Realistic, cinematic |
| Pika Labs | Good | Fast | 4s | Creative, quick |
| Kaiber | Artistic | Slow | 16s | Animated, stylized |

## 🧠 NLP Capabilities

- **Emotion Detection**: 11 emotion categories
- **Theme Extraction**: 10+ dream themes
- **Symbol Analysis**: Psychological interpretations
- **Keyword Extraction**: Context-aware keywords
- **Sentiment Analysis**: Multi-model approach
- **Summary Generation**: AI-powered insights

## 🎤 Voice Features

- **Speech Recognition**: Multi-format audio support
- **Text-to-Speech**: 6 voice options
- **Audio Processing**: Automatic optimization
- **Real-time**: Streaming capabilities

This enhanced backend provides enterprise-level capabilities for dream analysis, making it suitable for production deployment with scalable architecture and comprehensive feature coverage.
