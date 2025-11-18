import express from 'express';
import courseController from '../controllers/courseController.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validator.js';
import {
  createCourseValidator,
  updateCourseValidator,
  archiveCourseValidator,
  courseIdValidator,
  getCourseValidator,
} from '../validators/courseValidator.js';

/**
 * Course Routes
 * Clean code: RESTful routing, protected endpoints
 */

const router = express.Router();

// All routes require authentication
router.use(protect);

// Course CRUD operations
router.post(
  '/',
  createCourseValidator,
  handleValidationErrors,
  courseController.create
);

router.get(
  '/',
  getCourseValidator,
  handleValidationErrors,
  courseController.getAll
);

router.get(
  '/:id',
  courseIdValidator,
  handleValidationErrors,
  courseController.getById
);

router.put(
  '/:id',
  courseIdValidator,
  updateCourseValidator,
  handleValidationErrors,
  courseController.update
);

router.delete(
  '/:id',
  courseIdValidator,
  handleValidationErrors,
  courseController.delete
);

// Archive/unarchive
router.patch(
  '/:id/archive',
  courseIdValidator,
  archiveCourseValidator,
  handleValidationErrors,
  courseController.toggleArchive
);

// Course statistics
router.get(
  '/:id/stats',
  courseIdValidator,
  handleValidationErrors,
  courseController.getStats
);

export default router;
