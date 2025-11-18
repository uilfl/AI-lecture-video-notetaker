/**
 * Flashcard Service Tests
 * Tests for flashcard business logic and SM-2 algorithm
 */

import * as flashcardService from '../../src/services/flashcardService.js';
import { Flashcard } from '../../src/models/index.js';

describe('Flashcard Service', () => {
  let user, course, video;

  beforeEach(async () => {
    user = await global.testHelpers.createUser();
    course = await global.testHelpers.createCourse(user.id);
    video = await global.testHelpers.createVideo(course.id);
  });

  describe('createFlashcard', () => {
    test('should create a flashcard', async () => {
      const flashcard = await flashcardService.createFlashcard({
        userId: user.id,
        videoId: video.id,
        front: 'What is React?',
        back: 'A JavaScript library',
      });

      expect(flashcard.id).toBeDefined();
      expect(flashcard.front).toBe('What is React?');
      expect(flashcard.status).toBe('new');
    });

    test('should create multiple flashcards in bulk', async () => {
      const flashcards = await flashcardService.createFlashcards(user.id, video.id, [
        { front: 'Q1?', back: 'A1' },
        { front: 'Q2?', back: 'A2' },
        { front: 'Q3?', back: 'A3' },
      ]);

      expect(flashcards).toHaveLength(3);
      expect(flashcards[0].front).toBe('Q1?');
      expect(flashcards[2].front).toBe('Q3?');
    });
  });

  describe('getFlashcards', () => {
    beforeEach(async () => {
      await flashcardService.createFlashcard({
        userId: user.id,
        videoId: video.id,
        front: 'Question 1?',
        back: 'Answer 1',
      });

      await flashcardService.createFlashcard({
        userId: user.id,
        videoId: video.id,
        front: 'Question 2?',
        back: 'Answer 2',
        status: 'learning',
      });
    });

    test('should get all user flashcards', async () => {
      const flashcards = await flashcardService.getFlashcards(user.id);

      expect(flashcards).toHaveLength(2);
    });

    test('should filter by status', async () => {
      const newCards = await flashcardService.getFlashcards(user.id, {
        status: 'new',
      });

      expect(newCards).toHaveLength(1);
      expect(newCards[0].status).toBe('new');
    });

    test('should filter by video', async () => {
      const video2 = await global.testHelpers.createVideo(course.id);
      await flashcardService.createFlashcard({
        userId: user.id,
        videoId: video2.id,
        front: 'Different video?',
        back: 'Yes',
      });

      const video1Cards = await flashcardService.getFlashcards(user.id, {
        videoId: video.id,
      });

      expect(video1Cards).toHaveLength(2);
    });
  });

  describe('getDueFlashcards', () => {
    test('should get new flashcards', async () => {
      await flashcardService.createFlashcard({
        userId: user.id,
        videoId: video.id,
        front: 'Question?',
        back: 'Answer',
      });

      const dueCards = await flashcardService.getDueFlashcards(user.id);

      expect(dueCards).toHaveLength(1);
    });

    test('should get overdue flashcards', async () => {
      const flashcard = await flashcardService.createFlashcard({
        userId: user.id,
        videoId: video.id,
        front: 'Question?',
        back: 'Answer',
      });

      // Set next review to yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await flashcard.update({ nextReview: yesterday, status: 'reviewing' });

      const dueCards = await flashcardService.getDueFlashcards(user.id);

      expect(dueCards).toHaveLength(1);
    });

    test('should not get future flashcards', async () => {
      const flashcard = await flashcardService.createFlashcard({
        userId: user.id,
        videoId: video.id,
        front: 'Question?',
        back: 'Answer',
      });

      // Set next review to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await flashcard.update({ nextReview: tomorrow, status: 'reviewing' });

      const dueCards = await flashcardService.getDueFlashcards(user.id);

      expect(dueCards).toHaveLength(0);
    });

    test('should limit results', async () => {
      for (let i = 0; i < 10; i++) {
        await flashcardService.createFlashcard({
          userId: user.id,
          videoId: video.id,
          front: `Question ${i}?`,
          back: `Answer ${i}`,
        });
      }

      const dueCards = await flashcardService.getDueFlashcards(user.id, 5);

      expect(dueCards).toHaveLength(5);
    });
  });

  describe('reviewFlashcard', () => {
    let flashcard;

    beforeEach(async () => {
      flashcard = await flashcardService.createFlashcard({
        userId: user.id,
        videoId: video.id,
        front: 'Question?',
        back: 'Answer',
      });
    });

    test('should review flashcard with Good quality', async () => {
      const reviewed = await flashcardService.reviewFlashcard(flashcard.id, 4);

      expect(reviewed.status).toBe('learning');
      expect(reviewed.reviewCount).toBe(1);
      expect(reviewed.lastReviewedAt).toBeDefined();
    });

    test('should review flashcard with Again quality', async () => {
      const reviewed = await flashcardService.reviewFlashcard(flashcard.id, 0);

      expect(reviewed.reviewCount).toBe(0);
      expect(reviewed.intervalDays).toBe(1);
    });

    test('should update status after multiple reviews', async () => {
      // First review
      let reviewed = await flashcardService.reviewFlashcard(flashcard.id, 4);
      expect(reviewed.status).toBe('learning');

      // Second review
      reviewed = await flashcardService.reviewFlashcard(flashcard.id, 4);
      expect(reviewed.status).toBe('learning');

      // Third review - should become 'reviewing'
      reviewed = await flashcardService.reviewFlashcard(flashcard.id, 4);
      expect(reviewed.status).toBe('reviewing');
    });

    test('should validate quality range', async () => {
      await expect(
        flashcardService.reviewFlashcard(flashcard.id, 6)
      ).rejects.toThrow();

      await expect(
        flashcardService.reviewFlashcard(flashcard.id, -1)
      ).rejects.toThrow();
    });
  });

  describe('getStatistics', () => {
    beforeEach(async () => {
      // Create flashcards with different statuses
      await flashcardService.createFlashcard({
        userId: user.id,
        videoId: video.id,
        front: 'Q1?',
        back: 'A1',
        status: 'new',
      });

      await flashcardService.createFlashcard({
        userId: user.id,
        videoId: video.id,
        front: 'Q2?',
        back: 'A2',
        status: 'learning',
      });

      await flashcardService.createFlashcard({
        userId: user.id,
        videoId: video.id,
        front: 'Q3?',
        back: 'A3',
        status: 'mastered',
      });
    });

    test('should get user statistics', async () => {
      const stats = await flashcardService.getStatistics(user.id);

      expect(stats.total).toBe(3);
      expect(stats.new).toBe(1);
      expect(stats.learning).toBe(1);
      expect(stats.reviewing).toBe(0);
      expect(stats.mastered).toBe(1);
    });

    test('should count due cards', async () => {
      const stats = await flashcardService.getStatistics(user.id);

      // New card should be due
      expect(stats.due).toBeGreaterThan(0);
    });
  });

  describe('updateFlashcard', () => {
    let flashcard;

    beforeEach(async () => {
      flashcard = await flashcardService.createFlashcard({
        userId: user.id,
        videoId: video.id,
        front: 'Question?',
        back: 'Answer',
      });
    });

    test('should update flashcard content', async () => {
      const updated = await flashcardService.updateFlashcard(flashcard.id, {
        front: 'New Question?',
        back: 'New Answer',
      });

      expect(updated.front).toBe('New Question?');
      expect(updated.back).toBe('New Answer');
    });

    test('should update difficulty', async () => {
      const updated = await flashcardService.updateFlashcard(flashcard.id, {
        difficulty: 'hard',
      });

      expect(updated.difficulty).toBe('hard');
    });
  });

  describe('deleteFlashcard', () => {
    let flashcard;

    beforeEach(async () => {
      flashcard = await flashcardService.createFlashcard({
        userId: user.id,
        videoId: video.id,
        front: 'Question?',
        back: 'Answer',
      });
    });

    test('should delete flashcard', async () => {
      await flashcardService.deleteFlashcard(flashcard.id);

      const found = await Flashcard.findByPk(flashcard.id);
      expect(found).toBeNull();
    });
  });
});
