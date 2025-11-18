import express from 'express';
import aiController from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { handleValidationErrors } from '../middleware/validator.js';
import {
  videoIdParamValidator,
  analyzeVideoValidator,
  generateFlashcardsValidator,
  summarizeVideoValidator,
} from '../validators/aiValidator.js';

/**
 * AI Routes
 * Clean code: RESTful routing, AI rate limiting to control costs
 * All routes protected and rate-limited
 */

const router = express.Router();

// All routes require authentication and AI rate limiting
router.use(protect);
router.use(aiLimiter); // 50 requests per hour to control costs

// Analyze video transcript
router.post(
  '/analyze-video/:videoId',
  videoIdParamValidator,
  analyzeVideoValidator,
  handleValidationErrors,
  aiController.analyzeVideo
);

// Generate flashcards from notes
router.post(
  '/generate-flashcards',
  generateFlashcardsValidator,
  handleValidationErrors,
  aiController.generateFlashcards
);

// Detect topics from video
router.post(
  '/detect-topics/:videoId',
  videoIdParamValidator,
  handleValidationErrors,
  aiController.detectTopics
);

// Summarize video
router.post(
  '/summarize/:videoId',
  videoIdParamValidator,
  summarizeVideoValidator,
  handleValidationErrors,
  aiController.summarizeVideo
);

export default router;
