import noteService from '../services/noteService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

/**
 * Note Controller
 * Clean code: thin controller, delegates to service
 */

class NoteController {
  /**
   * Create new note
   * POST /api/v1/notes
   */
  create = asyncHandler(async (req, res) => {
    const { videoId, content, timestamp, important, topic } = req.body;

    const note = await noteService.createNote(req.user.id, {
      videoId,
      content,
      timestamp,
      important,
      topic,
    });

    sendSuccess(res, { note }, 201, 'Note created successfully');
  });

  /**
   * Get note by ID
   * GET /api/v1/notes/:id
   */
  getById = asyncHandler(async (req, res) => {
    const note = await noteService.getNoteById(req.params.id, req.user.id);

    sendSuccess(res, { note });
  });

  /**
   * Get all notes for a video
   * GET /api/v1/videos/:videoId/notes
   */
  getVideoNotes = asyncHandler(async (req, res) => {
    const { important, aiGenerated, topic, search } = req.query;

    const notes = await noteService.getVideoNotes(req.params.videoId, req.user.id, {
      important,
      aiGenerated,
      topic,
      search,
    });

    sendSuccess(res, { notes, count: notes.length });
  });

  /**
   * Get all user notes
   * GET /api/v1/notes
   */
  getUserNotes = asyncHandler(async (req, res) => {
    const { page, limit, courseId, important, search } = req.query;

    const result = await noteService.getUserNotes(req.user.id, {
      page,
      limit,
      courseId,
      important,
      search,
    });

    sendPaginated(res, result.notes, result.pagination);
  });

  /**
   * Update note
   * PUT /api/v1/notes/:id
   */
  update = asyncHandler(async (req, res) => {
    const note = await noteService.updateNote(
      req.params.id,
      req.user.id,
      req.body
    );

    sendSuccess(res, { note }, 200, 'Note updated successfully');
  });

  /**
   * Delete note
   * DELETE /api/v1/notes/:id
   */
  delete = asyncHandler(async (req, res) => {
    await noteService.deleteNote(req.params.id, req.user.id);

    sendSuccess(res, null, 200, 'Note deleted successfully');
  });

  /**
   * Toggle note importance
   * PATCH /api/v1/notes/:id/important
   */
  toggleImportant = asyncHandler(async (req, res) => {
    const note = await noteService.toggleImportant(req.params.id, req.user.id);

    sendSuccess(res, { note }, 200, 'Note importance toggled');
  });

  /**
   * Get notes grouped by topic
   * GET /api/v1/videos/:videoId/notes/by-topic
   */
  getByTopic = asyncHandler(async (req, res) => {
    const grouped = await noteService.getNotesGroupedByTopic(
      req.params.videoId,
      req.user.id
    );

    sendSuccess(res, { topics: grouped });
  });
}

export default new NoteController();
