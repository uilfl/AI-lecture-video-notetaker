/**
 * Authentication Service
 * Clean code: handles all auth-related API calls
 */

import api from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/config';

class AuthService {
  /**
   * Register new user
   */
  async register(email, username, password) {
    const response = await api.post(API_ENDPOINTS.REGISTER, {
      email,
      username,
      password,
    });

    if (response.data.accessToken) {
      this.setAuth(response.data.accessToken, response.data.user);
    }

    return response.data;
  }

  /**
   * Login user
   */
  async login(email, password) {
    const response = await api.post(API_ENDPOINTS.LOGIN, {
      email,
      password,
    });

    if (response.data.accessToken) {
      this.setAuth(response.data.accessToken, response.data.user);
    }

    return response.data;
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    const response = await api.get(API_ENDPOINTS.ME);
    return response.data.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Get stored user
   */
  getUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Set authentication data
   */
  setAuth(token, user) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
}

export default new AuthService();
