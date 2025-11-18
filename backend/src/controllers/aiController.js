import openaiService from '../services/openaiService.js';
import noteService from '../services/noteService.js';
import flashcardService from '../services/flashcardService.js';
import videoService from '../services/videoService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';
import { ValidationError } from '../utils/errors.js';

/**
 * AI Controller
 * Clean code: handles AI-powered features
 * Rate-limited to control costs
 */

class AIController {
  /**
   * Analyze video transcript and generate note suggestions
   * POST /api/v1/ai/analyze-video/:videoId
   */
  analyzeVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { maxNotes = 10, autoCreate = false } = req.body;

    // Get video and verify ownership
    const video = await videoService.getVideoById(videoId, req.user.id);

    if (!video.transcript) {
      throw new ValidationError('Video transcript not available');
    }

    // Analyze transcript
    const suggestions = await openaiService.analyzeTranscript(video.transcript, {
      maxNotes,
    });

    // Optionally create notes automatically
    if (autoCreate && suggestions.length > 0) {
      await noteService.bulkCreateNotes(req.user.id, videoId, suggestions);
    }

    sendSuccess(res, {
      suggestions,
      created: autoCreate,
      count: suggestions.length,
    }, 200, 'Video analyzed successfully');
  });

  /**
   * Generate flashcards from notes
   * POST /api/v1/ai/generate-flashcards
   */
  generateFlashcards = asyncHandler(async (req, res) => {
    const { noteIds, cardsPerNote = 2, difficulty = 'mixed', autoCreate = false } = req.body;

    if (!noteIds || noteIds.length === 0) {
      throw new ValidationError('Note IDs are required');
    }

    // Get notes
    const notes = await Promise.all(
      noteIds.map(id => noteService.getNoteById(id, req.user.id))
    );

    // Generate flashcards
    const flashcards = await openaiService.generateFlashcards(notes, {
      cardsPerNote,
      difficulty,
    });

    // Optionally create flashcards automatically
    let created = [];
    if (autoCreate && flashcards.length > 0) {
      created = await flashcardService.bulkCreateFlashcards(
        req.user.id,
        noteIds[0], // Associate with first note
        flashcards
      );
    }

    sendSuccess(res, {
      flashcards: autoCreate ? created : flashcards,
      created: autoCreate,
      count: flashcards.length,
    }, 200, 'Flashcards generated successfully');
  });

  /**
   * Detect topics from video transcript
   * POST /api/v1/ai/detect-topics/:videoId
   */
  detectTopics = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Get video and verify ownership
    const video = await videoService.getVideoById(videoId, req.user.id);

    if (!video.transcript) {
      throw new ValidationError('Video transcript not available');
    }

    // Detect topics
    const topics = await openaiService.detectTopics(video.transcript);

    sendSuccess(res, { topics });
  });

  /**
   * Generate video summary
   * POST /api/v1/ai/summarize/:videoId
   */
  summarizeVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { maxLength = 200 } = req.body;

    // Get video and verify ownership
    const video = await videoService.getVideoById(videoId, req.user.id);

    if (!video.transcript) {
      throw new ValidationError('Video transcript not available');
    }

    // Generate summary
    const summary = await openaiService.generateSummary(video.transcript, maxLength);

    sendSuccess(res, { summary });
  });
}

export default new AIController();
