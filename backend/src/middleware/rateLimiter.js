import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.js';

/**
 * Rate limiting configurations
 * Clean code: separate limiters for different use cases
 */

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(res, 'Too many requests. Please try again later', 429);
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, please try again later',
  handler: (req, res) => {
    sendError(res, 'Too many login attempts. Please try again in 15 minutes', 429);
  },
});

/**
 * AI feature rate limiter (to control costs)
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 AI requests per hour
  message: 'AI request limit reached. Please try again later',
  handler: (req, res) => {
    sendError(res, 'AI request limit reached. Please upgrade your plan or try again later', 429);
  },
  skip: (req) => {
    // Skip rate limiting for premium users (implement tier checking here)
    return false;
  },
});
