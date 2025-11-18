import { Course, Video, Note } from '../models/index.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';

/**
 * Course Service
 * Clean architecture: business logic for course management
 */

class CourseService {
  /**
   * Create new course
   * @param {string} userId - User ID
   * @param {Object} courseData - Course data
   * @returns {Promise<Object>} Created course
   */
  async createCourse(userId, { title, description, subjectArea }) {
    const course = await Course.create({
      userId,
      title,
      description,
      subjectArea,
    });

    return course;
  }

  /**
   * Get all courses for user with pagination
   * @param {string} userId - User ID
   * @param {Object} options - Query options (page, limit, archived)
   * @returns {Promise<Object>} Courses and pagination data
   */
  async getUserCourses(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      includeArchived = false,
      subjectArea = null,
    } = options;

    const offset = (page - 1) * limit;

    const where = { userId };

    if (!includeArchived) {
      where.isArchived = false;
    }

    if (subjectArea) {
      where.subjectArea = subjectArea;
    }

    const { count, rows: courses } = await Course.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Video,
          as: 'videos',
          attributes: ['id', 'title', 'thumbnailUrl', 'duration'],
        },
      ],
    });

    // Calculate progress for each course
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        const courseJson = course.toJSON();

        // Get total videos and watched duration
        const videos = courseJson.videos || [];
        const totalDuration = videos.reduce((sum, v) => sum + (v.duration || 0), 0);
        const totalWatched = videos.reduce((sum, v) => sum + (v.watchedDuration || 0), 0);

        courseJson.videoCount = videos.length;
        courseJson.progress = totalDuration > 0 ? (totalWatched / totalDuration) * 100 : 0;

        return courseJson;
      })
    );

    return {
      courses: coursesWithProgress,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get single course by ID
   * @param {string} courseId - Course ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Course with videos
   */
  async getCourseById(courseId, userId) {
    const course = await Course.findOne({
      where: { id: courseId },
      include: [
        {
          model: Video,
          as: 'videos',
          order: [['createdAt', 'ASC']],
          include: [
            {
              model: Note,
              as: 'notes',
              attributes: ['id'],
            },
          ],
        },
      ],
    });

    if (!course) {
      throw new NotFoundError('Course');
    }

    // Check ownership
    if (course.userId !== userId) {
      throw new AuthorizationError('You do not have access to this course');
    }

    const courseJson = course.toJSON();

    // Add note counts to each video
    if (courseJson.videos) {
      courseJson.videos = courseJson.videos.map(video => ({
        ...video,
        noteCount: video.notes?.length || 0,
        notes: undefined, // Remove notes array, just keep count
      }));
    }

    return courseJson;
  }

  /**
   * Update course
   * @param {string} courseId - Course ID
   * @param {string} userId - User ID
   * @param {Object} updates - Course updates
   * @returns {Promise<Object>} Updated course
   */
  async updateCourse(courseId, userId, updates) {
    const course = await Course.findByPk(courseId);

    if (!course) {
      throw new NotFoundError('Course');
    }

    if (course.userId !== userId) {
      throw new AuthorizationError('You do not have permission to update this course');
    }

    // Only allow updating specific fields
    const allowedUpdates = ['title', 'description', 'subjectArea', 'isArchived'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    await course.update(filteredUpdates);

    return course;
  }

  /**
   * Delete course
   * @param {string} courseId - Course ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteCourse(courseId, userId) {
    const course = await Course.findByPk(courseId);

    if (!course) {
      throw new NotFoundError('Course');
    }

    if (course.userId !== userId) {
      throw new AuthorizationError('You do not have permission to delete this course');
    }

    await course.destroy();
  }

  /**
   * Archive/unarchive course
   * @param {string} courseId - Course ID
   * @param {string} userId - User ID
   * @param {boolean} archived - Archive status
   * @returns {Promise<Object>} Updated course
   */
  async toggleArchive(courseId, userId, archived) {
    return this.updateCourse(courseId, userId, { isArchived: archived });
  }

  /**
   * Get course statistics
   * @param {string} courseId - Course ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Course statistics
   */
  async getCourseStats(courseId, userId) {
    const course = await this.getCourseById(courseId, userId);

    const videos = course.videos || [];
    const totalVideos = videos.length;
    const totalDuration = videos.reduce((sum, v) => sum + (v.duration || 0), 0);
    const totalWatched = videos.reduce((sum, v) => sum + (v.watchedDuration || 0), 0);
    const totalNotes = videos.reduce((sum, v) => sum + (v.noteCount || 0), 0);

    return {
      courseId: course.id,
      title: course.title,
      totalVideos,
      totalDuration,
      totalWatched,
      totalNotes,
      progress: totalDuration > 0 ? (totalWatched / totalDuration) * 100 : 0,
      completedVideos: videos.filter(v =>
        v.duration && v.watchedDuration >= v.duration * 0.9
      ).length,
    };
  }
}

export default new CourseService();
