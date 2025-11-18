import { body, param } from 'express-validator';

/**
 * AI validators
 * Clean code: reusable validation rules
 */

export const videoIdParamValidator = [
  param('videoId')
    .isUUID()
    .withMessage('Invalid video ID format'),
];

export const analyzeVideoValidator = [
  body('maxNotes')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('maxNotes must be between 1 and 50'),

  body('autoCreate')
    .optional()
    .isBoolean()
    .withMessage('autoCreate must be a boolean'),
];

export const generateFlashcardsValidator = [
  body('noteIds')
    .isArray({ min: 1 })
    .withMessage('noteIds must be a non-empty array'),

  body('noteIds.*')
    .isUUID()
    .withMessage('Invalid note ID format'),

  body('cardsPerNote')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('cardsPerNote must be between 1 and 5'),

  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'mixed'])
    .withMessage('Invalid difficulty level'),

  body('autoCreate')
    .optional()
    .isBoolean()
    .withMessage('autoCreate must be a boolean'),
];

export const summarizeVideoValidator = [
  body('maxLength')
    .optional()
    .isInt({ min: 50, max: 500 })
    .withMessage('maxLength must be between 50 and 500 words'),
];
