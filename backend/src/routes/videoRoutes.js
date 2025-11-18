import express from 'express';
import videoController from '../controllers/videoController.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validator.js';
import {
  createVideoValidator,
  updateVideoValidator,
  updateProgressValidator,
  videoIdValidator,
  courseIdParamValidator,
} from '../validators/videoValidator.js';

/**
 * Video Routes
 * Clean code: RESTful routing, protected endpoints
 */

const router = express.Router();

// All routes require authentication
router.use(protect);

// Video CRUD operations
router.post(
  '/',
  createVideoValidator,
  handleValidationErrors,
  videoController.create
);

router.get(
  '/:id',
  videoIdValidator,
  handleValidationErrors,
  videoController.getById
);

router.put(
  '/:id',
  videoIdValidator,
  updateVideoValidator,
  handleValidationErrors,
  videoController.update
);

router.delete(
  '/:id',
  videoIdValidator,
  handleValidationErrors,
  videoController.delete
);

// Video progress tracking
router.patch(
  '/:id/progress',
  videoIdValidator,
  updateProgressValidator,
  handleValidationErrors,
  videoController.updateProgress
);

// Transcript processing
router.post(
  '/:id/transcript',
  videoIdValidator,
  handleValidationErrors,
  videoController.processTranscript
);

// Get videos for a course (nested route)
router.get(
  '/course/:courseId',
  courseIdParamValidator,
  handleValidationErrors,
  videoController.getCourseVideos
);

export default router;
