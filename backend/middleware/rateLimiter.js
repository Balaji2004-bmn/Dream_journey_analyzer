const { RateLimiterMemory } = require('rate-limiter-flexible');
const logger = require('../utils/logger');

// Create rate limiter instances
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Number of requests
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900, // Per 15 minutes (900 seconds)
});

// AI-specific rate limiter (more restrictive)
const aiRateLimiter = new RateLimiterMemory({
  keyPrefix: 'ai',
  points: 100, // 100 AI requests
  duration: 900, // Per 15 minutes
});

// Video generation rate limiter (most restrictive)
const videoRateLimiter = new RateLimiterMemory({
  keyPrefix: 'video',
  points: 5, // 5 video generations
  duration: 3600, // Per hour
});

// General rate limiting middleware
const rateLimitMiddleware = async (req, res, next) => {
  try {
    const key = req.ip;
    await rateLimiter.consume(key);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${secs} seconds.`,
      retryAfter: secs
    });
  }
};

// AI-specific rate limiting middleware
const aiRateLimitMiddleware = async (req, res, next) => {
  try {
    const key = req.user ? `user_${req.user.id}` : req.ip;
    await aiRateLimiter.consume(key);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    logger.warn(`AI rate limit exceeded for: ${req.user ? req.user.id : req.ip}`);
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'AI Rate Limit Exceeded',
      message: `AI service rate limit exceeded. Try again in ${secs} seconds.`,
      retryAfter: secs
    });
  }
};

// Video generation rate limiting middleware
const videoRateLimitMiddleware = async (req, res, next) => {
  try {
    const key = req.user ? `user_${req.user.id}` : req.ip;
    await videoRateLimiter.consume(key);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    logger.warn(`Video rate limit exceeded for: ${req.user ? req.user.id : req.ip}`);
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Video Generation Rate Limit Exceeded',
      message: `Video generation rate limit exceeded. Try again in ${Math.round(secs / 60)} minutes.`,
      retryAfter: secs
    });
  }
};

module.exports = {
  rateLimitMiddleware,
  aiRateLimitMiddleware,
  videoRateLimitMiddleware
};

// Export default as general rate limiter
module.exports = rateLimitMiddleware;
