import { Video, Course, Note } from '../models/index.js';
import { NotFoundError, AuthorizationError, ValidationError } from '../utils/errors.js';
import {
  extractYouTubeId,
  isValidYouTubeUrl,
  getYouTubeMetadata,
  getYouTubeTranscript,
  buildYouTubeThumbnailUrl,
} from '../utils/youtube.js';
import logger from '../utils/logger.js';

/**
 * Video Service
 * Clean architecture: business logic for video management
 * Supports YouTube and designed for multi-platform extension
 */

class VideoService {
  /**
   * Add video to course
   * @param {string} userId - User ID
   * @param {Object} videoData - Video data
   * @returns {Promise<Object>} Created video
   */
  async addVideo(userId, { courseId, sourceUrl, title = null, sourceType = 'youtube' }) {
    // Verify course ownership
    const course = await Course.findByPk(courseId);

    if (!course) {
      throw new NotFoundError('Course');
    }

    if (course.userId !== userId) {
      throw new AuthorizationError('You do not have permission to add videos to this course');
    }

    // Handle different source types
    let videoData = {
      courseId,
      sourceUrl,
      sourceType,
      title: title || 'Untitled Video',
    };

    if (sourceType === 'youtube') {
      videoData = await this._processYouTubeVideo(sourceUrl, courseId, title);
    }

    // Create video
    const video = await Video.create(videoData);

    // Process transcript in background (don't wait for it)
    if (sourceType === 'youtube' && video.sourceVideoId) {
      this._processTranscriptAsync(video.id, video.sourceVideoId);
    }

    return video;
  }

  /**
   * Process YouTube video URL and extract metadata
   * @private
   */
  async _processYouTubeVideo(sourceUrl, courseId, customTitle) {
    // Extract video ID
    const videoId = extractYouTubeId(sourceUrl);

    if (!videoId) {
      throw new ValidationError('Invalid YouTube URL');
    }

    // Check if video already exists in this course
    const existingVideo = await Video.findOne({
      where: {
        courseId,
        sourceVideoId: videoId,
      },
    });

    if (existingVideo) {
      throw new ValidationError('This video is already in the course');
    }

    // Fetch metadata from YouTube
    try {
      const metadata = await getYouTubeMetadata(videoId);

      return {
        courseId,
        title: customTitle || metadata.title,
        sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
        sourceType: 'youtube',
        sourceVideoId: videoId,
        thumbnailUrl: metadata.thumbnailUrl || buildYouTubeThumbnailUrl(videoId),
        duration: metadata.duration,
        metadata: {
          author: metadata.author,
          platform: 'youtube',
        },
      };
    } catch (error) {
      logger.error('YouTube metadata fetch failed:', error);

      // Fallback: create video with minimal data
      return {
        courseId,
        title: customTitle || 'YouTube Video',
        sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
        sourceType: 'youtube',
        sourceVideoId: videoId,
        thumbnailUrl: buildYouTubeThumbnailUrl(videoId),
        metadata: {
          platform: 'youtube',
          metadataFetchFailed: true,
        },
      };
    }
  }

  /**
   * Process transcript asynchronously
   * @private
   */
  async _processTranscriptAsync(videoId, youtubeVideoId) {
    try {
      logger.info(`Processing transcript for video ${videoId}`);

      const transcriptData = await getYouTubeTranscript(youtubeVideoId);

      const video = await Video.findByPk(videoId);
      if (video) {
        await video.update({
          transcript: transcriptData.text,
          transcriptProcessed: transcriptData.available,
          duration: transcriptData.duration || video.duration,
        });

        logger.info(`Transcript processed for video ${videoId}`);
      }
    } catch (error) {
      logger.error(`Transcript processing failed for video ${videoId}:`, error);
    }
  }

  /**
   * Get video by ID
   * @param {string} videoId - Video ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Video with course and notes
   */
  async getVideoById(videoId, userId) {
    const video = await Video.findOne({
      where: { id: videoId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'userId'],
        },
        {
          model: Note,
          as: 'notes',
          where: { userId },
          required: false,
          order: [['timestamp', 'ASC']],
        },
      ],
    });

    if (!video) {
      throw new NotFoundError('Video');
    }

    // Check ownership through course
    if (video.course.userId !== userId) {
      throw new AuthorizationError('You do not have access to this video');
    }

    return video;
  }

  /**
   * Get all videos for a course
   * @param {string} courseId - Course ID
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of videos
   */
  async getCourseVideos(courseId, userId) {
    // Verify course ownership
    const course = await Course.findByPk(courseId);

    if (!course) {
      throw new NotFoundError('Course');
    }

    if (course.userId !== userId) {
      throw new AuthorizationError('You do not have access to this course');
    }

    const videos = await Video.findAll({
      where: { courseId },
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: Note,
          as: 'notes',
          where: { userId },
          required: false,
          attributes: ['id'],
        },
      ],
    });

    // Add note count to each video
    return videos.map(video => {
      const videoJson = video.toJSON();
      videoJson.noteCount = videoJson.notes?.length || 0;
      videoJson.progress = video.getWatchProgress();
      delete videoJson.notes;
      return videoJson;
    });
  }

  /**
   * Update video
   * @param {string} videoId - Video ID
   * @param {string} userId - User ID
   * @param {Object} updates - Video updates
   * @returns {Promise<Object>} Updated video
   */
  async updateVideo(videoId, userId, updates) {
    const video = await Video.findOne({
      where: { id: videoId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['userId'],
        },
      ],
    });

    if (!video) {
      throw new NotFoundError('Video');
    }

    if (video.course.userId !== userId) {
      throw new AuthorizationError('You do not have permission to update this video');
    }

    // Only allow updating specific fields
    const allowedUpdates = ['title', 'watchedDuration', 'lastWatched'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    await video.update(filteredUpdates);

    return video;
  }

  /**
   * Update video progress
   * @param {string} videoId - Video ID
   * @param {string} userId - User ID
   * @param {number} watchedDuration - Watched duration in seconds
   * @returns {Promise<Object>} Updated video
   */
  async updateProgress(videoId, userId, watchedDuration) {
    return this.updateVideo(videoId, userId, {
      watchedDuration,
      lastWatched: new Date(),
    });
  }

  /**
   * Delete video
   * @param {string} videoId - Video ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteVideo(videoId, userId) {
    const video = await Video.findOne({
      where: { id: videoId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['userId'],
        },
      ],
    });

    if (!video) {
      throw new NotFoundError('Video');
    }

    if (video.course.userId !== userId) {
      throw new AuthorizationError('You do not have permission to delete this video');
    }

    await video.destroy();
  }

  /**
   * Manually trigger transcript processing
   * @param {string} videoId - Video ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Processing status
   */
  async processTranscript(videoId, userId) {
    const video = await Video.findOne({
      where: { id: videoId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['userId'],
        },
      ],
    });

    if (!video) {
      throw new NotFoundError('Video');
    }

    if (video.course.userId !== userId) {
      throw new AuthorizationError('You do not have access to this video');
    }

    if (video.sourceType !== 'youtube' || !video.sourceVideoId) {
      throw new ValidationError('Transcript processing is only available for YouTube videos');
    }

    if (video.transcriptProcessed) {
      return {
        message: 'Transcript already processed',
        transcript: video.transcript,
      };
    }

    // Process transcript
    const transcriptData = await getYouTubeTranscript(video.sourceVideoId);

    await video.update({
      transcript: transcriptData.text,
      transcriptProcessed: transcriptData.available,
      duration: transcriptData.duration || video.duration,
    });

    return {
      message: transcriptData.available
        ? 'Transcript processed successfully'
        : 'Transcript not available for this video',
      available: transcriptData.available,
      transcript: transcriptData.text,
    };
  }
}

export default new VideoService();
