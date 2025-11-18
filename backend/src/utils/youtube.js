import axios from 'axios';
import { ExternalServiceError, ValidationError } from './errors.js';
import logger from './logger.js';

/**
 * YouTube utility functions
 * Clean code: focused on YouTube-specific operations
 */

/**
 * Extract YouTube video ID from URL
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null
 */
export const extractYouTubeId = (url) => {
  if (!url) return null;

  // Regular expression patterns for different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Validate YouTube URL
 * @param {string} url - YouTube URL
 * @returns {boolean} True if valid YouTube URL
 */
export const isValidYouTubeUrl = (url) => {
  return extractYouTubeId(url) !== null;
};

/**
 * Get YouTube video metadata (using oEmbed API - no API key required)
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} Video metadata
 */
export const getYouTubeMetadata = async (videoId) => {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    const response = await axios.get(url, {
      timeout: 10000,
    });

    return {
      title: response.data.title,
      author: response.data.author_name,
      thumbnailUrl: response.data.thumbnail_url,
      // oEmbed doesn't provide duration, we'll get that from transcript API or set null
      duration: null,
    };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new ValidationError('Video not found or is private/unavailable');
    }

    logger.error('YouTube metadata fetch failed:', error);
    throw new ExternalServiceError('YouTube', 'Failed to fetch video metadata');
  }
};

/**
 * Get YouTube video transcript
 * Note: This uses youtube-transcript package
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} Transcript data
 */
export const getYouTubeTranscript = async (videoId) => {
  try {
    // Dynamic import to avoid issues if package not installed yet
    const { YoutubeTranscript } = await import('youtube-transcript');

    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      return {
        available: false,
        text: null,
        segments: [],
      };
    }

    // Combine transcript segments into full text
    const fullText = transcript.map(item => item.text).join(' ');

    // Get video duration from last transcript segment
    const duration = transcript[transcript.length - 1]?.offset
      ? Math.ceil((transcript[transcript.length - 1].offset + transcript[transcript.length - 1].duration) / 1000)
      : null;

    return {
      available: true,
      text: fullText,
      duration, // in seconds
      segments: transcript.map(item => ({
        text: item.text,
        start: Math.floor(item.offset / 1000), // Convert to seconds
        duration: Math.ceil(item.duration / 1000),
      })),
    };
  } catch (error) {
    logger.warn(`Transcript not available for video ${videoId}:`, error.message);

    return {
      available: false,
      text: null,
      segments: [],
      error: error.message,
    };
  }
};

/**
 * Build YouTube embed URL
 * @param {string} videoId - YouTube video ID
 * @param {Object} options - Embed options
 * @returns {string} Embed URL
 */
export const buildYouTubeEmbedUrl = (videoId, options = {}) => {
  const {
    autoplay = 0,
    controls = 1,
    start = 0,
    modestbranding = 1,
  } = options;

  const params = new URLSearchParams({
    autoplay,
    controls,
    modestbranding,
    ...(start > 0 && { start }),
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

/**
 * Build YouTube thumbnail URL
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality (default, medium, high, maxres)
 * @returns {string} Thumbnail URL
 */
export const buildYouTubeThumbnailUrl = (videoId, quality = 'high') => {
  const qualityMap = {
    default: 'default.jpg',
    medium: 'mqdefault.jpg',
    high: 'hqdefault.jpg',
    standard: 'sddefault.jpg',
    maxres: 'maxresdefault.jpg',
  };

  const filename = qualityMap[quality] || qualityMap.high;
  return `https://img.youtube.com/vi/${videoId}/${filename}`;
};

/**
 * Format seconds to HH:MM:SS or MM:SS
 * @param {number} seconds - Seconds
 * @returns {string} Formatted time
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`;
};
