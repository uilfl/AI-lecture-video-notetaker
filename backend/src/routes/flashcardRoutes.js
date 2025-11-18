import express from 'express';
import flashcardController from '../controllers/flashcardController.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validator.js';
import {
  createFlashcardValidator,
  updateFlashcardValidator,
  reviewFlashcardValidator,
  flashcardIdValidator,
  getFlashcardsValidator,
  getStatsValidator,
} from '../validators/flashcardValidator.js';

/**
 * Flashcard Routes
 * Clean code: RESTful routing, protected endpoints
 */

const router = express.Router();

// All routes require authentication
router.use(protect);

// Flashcard statistics (must be before /:id to avoid route conflict)
router.get(
  '/stats',
  getStatsValidator,
  handleValidationErrors,
  flashcardController.getStats
);

// Due flashcards (must be before /:id)
router.get(
  '/due',
  getFlashcardsValidator,
  handleValidationErrors,
  flashcardController.getDue
);

// Flashcard CRUD operations
router.post(
  '/',
  createFlashcardValidator,
  handleValidationErrors,
  flashcardController.create
);

router.get(
  '/',
  getFlashcardsValidator,
  handleValidationErrors,
  flashcardController.getAll
);

router.get(
  '/:id',
  flashcardIdValidator,
  handleValidationErrors,
  flashcardController.getById
);

router.put(
  '/:id',
  flashcardIdValidator,
  updateFlashcardValidator,
  handleValidationErrors,
  flashcardController.update
);

router.delete(
  '/:id',
  flashcardIdValidator,
  handleValidationErrors,
  flashcardController.delete
);

// Review flashcard
router.post(
  '/:id/review',
  flashcardIdValidator,
  reviewFlashcardValidator,
  handleValidationErrors,
  flashcardController.review
);

export default router;
