import flashcardService from '../services/flashcardService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

/**
 * Flashcard Controller
 * Clean code: thin controller, delegates to service
 */

class FlashcardController {
  /**
   * Create flashcard
   * POST /api/v1/flashcards
   */
  create = asyncHandler(async (req, res) => {
    const { noteId, question, answer, difficulty } = req.body;

    const flashcard = await flashcardService.createFlashcard(req.user.id, {
      noteId,
      question,
      answer,
      difficulty,
    });

    sendSuccess(res, { flashcard }, 201, 'Flashcard created successfully');
  });

  /**
   * Get flashcard by ID
   * GET /api/v1/flashcards/:id
   */
  getById = asyncHandler(async (req, res) => {
    const flashcard = await flashcardService.getFlashcardById(req.params.id, req.user.id);

    sendSuccess(res, { flashcard });
  });

  /**
   * Get all user flashcards
   * GET /api/v1/flashcards
   */
  getAll = asyncHandler(async (req, res) => {
    const { page, limit, status, difficulty, dueOnly } = req.query;

    const result = await flashcardService.getUserFlashcards(req.user.id, {
      page,
      limit,
      status,
      difficulty,
      dueOnly: dueOnly === 'true',
    });

    sendPaginated(res, result.flashcards, result.pagination);
  });

  /**
   * Get due flashcards for review
   * GET /api/v1/flashcards/due
   */
  getDue = asyncHandler(async (req, res) => {
    const { limit = 20 } = req.query;

    const flashcards = await flashcardService.getDueFlashcards(req.user.id, limit);

    sendSuccess(res, { flashcards, count: flashcards.length });
  });

  /**
   * Update flashcard
   * PUT /api/v1/flashcards/:id
   */
  update = asyncHandler(async (req, res) => {
    const flashcard = await flashcardService.updateFlashcard(
      req.params.id,
      req.user.id,
      req.body
    );

    sendSuccess(res, { flashcard }, 200, 'Flashcard updated successfully');
  });

  /**
   * Delete flashcard
   * DELETE /api/v1/flashcards/:id
   */
  delete = asyncHandler(async (req, res) => {
    await flashcardService.deleteFlashcard(req.params.id, req.user.id);

    sendSuccess(res, null, 200, 'Flashcard deleted successfully');
  });

  /**
   * Review flashcard
   * POST /api/v1/flashcards/:id/review
   */
  review = asyncHandler(async (req, res) => {
    const { quality, timeTaken } = req.body;

    const result = await flashcardService.reviewFlashcard(
      req.params.id,
      req.user.id,
      quality,
      timeTaken
    );

    sendSuccess(res, result, 200, 'Review recorded successfully');
  });

  /**
   * Get review statistics
   * GET /api/v1/flashcards/stats
   */
  getStats = asyncHandler(async (req, res) => {
    const { period = 'all' } = req.query;

    const stats = await flashcardService.getReviewStats(req.user.id, period);

    sendSuccess(res, { stats });
  });
}

export default new FlashcardController();
