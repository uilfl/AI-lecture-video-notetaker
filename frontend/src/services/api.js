/**
 * API Service
 * Clean architecture: centralized API communication
 */

import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../constants/config';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Handle 401 - unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/login';
      }

      // Return structured error
      return Promise.reject({
        message: error.response.data?.error?.message || 'An error occurred',
        status: error.response.status,
        details: error.response.data?.error?.details || null,
      });
    }

    // Network error
    return Promise.reject({
      message: 'Network error. Please check your connection.',
      status: null,
    });
  }
);

export default api;
