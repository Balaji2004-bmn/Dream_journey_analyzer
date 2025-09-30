const Joi = require('joi');
const logger = require('../utils/logger');

// Dream validation schema
const dreamSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().min(10).max(5000).required(),
  analysis: Joi.object().optional(),
  thumbnail_url: Joi.string().uri().optional(),
  video_url: Joi.string().uri().optional(),
  video_prompt: Joi.string().max(1000).optional(),
  video_duration: Joi.number().min(1).max(60).optional(),
  is_public: Joi.boolean().optional()
});

// Dream analysis validation schema
const dreamAnalysisSchema = Joi.object({
  content: Joi.string().min(10).max(5000).required(),
  title: Joi.string().min(1).max(200).optional()
});

// Video generation validation schema
const videoGenerationSchema = Joi.object({
  dreamContent: Joi.string().min(10).max(2000).required(),
  title: Joi.string().min(1).max(200).required(),
  style: Joi.string().valid('cinematic', 'dreamy', 'surreal', 'realistic', 'animated').optional(),
  duration: Joi.number().min(5).max(60).optional()
});

// Generic validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('Validation failed:', errors);

      return res.status(400).json({
        error: 'Validation Error',
        message: 'Request data is invalid',
        details: errors
      });
    }

    req.body = value;
    next();
  };
};

// Specific validation middleware
const validateDream = validate(dreamSchema);
const validateDreamAnalysis = validate(dreamAnalysisSchema);
const validateVideoGeneration = validate(videoGenerationSchema);

module.exports = {
  validate,
  validateDream,
  validateDreamAnalysis,
  validateVideoGeneration
};
