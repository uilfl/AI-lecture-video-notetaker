import jwt from 'jsonwebtoken';
import { asyncHandler } from './errorHandler.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
import { User } from '../models/index.js';

/**
 * Protect routes - verify JWT token
 * Clean code: single responsibility, clear error messages
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    throw new AuthenticationError('Please log in to access this resource');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new AuthenticationError('User no longer exists');
    }

    if (!user.isActive) {
      throw new AuthorizationError('Account is deactivated');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AuthenticationError('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token expired. Please log in again');
    }
    throw error;
  }
});

/**
 * Check if user owns the resource
 * Generic ownership validation
 *
 * @param {Object} Model - Sequelize model
 * @param {string} paramName - Request param name (default: 'id')
 */
export const checkOwnership = (Model, paramName = 'id') => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params[paramName];
    const resource = await Model.findByPk(resourceId);

    if (!resource) {
      throw new NotFoundError(Model.name);
    }

    if (resource.userId !== req.user.id) {
      throw new AuthorizationError('You do not have permission to access this resource');
    }

    // Attach resource to request for reuse
    req.resource = resource;
    next();
  });
};

/**
 * Optional authentication
 * Allows both authenticated and unauthenticated access
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Continue without user
    }
  }

  next();
});
