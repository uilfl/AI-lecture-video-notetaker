import express from 'express';
import authRoutes from './authRoutes.js';

/**
 * Main router
 * Clean architecture: centralized route management
 */

const router = express.Router();

// API version prefix
const API_VERSION = '/v1';

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount routes
router.use(`${API_VERSION}/auth`, authRoutes);

// Future routes will be added here:
// router.use(`${API_VERSION}/courses`, courseRoutes);
// router.use(`${API_VERSION}/videos`, videoRoutes);
// router.use(`${API_VERSION}/notes`, noteRoutes);
// router.use(`${API_VERSION}/flashcards`, flashcardRoutes);
// router.use(`${API_VERSION}/reviews`, reviewRoutes);

export default router;
