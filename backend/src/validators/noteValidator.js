import { body, param, query } from 'express-validator';

/**
 * Note validators
 * Clean code: reusable validation rules
 */

export const createNoteValidator = [
  body('videoId')
    .notEmpty()
    .withMessage('Video ID is required')
    .isUUID()
    .withMessage('Invalid video ID format'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Note content is required')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Note content must be between 1 and 10000 characters'),

  body('timestamp')
    .notEmpty()
    .withMessage('Timestamp is required')
    .isInt({ min: 0 })
    .withMessage('Timestamp must be a non-negative integer'),

  body('important')
    .optional()
    .isBoolean()
    .withMessage('Important must be a boolean'),

  body('topic')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Topic must not exceed 100 characters'),
];

export const updateNoteValidator = [
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Note content cannot be empty')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Note content must be between 1 and 10000 characters'),

  body('timestamp')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Timestamp must be a non-negative integer'),

  body('important')
    .optional()
    .isBoolean()
    .withMessage('Important must be a boolean'),

  body('topic')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Topic must not exceed 100 characters'),
];

export const noteIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid note ID format'),
];

export const videoIdParamValidator = [
  param('videoId')
    .isUUID()
    .withMessage('Invalid video ID format'),
];

export const getNoteValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('courseId')
    .optional()
    .isUUID()
    .withMessage('Invalid course ID format'),

  query('important')
    .optional()
    .isBoolean()
    .withMessage('Important must be a boolean'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
];

export const getVideoNotesValidator = [
  query('important')
    .optional()
    .isBoolean()
    .withMessage('Important must be a boolean'),

  query('aiGenerated')
    .optional()
    .isBoolean()
    .withMessage('aiGenerated must be a boolean'),

  query('topic')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Topic must not exceed 100 characters'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
];
