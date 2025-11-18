import videoService from '../services/videoService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Video Controller
 * Clean code: thin controller, delegates to service
 */

class VideoController {
  /**
   * Add video to course
   * POST /api/v1/videos
   */
  create = asyncHandler(async (req, res) => {
    const { courseId, sourceUrl, title, sourceType } = req.body;

    const video = await videoService.addVideo(req.user.id, {
      courseId,
      sourceUrl,
      title,
      sourceType,
    });

    sendSuccess(res, { video }, 201, 'Video added successfully');
  });

  /**
   * Get video by ID
   * GET /api/v1/videos/:id
   */
  getById = asyncHandler(async (req, res) => {
    const video = await videoService.getVideoById(req.params.id, req.user.id);

    sendSuccess(res, { video });
  });

  /**
   * Get all videos for a course
   * GET /api/v1/courses/:courseId/videos
   */
  getCourseVideos = asyncHandler(async (req, res) => {
    const videos = await videoService.getCourseVideos(
      req.params.courseId,
      req.user.id
    );

    sendSuccess(res, { videos, count: videos.length });
  });

  /**
   * Update video
   * PUT /api/v1/videos/:id
   */
  update = asyncHandler(async (req, res) => {
    const video = await videoService.updateVideo(
      req.params.id,
      req.user.id,
      req.body
    );

    sendSuccess(res, { video }, 200, 'Video updated successfully');
  });

  /**
   * Update video progress
   * PATCH /api/v1/videos/:id/progress
   */
  updateProgress = asyncHandler(async (req, res) => {
    const { watchedDuration } = req.body;

    const video = await videoService.updateProgress(
      req.params.id,
      req.user.id,
      watchedDuration
    );

    sendSuccess(res, { video }, 200, 'Progress updated');
  });

  /**
   * Delete video
   * DELETE /api/v1/videos/:id
   */
  delete = asyncHandler(async (req, res) => {
    await videoService.deleteVideo(req.params.id, req.user.id);

    sendSuccess(res, null, 200, 'Video deleted successfully');
  });

  /**
   * Process video transcript
   * POST /api/v1/videos/:id/transcript
   */
  processTranscript = asyncHandler(async (req, res) => {
    const result = await videoService.processTranscript(
      req.params.id,
      req.user.id
    );

    sendSuccess(res, result, 200, result.message);
  });
}

export default new VideoController();
