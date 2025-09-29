# Dream Journey Analyzer

## Project Overview

**Dream Journey Analyzer** is an AI-powered web application that transforms your dreams into stunning visual stories. Using advanced NLP technology, it analyzes dream emotions, extracts keywords, and generates personalized storylines.

## Features

- 🧠 **AI Dream Analysis** - Advanced emotion and keyword extraction
- 🎬 **AI Video Generation** - Transform dreams into real AI-generated videos using RunwayML
- 📊 **Analytics Dashboard** - Track your dream patterns
- 🔐 **Secure Authentication** - User accounts and data protection
- 📱 **Responsive Design** - Works on all devices
- 🎤 **Voice Input** - Speak your dreams directly
- 📸 **Photo Attachment** - Add visual context to your dreams

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### 1. Install Dependencies
```bash
# Install all dependencies (frontend + backend)
npm run install:all
```

### 2. Environment Setup
```bash
# Interactive setup wizard
npm run setup

# Or manually create .env files (see ENVIRONMENT_SETUP.md for details)
```

**Required Environment Variables:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon key
- `VITE_RUNWAY_API_KEY` - Your RunwayML API key (for real video generation)
- `VITE_BACKEND_URL` - Backend server URL (default: http://localhost:3002)

### 3. Database Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL scripts in the `supabase/` directory in your Supabase SQL editor:
   - `create-dreams-table.sql`
   - `create-demo-dreams-table.sql`
   - `insert-demo-data.sql`

### 4. Start the Application
```bash
# Start both frontend and backend
npm run dev:full

# Or start them separately:
# Frontend (terminal 1)
npm run dev

# Backend (terminal 2)
npm run backend
```

### 5. Test Your Setup
```bash
# Verify everything is configured correctly
npm run test-setup
```

## Technology Stack

- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Express.js + Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4 (optional)
- **Video**: Demo videos (RunwayML integration ready)

## Project Structure

```
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   └── integrations/      # Supabase client
├── backend/               # Express.js backend
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── utils/            # Utility functions
├── supabase/             # Database schema and migrations
└── public/               # Static assets
```

## Development

### Available Scripts

- `npm run dev` - Start frontend development server
- `npm run backend` - Start backend development server
- `npm run dev:full` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run setup` - Interactive environment setup
- `npm run test-setup` - Verify setup configuration

### Environment Variables

Create `.env` files with your Supabase credentials:

**Frontend (.env):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:3002
```

**Backend (backend/.env):**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
PORT=3002
FRONTEND_URL=http://localhost:5173
```

## Features in Detail

### Dream Analysis
- **AI-Powered Analysis**: Uses OpenAI GPT-4 for intelligent dream interpretation
- **Emotion Detection**: Identifies emotional patterns and intensities
- **Keyword Extraction**: Extracts meaningful keywords and themes
- **Symbolic Interpretation**: Analyzes dream symbols and their meanings

### Video Generation
- **Demo Mode**: Uses sample videos for demonstration
- **Storyline Generation**: Creates narrative structures for videos
- **Photo Integration**: Incorporates user photos into video concepts
- **RunwayML Ready**: Prepared for real video generation API integration

### User Experience
- **Voice Input**: Speech-to-text for easy dream entry
- **Photo Upload**: Visual context for dreams
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live analysis progress and status

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Check your environment variables
   - Verify Supabase project is active
   - Ensure database tables are created

2. **Backend Not Starting**
   - Check if port 3002 is available
   - Verify all dependencies are installed
   - Check backend/.env file exists

3. **Database Errors**
   - Run SQL scripts in Supabase SQL editor
   - Check RLS policies are enabled
   - Verify service role key permissions

4. **CORS Issues**
   - Check backend CORS configuration
   - Verify FRONTEND_URL in backend/.env

### Getting Help

- Check the `SETUP.md` file for detailed setup instructions
- Run `npm run test-setup` to diagnose configuration issues
- Review the console logs for specific error messages

## Deployment

### Frontend (Vercel/Netlify)
1. Connect your Git repository
2. Set environment variables in deployment settings
3. Deploy automatically on push

### Backend (Railway/Heroku)
1. Connect your Git repository
2. Set environment variables
3. Deploy with automatic builds

### Database
- Use Supabase's built-in hosting
- Configure production RLS policies
- Set up proper backup strategies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
