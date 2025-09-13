# Dream Journey Analyzer - Backend API

A comprehensive Node.js/Express backend for the Dream Journey Analyzer application, providing AI-powered dream analysis, video generation, and user management.

## Features

- 🤖 **AI Dream Analysis** - OpenAI GPT-4 powered dream interpretation
- 🎥 **Video Generation** - AI video creation from dream content
- 🔐 **Authentication** - Supabase-based user authentication
- 📊 **Dream Management** - CRUD operations for dreams
- 🛡️ **Security** - Rate limiting, CORS, and input validation
- 📝 **Logging** - Comprehensive Winston-based logging

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and configure:

```env
# Required Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key

# Optional Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify JWT token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/refresh` - Refresh session

### Dreams
- `GET /api/dreams` - Get user dreams (paginated)
- `GET /api/dreams/:id` - Get specific dream
- `POST /api/dreams` - Create new dream
- `PUT /api/dreams/:id` - Update dream
- `DELETE /api/dreams/:id` - Delete dream
- `GET /api/dreams/public/gallery` - Get public dreams for gallery
- `GET /api/dreams/stats/dashboard` - Get dream statistics

### AI Analysis
- `POST /api/ai/analyze-dream` - Full dream analysis
- `POST /api/ai/extract-keywords` - Extract keywords
- `POST /api/ai/suggest-title` - Generate title suggestions
- `POST /api/ai/analyze-emotions` - Emotion analysis

### Video Generation
- `POST /api/video/generate` - Generate video from dream
- `GET /api/video/status/:videoId` - Check generation status
- `GET /api/video/my-videos` - Get user's videos
- `DELETE /api/video/:videoId` - Delete video
- `GET /api/video/styles` - Get available video styles

## Project Structure

```
backend/
├── routes/           # API route handlers
│   ├── ai.js        # AI analysis endpoints
│   ├── auth.js      # Authentication endpoints
│   ├── dreams.js    # Dream CRUD operations
│   └── video.js     # Video generation endpoints
├── middleware/       # Express middleware
│   ├── auth.js      # Authentication middleware
│   ├── validation.js # Request validation
│   ├── rateLimiter.js # Rate limiting
│   └── errorHandler.js # Error handling
├── utils/           # Utility functions
│   └── logger.js    # Winston logger configuration
├── logs/            # Log files (auto-created)
├── uploads/         # File uploads (auto-created)
├── server.js        # Main server file
├── package.json     # Dependencies and scripts
└── .env            # Environment variables
```

## Security Features

- **Rate Limiting**: General (100 req/15min), AI (20 req/15min), Video (5 req/hour)
- **Authentication**: JWT token verification via Supabase
- **Input Validation**: Joi schema validation for all endpoints
- **CORS**: Configured for frontend origin
- **Helmet**: Security headers
- **Error Handling**: Comprehensive error responses

## Development

### Available Scripts
- `npm start` - Production server
- `npm run dev` - Development server with nodemon
- `npm test` - Run tests (Jest)

### Adding New Endpoints
1. Create route handler in `routes/`
2. Add validation schema in `middleware/validation.js`
3. Import and use in `server.js`

### Environment Variables
- **Required**: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `OPENAI_API_KEY`
- **Optional**: All others have sensible defaults

## Integration with Frontend

The backend is designed to work seamlessly with the React frontend:

1. **Authentication**: Uses same Supabase project
2. **CORS**: Configured for frontend URL
3. **API Format**: Consistent JSON responses
4. **Error Handling**: User-friendly error messages

## Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up proper logging
4. Configure reverse proxy (nginx)
5. Set up SSL certificates

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_KEY=your_production_service_key
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=https://your-domain.com
LOG_LEVEL=warn
```

## Monitoring

- **Health Check**: `GET /health`
- **Logs**: Winston logs to `logs/` directory
- **Error Tracking**: Comprehensive error logging
- **Rate Limiting**: Built-in request monitoring

## Contributing

1. Follow existing code structure
2. Add proper validation for new endpoints
3. Include error handling
4. Update documentation
5. Add tests for new features

## License

MIT License - see LICENSE file for details
