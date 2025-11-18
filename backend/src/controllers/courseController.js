import courseService from '../services/courseService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

/**
 * Course Controller
 * Clean code: thin controller, delegates to service
 */

class CourseController {
  /**
   * Create new course
   * POST /api/v1/courses
   */
  create = asyncHandler(async (req, res) => {
    const { title, description, subjectArea } = req.body;

    const course = await courseService.createCourse(req.user.id, {
      title,
      description,
      subjectArea,
    });

    sendSuccess(res, { course }, 201, 'Course created successfully');
  });

  /**
   * Get all user courses
   * GET /api/v1/courses
   */
  getAll = asyncHandler(async (req, res) => {
    const { page, limit, includeArchived, subjectArea } = req.query;

    const result = await courseService.getUserCourses(req.user.id, {
      page,
      limit,
      includeArchived: includeArchived === 'true',
      subjectArea,
    });

    sendPaginated(res, result.courses, result.pagination);
  });

  /**
   * Get single course
   * GET /api/v1/courses/:id
   */
  getById = asyncHandler(async (req, res) => {
    const course = await courseService.getCourseById(req.params.id, req.user.id);

    sendSuccess(res, { course });
  });

  /**
   * Update course
   * PUT /api/v1/courses/:id
   */
  update = asyncHandler(async (req, res) => {
    const course = await courseService.updateCourse(
      req.params.id,
      req.user.id,
      req.body
    );

    sendSuccess(res, { course }, 200, 'Course updated successfully');
  });

  /**
   * Delete course
   * DELETE /api/v1/courses/:id
   */
  delete = asyncHandler(async (req, res) => {
    await courseService.deleteCourse(req.params.id, req.user.id);

    sendSuccess(res, null, 200, 'Course deleted successfully');
  });

  /**
   * Archive/unarchive course
   * PATCH /api/v1/courses/:id/archive
   */
  toggleArchive = asyncHandler(async (req, res) => {
    const { archived } = req.body;

    const course = await courseService.toggleArchive(
      req.params.id,
      req.user.id,
      archived
    );

    sendSuccess(
      res,
      { course },
      200,
      archived ? 'Course archived' : 'Course unarchived'
    );
  });

  /**
   * Get course statistics
   * GET /api/v1/courses/:id/stats
   */
  getStats = asyncHandler(async (req, res) => {
    const stats = await courseService.getCourseStats(req.params.id, req.user.id);

    sendSuccess(res, { stats });
  });
}

export default new CourseController();
