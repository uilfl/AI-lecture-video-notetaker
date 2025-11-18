import express from 'express';
import authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { handleValidationErrors } from '../middleware/validator.js';
import {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  updateProfileValidator,
} from '../validators/authValidator.js';

/**
 * Authentication Routes
 * Clean code: RESTful routing, clear separation of concerns
 */

const router = express.Router();

// Public routes (with rate limiting)
router.post(
  '/register',
  authLimiter,
  registerValidator,
  handleValidationErrors,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  loginValidator,
  handleValidationErrors,
  authController.login
);

// Protected routes (require authentication)
router.get('/me', protect, authController.getProfile);

router.put(
  '/profile',
  protect,
  updateProfileValidator,
  handleValidationErrors,
  authController.updateProfile
);

router.post(
  '/change-password',
  protect,
  changePasswordValidator,
  handleValidationErrors,
  authController.changePassword
);

router.post('/logout', protect, authController.logout);

export default router;
