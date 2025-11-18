import { body, param, query } from 'express-validator';

/**
 * Course validators
 * Clean code: reusable validation rules
 */

export const createCourseValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Course title must be between 1 and 255 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),

  body('subjectArea')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Subject area must not exceed 100 characters'),
];

export const updateCourseValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Course title cannot be empty')
    .isLength({ min: 1, max: 255 })
    .withMessage('Course title must be between 1 and 255 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),

  body('subjectArea')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Subject area must not exceed 100 characters'),

  body('isArchived')
    .optional()
    .isBoolean()
    .withMessage('isArchived must be a boolean'),
];

export const archiveCourseValidator = [
  body('archived')
    .isBoolean()
    .withMessage('archived must be a boolean'),
];

export const courseIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid course ID format'),
];

export const getCourseValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('includeArchived')
    .optional()
    .isBoolean()
    .withMessage('includeArchived must be a boolean'),

  query('subjectArea')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Subject area must not exceed 100 characters'),
];
