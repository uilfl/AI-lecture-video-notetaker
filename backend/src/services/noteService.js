import { Note, Video, Course } from '../models/index.js';
import { NotFoundError, AuthorizationError, ValidationError } from '../utils/errors.js';
import { Op } from 'sequelize';

/**
 * Note Service
 * Clean architecture: business logic for note management
 * Handles both user-created and AI-generated notes
 */

class NoteService {
  /**
   * Create new note
   * @param {string} userId - User ID
   * @param {Object} noteData - Note data
   * @returns {Promise<Object>} Created note
   */
  async createNote(userId, { videoId, content, timestamp, important = false, topic = null }) {
    // Verify video ownership
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

    // Validate timestamp
    if (video.duration && timestamp > video.duration) {
      throw new ValidationError('Timestamp cannot exceed video duration');
    }

    // Create note
    const note = await Note.create({
      videoId,
      userId,
      content,
      timestamp,
      important,
      topic,
      aiGenerated: false,
    });

    return note;
  }

  /**
   * Get note by ID
   * @param {string} noteId - Note ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Note with video details
   */
  async getNoteById(noteId, userId) {
    const note = await Note.findOne({
      where: { id: noteId },
      include: [
        {
          model: Video,
          as: 'video',
          attributes: ['id', 'title', 'duration'],
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'title', 'userId'],
            },
          ],
        },
      ],
    });

    if (!note) {
      throw new NotFoundError('Note');
    }

    // Check ownership
    if (note.userId !== userId) {
      throw new AuthorizationError('You do not have access to this note');
    }

    return note;
  }

  /**
   * Get all notes for a video
   * @param {string} videoId - Video ID
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of notes
   */
  async getVideoNotes(videoId, userId, filters = {}) {
    // Verify video ownership
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

    // Build where clause
    const where = {
      videoId,
      userId,
    };

    if (filters.important !== undefined) {
      where.important = filters.important === 'true' || filters.important === true;
    }

    if (filters.aiGenerated !== undefined) {
      where.aiGenerated = filters.aiGenerated === 'true' || filters.aiGenerated === true;
    }

    if (filters.topic) {
      where.topic = filters.topic;
    }

    // Search in content
    if (filters.search) {
      where.content = {
        [Op.iLike]: `%${filters.search}%`,
      };
    }

    const notes = await Note.findAll({
      where,
      order: [['timestamp', 'ASC']],
    });

    return notes;
  }

  /**
   * Get all notes for a user across all videos
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Notes and pagination
   */
  async getUserNotes(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      courseId = null,
      important = null,
      search = null,
    } = options;

    const offset = (page - 1) * limit;

    const where = { userId };

    if (important !== null) {
      where.important = important === 'true' || important === true;
    }

    if (search) {
      where.content = {
        [Op.iLike]: `%${search}%`,
      };
    }

    // Include filters
    const include = [
      {
        model: Video,
        as: 'video',
        attributes: ['id', 'title', 'courseId'],
        ...(courseId && {
          where: { courseId },
        }),
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title'],
          },
        ],
      },
    ];

    const { count, rows: notes } = await Note.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Update note
   * @param {string} noteId - Note ID
   * @param {string} userId - User ID
   * @param {Object} updates - Note updates
   * @returns {Promise<Object>} Updated note
   */
  async updateNote(noteId, userId, updates) {
    const note = await Note.findByPk(noteId);

    if (!note) {
      throw new NotFoundError('Note');
    }

    if (note.userId !== userId) {
      throw new AuthorizationError('You do not have permission to update this note');
    }

    // Prevent updating AI-generated flag manually
    const allowedUpdates = ['content', 'timestamp', 'important', 'topic'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Validate new timestamp if provided
    if (filteredUpdates.timestamp !== undefined) {
      const video = await Video.findByPk(note.videoId);
      if (video.duration && filteredUpdates.timestamp > video.duration) {
        throw new ValidationError('Timestamp cannot exceed video duration');
      }
    }

    await note.update(filteredUpdates);

    return note;
  }

  /**
   * Delete note
   * @param {string} noteId - Note ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteNote(noteId, userId) {
    const note = await Note.findByPk(noteId);

    if (!note) {
      throw new NotFoundError('Note');
    }

    if (note.userId !== userId) {
      throw new AuthorizationError('You do not have permission to delete this note');
    }

    await note.destroy();
  }

  /**
   * Toggle note importance
   * @param {string} noteId - Note ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated note
   */
  async toggleImportant(noteId, userId) {
    const note = await Note.findByPk(noteId);

    if (!note) {
      throw new NotFoundError('Note');
    }

    if (note.userId !== userId) {
      throw new AuthorizationError('You do not have permission to update this note');
    }

    await note.update({ important: !note.important });

    return note;
  }

  /**
   * Bulk create notes (for AI-generated notes)
   * @param {string} userId - User ID
   * @param {string} videoId - Video ID
   * @param {Array} notesData - Array of note data
   * @returns {Promise<Array>} Created notes
   */
  async bulkCreateNotes(userId, videoId, notesData) {
    // Verify video ownership
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

    // Prepare notes for bulk insert
    const notes = notesData.map(noteData => ({
      videoId,
      userId,
      content: noteData.content,
      timestamp: noteData.timestamp,
      important: noteData.important || false,
      topic: noteData.topic || null,
      aiGenerated: true,
      confidence: noteData.confidence || null,
    }));

    // Bulk create
    const createdNotes = await Note.bulkCreate(notes);

    return createdNotes;
  }

  /**
   * Get notes grouped by topic
   * @param {string} videoId - Video ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Notes grouped by topic
   */
  async getNotesGroupedByTopic(videoId, userId) {
    const notes = await this.getVideoNotes(videoId, userId);

    // Group by topic
    const grouped = notes.reduce((acc, note) => {
      const topic = note.topic || 'Uncategorized';
      if (!acc[topic]) {
        acc[topic] = [];
      }
      acc[topic].push(note);
      return acc;
    }, {});

    return grouped;
  }
}

export default new NoteService();
