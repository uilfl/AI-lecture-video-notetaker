/**
 * Application Configuration
 * Clean code: centralized configuration
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const APP_NAME = 'NoteGenius';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  COURSE_DETAIL: '/courses/:id',
  VIDEO: '/videos/:id',
  FLASHCARDS: '/flashcards',
  REVIEW: '/review',
  STATS: '/stats',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'notegenius_auth_token',
  USER: 'notegenius_user',
};

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  ME: '/auth/me',
  LOGOUT: '/auth/logout',

  // Courses
  COURSES: '/courses',
  COURSE: (id) => `/courses/${id}`,
  COURSE_STATS: (id) => `/courses/${id}/stats`,

  // Videos
  VIDEOS: '/videos',
  VIDEO: (id) => `/videos/${id}`,
  VIDEO_PROGRESS: (id) => `/videos/${id}/progress`,
  VIDEO_TRANSCRIPT: (id) => `/videos/${id}/transcript`,

  // Notes
  NOTES: '/notes',
  NOTE: (id) => `/notes/${id}`,
  VIDEO_NOTES: (videoId) => `/notes/video/${videoId}`,
  NOTES_BY_TOPIC: (videoId) => `/notes/video/${videoId}/by-topic`,

  // Flashcards
  FLASHCARDS: '/flashcards',
  FLASHCARD: (id) => `/flashcards/${id}`,
  DUE_FLASHCARDS: '/flashcards/due',
  REVIEW_FLASHCARD: (id) => `/flashcards/${id}/review`,
  FLASHCARD_STATS: '/flashcards/stats',

  // AI
  ANALYZE_VIDEO: (videoId) => `/ai/analyze-video/${videoId}`,
  GENERATE_FLASHCARDS: '/ai/generate-flashcards',
  DETECT_TOPICS: (videoId) => `/ai/detect-topics/${videoId}`,
  SUMMARIZE: (videoId) => `/ai/summarize/${videoId}`,
};
