import express from 'express';
import noteController from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validator.js';
import {
  createNoteValidator,
  updateNoteValidator,
  noteIdValidator,
  videoIdParamValidator,
  getNoteValidator,
  getVideoNotesValidator,
} from '../validators/noteValidator.js';

/**
 * Note Routes
 * Clean code: RESTful routing, protected endpoints
 */

const router = express.Router();

// All routes require authentication
router.use(protect);

// Note CRUD operations
router.post(
  '/',
  createNoteValidator,
  handleValidationErrors,
  noteController.create
);

router.get(
  '/',
  getNoteValidator,
  handleValidationErrors,
  noteController.getUserNotes
);

router.get(
  '/:id',
  noteIdValidator,
  handleValidationErrors,
  noteController.getById
);

router.put(
  '/:id',
  noteIdValidator,
  updateNoteValidator,
  handleValidationErrors,
  noteController.update
);

router.delete(
  '/:id',
  noteIdValidator,
  handleValidationErrors,
  noteController.delete
);

// Toggle importance
router.patch(
  '/:id/important',
  noteIdValidator,
  handleValidationErrors,
  noteController.toggleImportant
);

// Get notes for a video (nested route)
router.get(
  '/video/:videoId',
  videoIdParamValidator,
  getVideoNotesValidator,
  handleValidationErrors,
  noteController.getVideoNotes
);

// Get notes grouped by topic
router.get(
  '/video/:videoId/by-topic',
  videoIdParamValidator,
  handleValidationErrors,
  noteController.getByTopic
);

export default router;
