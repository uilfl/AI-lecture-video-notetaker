import { body, param, query } from 'express-validator';

/**
 * Flashcard validators
 * Clean code: reusable validation rules
 */

export const createFlashcardValidator = [
  body('noteId')
    .optional()
    .isUUID()
    .withMessage('Invalid note ID format'),

  body('question')
    .trim()
    .notEmpty()
    .withMessage('Question is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Question must be between 1 and 1000 characters'),

  body('answer')
    .trim()
    .notEmpty()
    .withMessage('Answer is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Answer must be between 1 and 2000 characters'),

  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level'),
];

export const updateFlashcardValidator = [
  body('question')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Question cannot be empty')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Question must be between 1 and 1000 characters'),

  body('answer')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Answer cannot be empty')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Answer must be between 1 and 2000 characters'),

  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level'),
];

export const reviewFlashcardValidator = [
  body('quality')
    .notEmpty()
    .withMessage('Quality rating is required')
    .isInt({ min: 0, max: 5 })
    .withMessage('Quality rating must be between 0 and 5'),

  body('timeTaken')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time taken must be a non-negative integer'),
];

export const flashcardIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid flashcard ID format'),
];

export const getFlashcardsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(['new', 'learning', 'reviewing', 'mastered'])
    .withMessage('Invalid status'),

  query('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level'),

  query('dueOnly')
    .optional()
    .isBoolean()
    .withMessage('dueOnly must be a boolean'),
];

export const getStatsValidator = [
  query('period')
    .optional()
    .isIn(['day', 'week', 'month', 'all'])
    .withMessage('Invalid period'),
];
