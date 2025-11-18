import { Flashcard, Note, ReviewSession, User } from '../models/index.js';
import { NotFoundError, AuthorizationError, ValidationError } from '../utils/errors.js';
import { Op } from 'sequelize';

/**
 * Flashcard Service
 * Clean architecture: business logic for flashcard management
 * Implements SM-2 spaced repetition algorithm
 */

class FlashcardService {
  /**
   * Create flashcard manually
   * @param {string} userId - User ID
   * @param {Object} flashcardData - Flashcard data
   * @returns {Promise<Object>} Created flashcard
   */
  async createFlashcard(userId, { noteId = null, question, answer, difficulty = 'medium' }) {
    // If noteId provided, verify ownership
    if (noteId) {
      const note = await Note.findByPk(noteId);

      if (!note) {
        throw new NotFoundError('Note');
      }

      if (note.userId !== userId) {
        throw new AuthorizationError('You do not have access to this note');
      }
    }

    // Create flashcard
    const flashcard = await Flashcard.create({
      noteId,
      userId,
      question,
      answer,
      difficulty,
      status: 'new',
    });

    return flashcard;
  }

  /**
   * Get flashcard by ID
   * @param {string} flashcardId - Flashcard ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Flashcard
   */
  async getFlashcardById(flashcardId, userId) {
    const flashcard = await Flashcard.findOne({
      where: { id: flashcardId },
      include: [
        {
          model: Note,
          as: 'note',
          attributes: ['id', 'content', 'timestamp', 'videoId'],
        },
      ],
    });

    if (!flashcard) {
      throw new NotFoundError('Flashcard');
    }

    if (flashcard.userId !== userId) {
      throw new AuthorizationError('You do not have access to this flashcard');
    }

    return flashcard;
  }

  /**
   * Get all flashcards for user
   * @param {string} userId - User ID
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Flashcards and pagination
   */
  async getUserFlashcards(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      status = null,
      difficulty = null,
      dueOnly = false,
    } = options;

    const offset = (page - 1) * limit;

    const where = { userId };

    if (status) {
      where.status = status;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (dueOnly) {
      where[Op.or] = [
        { nextReview: null },
        { nextReview: { [Op.lte]: new Date() } },
      ];
    }

    const { count, rows: flashcards } = await Flashcard.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['nextReview', 'ASC NULLS FIRST']],
      include: [
        {
          model: Note,
          as: 'note',
          attributes: ['id', 'content'],
        },
      ],
    });

    return {
      flashcards,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get due flashcards for review
   * @param {string} userId - User ID
   * @param {number} limit - Max cards to return
   * @returns {Promise<Array>} Due flashcards
   */
  async getDueFlashcards(userId, limit = 20) {
    const flashcards = await Flashcard.findAll({
      where: {
        userId,
        [Op.or]: [
          { nextReview: null },
          { nextReview: { [Op.lte]: new Date() } },
        ],
      },
      limit: parseInt(limit),
      order: [
        ['nextReview', 'ASC NULLS FIRST'],
        ['createdAt', 'ASC'],
      ],
    });

    return flashcards;
  }

  /**
   * Update flashcard
   * @param {string} flashcardId - Flashcard ID
   * @param {string} userId - User ID
   * @param {Object} updates - Flashcard updates
   * @returns {Promise<Object>} Updated flashcard
   */
  async updateFlashcard(flashcardId, userId, updates) {
    const flashcard = await Flashcard.findByPk(flashcardId);

    if (!flashcard) {
      throw new NotFoundError('Flashcard');
    }

    if (flashcard.userId !== userId) {
      throw new AuthorizationError('You do not have permission to update this flashcard');
    }

    // Only allow updating specific fields
    const allowedUpdates = ['question', 'answer', 'difficulty'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    await flashcard.update(filteredUpdates);

    return flashcard;
  }

  /**
   * Delete flashcard
   * @param {string} flashcardId - Flashcard ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteFlashcard(flashcardId, userId) {
    const flashcard = await Flashcard.findByPk(flashcardId);

    if (!flashcard) {
      throw new NotFoundError('Flashcard');
    }

    if (flashcard.userId !== userId) {
      throw new AuthorizationError('You do not have permission to delete this flashcard');
    }

    await flashcard.destroy();
  }

  /**
   * Review flashcard and update using SM-2 algorithm
   * @param {string} flashcardId - Flashcard ID
   * @param {string} userId - User ID
   * @param {number} quality - Quality rating (0-5)
   * @param {number} timeTaken - Time taken in milliseconds
   * @returns {Promise<Object>} Updated flashcard and next review date
   */
  async reviewFlashcard(flashcardId, userId, quality, timeTaken = null) {
    const flashcard = await Flashcard.findByPk(flashcardId);

    if (!flashcard) {
      throw new NotFoundError('Flashcard');
    }

    if (flashcard.userId !== userId) {
      throw new AuthorizationError('You do not have access to this flashcard');
    }

    // Validate quality rating
    if (quality < 0 || quality > 5) {
      throw new ValidationError('Quality rating must be between 0 and 5');
    }

    // Calculate next review using SM-2 algorithm
    const srData = flashcard.calculateNextReview(quality);

    // Update performance metrics
    const correct = quality >= 3;
    const newCorrectCount = flashcard.correctCount + (correct ? 1 : 0);
    const newIncorrectCount = flashcard.incorrectCount + (correct ? 0 : 1);
    const totalReviews = newCorrectCount + newIncorrectCount;
    const retentionScore = totalReviews > 0 ? newCorrectCount / totalReviews : 0;

    // Determine status
    let status = 'learning';
    if (flashcard.reviewCount > 0 && srData.reviewCount > 3 && retentionScore > 0.8) {
      status = 'reviewing';
    }
    if (srData.reviewCount > 10 && retentionScore > 0.9) {
      status = 'mastered';
    }

    // Update flashcard
    await flashcard.update({
      lastReviewed: new Date(),
      nextReview: srData.nextReview,
      reviewCount: srData.reviewCount,
      easeFactor: srData.easeFactor,
      intervalDays: srData.intervalDays,
      correctCount: newCorrectCount,
      incorrectCount: newIncorrectCount,
      retentionScore,
      status,
    });

    // Create review session record
    await ReviewSession.create({
      userId,
      flashcardId,
      qualityRating: quality,
      timeTaken,
      correct,
    });

    return {
      flashcard,
      nextReview: srData.nextReview,
      intervalDays: srData.intervalDays,
      status,
    };
  }

  /**
   * Get review statistics for user
   * @param {string} userId - User ID
   * @param {string} period - Time period (day, week, month, all)
   * @returns {Promise<Object>} Review statistics
   */
  async getReviewStats(userId, period = 'all') {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = null;
    }

    const where = { userId };
    if (startDate) {
      where.sessionDate = { [Op.gte]: startDate };
    }

    // Get review sessions
    const sessions = await ReviewSession.findAll({
      where,
      order: [['sessionDate', 'DESC']],
    });

    // Get flashcard counts
    const totalCards = await Flashcard.count({ where: { userId } });
    const newCards = await Flashcard.count({ where: { userId, status: 'new' } });
    const learningCards = await Flashcard.count({ where: { userId, status: 'learning' } });
    const reviewingCards = await Flashcard.count({ where: { userId, status: 'reviewing' } });
    const masteredCards = await Flashcard.count({ where: { userId, status: 'mastered' } });

    // Calculate streak
    const streak = await this._calculateStreak(userId);

    // Aggregate session data
    const totalReviews = sessions.length;
    const correctReviews = sessions.filter(s => s.correct).length;
    const avgRetention = totalReviews > 0 ? correctReviews / totalReviews : 0;

    return {
      totalReviews,
      correctReviews,
      avgRetention: Math.round(avgRetention * 100) / 100,
      totalCards,
      cardsByStatus: {
        new: newCards,
        learning: learningCards,
        reviewing: reviewingCards,
        mastered: masteredCards,
      },
      streakDays: streak,
      reviewsToday: await this._getReviewsForDate(userId, new Date()),
      period,
    };
  }

  /**
   * Calculate study streak (consecutive days with reviews)
   * @private
   */
  async _calculateStreak(userId) {
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    while (true) {
      const reviewCount = await this._getReviewsForDate(userId, currentDate);

      if (reviewCount === 0) {
        break;
      }

      streak++;
      currentDate.setDate(currentDate.getDate() - 1);

      // Safety limit
      if (streak > 365) break;
    }

    return streak;
  }

  /**
   * Get review count for specific date
   * @private
   */
  async _getReviewsForDate(userId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await ReviewSession.count({
      where: {
        userId,
        sessionDate: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });
  }

  /**
   * Bulk create flashcards (for AI generation)
   * @param {string} userId - User ID
   * @param {string} noteId - Note ID (optional)
   * @param {Array} flashcardsData - Array of flashcard data
   * @returns {Promise<Array>} Created flashcards
   */
  async bulkCreateFlashcards(userId, noteId, flashcardsData) {
    // Prepare flashcards for bulk insert
    const flashcards = flashcardsData.map(data => ({
      userId,
      noteId,
      question: data.question,
      answer: data.answer,
      difficulty: data.difficulty || 'medium',
      status: 'new',
    }));

    // Bulk create
    const createdFlashcards = await Flashcard.bulkCreate(flashcards);

    return createdFlashcards;
  }
}

export default new FlashcardService();
