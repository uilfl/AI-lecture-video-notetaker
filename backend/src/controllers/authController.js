import authService from '../services/authService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Authentication Controller
 * Clean code: thin controller, delegates to service layer
 */

class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   */
  register = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    const result = await authService.register({ email, username, password });

    sendSuccess(res, result, 201, 'Registration successful');
  });

  /**
   * Login user
   * POST /api/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    sendSuccess(res, result, 200, 'Login successful');
  });

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  getProfile = asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.id);

    sendSuccess(res, { user });
  });

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user.id, req.body);

    sendSuccess(res, { user }, 200, 'Profile updated successfully');
  });

  /**
   * Change password
   * POST /api/auth/change-password
   */
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(req.user.id, currentPassword, newPassword);

    sendSuccess(res, null, 200, 'Password changed successfully');
  });

  /**
   * Logout user
   * POST /api/auth/logout
   */
  logout = asyncHandler(async (req, res) => {
    // With JWT, logout is handled client-side by removing the token
    // This endpoint exists for consistency and future session management
    sendSuccess(res, null, 200, 'Logout successful');
  });
}

export default new AuthController();
