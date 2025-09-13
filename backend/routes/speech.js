const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { authenticateUser } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer for audio uploads
const upload = multer({
  dest: 'uploads/audio/',
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for audio
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

// Speech-to-text conversion
router.post('/transcribe', authenticateUser, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No Audio File',
        message: 'No audio file was uploaded'
      });
    }

    // Create a readable stream from the uploaded file
    const audioStream = fs.createReadStream(req.file.path);
    audioStream.path = req.file.originalname || 'audio.webm';

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioStream,
      model: 'whisper-1',
      language: 'en', // Can be made dynamic based on user preference
      response_format: 'json',
      temperature: 0.2
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    logger.info(`Audio transcribed for user ${req.user.id}: ${transcription.text.length} characters`);

    res.json({
      success: true,
      transcription: {
        text: transcription.text,
        duration: req.file.size, // Approximate
        language: 'en'
      }
    });

  } catch (error) {
    logger.error('Speech transcription error:', error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        error: 'Service Unavailable',
        message: 'Speech-to-text service is temporarily unavailable. Please try again later.'
      });
    }

    res.status(500).json({
      error: 'Transcription Failed',
      message: 'Failed to transcribe audio. Please try again.'
    });
  }
});

// Text-to-speech conversion (for reading dream analysis)
router.post('/synthesize', authenticateUser, async (req, res) => {
  try {
    const { text, voice = 'alloy' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: 'No Text',
        message: 'Text is required for speech synthesis'
      });
    }

    if (text.length > 4000) {
      return res.status(400).json({
        error: 'Text Too Long',
        message: 'Text must be less than 4000 characters'
      });
    }

    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice, // alloy, echo, fable, onyx, nova, shimmer
      input: text,
      response_format: 'mp3'
    });

    // Convert to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Set response headers for audio download
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
      'Content-Disposition': 'attachment; filename="dream_analysis.mp3"'
    });

    logger.info(`Speech synthesized for user ${req.user.id}: ${text.length} characters`);

    res.send(buffer);

  } catch (error) {
    logger.error('Speech synthesis error:', error);

    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        error: 'Service Unavailable',
        message: 'Text-to-speech service is temporarily unavailable. Please try again later.'
      });
    }

    res.status(500).json({
      error: 'Synthesis Failed',
      message: 'Failed to synthesize speech. Please try again.'
    });
  }
});

// Get available voices
router.get('/voices', (req, res) => {
  const voices = [
    { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced voice' },
    { id: 'echo', name: 'Echo', description: 'Clear, professional voice' },
    { id: 'fable', name: 'Fable', description: 'Warm, storytelling voice' },
    { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative voice' },
    { id: 'nova', name: 'Nova', description: 'Bright, energetic voice' },
    { id: 'shimmer', name: 'Shimmer', description: 'Gentle, soothing voice' }
  ];

  res.json({
    success: true,
    voices
  });
});

module.exports = router;
