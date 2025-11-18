import { Op } from 'sequelize';
import { User } from '../models/index.js';
import { generateTokens } from '../utils/jwt.js';
import {
  ConflictError,
  AuthenticationError,
  ValidationError,
} from '../utils/errors.js';

/**
 * Authentication Service
 * Clean architecture: business logic separated from controllers
 */

class AuthService {
  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user and tokens
   */
  async register({ email, username, password }) {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictError('Email already registered');
      }
      throw new ConflictError('Username already taken');
    }

    // Create user (password will be hashed by model hook)
    const user = await User.create({
      email,
      username,
      password,
    });

    // Generate tokens
    const tokens = generateTokens(user.id);

    return {
      user: user.toSafeObject(),
      ...tokens,
    };
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User and tokens
   */
  async login(email, password) {
    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last login
    await user.updateLastLogin();

    // Generate tokens
    const tokens = generateTokens(user.id);

    return {
      user: user.toSafeObject(),
      ...tokens,
    };
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    return user.toSafeObject();
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Updated user
   */
  async updateProfile(userId, updates) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Prevent updating sensitive fields directly
    const allowedUpdates = ['username', 'preferences'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    await user.update(filteredUpdates);

    return user.toSafeObject();
  }

  /**
   * Change password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Update password (will be hashed by model hook)
    user.password = newPassword;
    await user.save();
  }
}

// Export singleton instance
export default new AuthService();
