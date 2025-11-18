import { body, param } from 'express-validator';

/**
 * Video validators
 * Clean code: reusable validation rules
 */

export const createVideoValidator = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .isUUID()
    .withMessage('Invalid course ID format'),

  body('sourceUrl')
    .notEmpty()
    .withMessage('Video URL is required')
    .isURL()
    .withMessage('Invalid URL format'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),

  body('sourceType')
    .optional()
    .isIn(['youtube', 'udemy', 'coursera', 'edx', 'vimeo', 'custom'])
    .withMessage('Invalid source type'),
];

export const updateVideoValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),

  body('watchedDuration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Watched duration must be a non-negative integer'),
];

export const updateProgressValidator = [
  body('watchedDuration')
    .notEmpty()
    .withMessage('Watched duration is required')
    .isInt({ min: 0 })
    .withMessage('Watched duration must be a non-negative integer'),
];

export const videoIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid video ID format'),
];

export const courseIdParamValidator = [
  param('courseId')
    .isUUID()
    .withMessage('Invalid course ID format'),
];
