/**
 * Flashcard Model Tests
 * Tests for flashcard model and SM-2 algorithm
 */

import { Flashcard, User, Course, Video } from '../../src/models/index.js';

describe('Flashcard Model', () => {
  let user, course, video;

  beforeEach(async () => {
    user = await global.testHelpers.createUser();
    course = await global.testHelpers.createCourse(user.id);
    video = await global.testHelpers.createVideo(course.id);
  });

  describe('Creation', () => {
    test('should create a flashcard with valid data', async () => {
      const flashcard = await Flashcard.create({
        userId: user.id,
        videoId: video.id,
        front: 'What is React?',
        back: 'A JavaScript library for building user interfaces',
      });

      expect(flashcard.id).toBeDefined();
      expect(flashcard.front).toBe('What is React?');
      expect(flashcard.back).toBe('A JavaScript library for building user interfaces');
    });

    test('should fail without required fields', async () => {
      await expect(Flashcard.create({})).rejects.toThrow();
    });

    test('should set default values', async () => {
      const flashcard = await Flashcard.create({
        userId: user.id,
        videoId: video.id,
        front: 'Question?',
        back: 'Answer',
      });

      expect(flashcard.status).toBe('new');
      expect(flashcard.easeFactor).toBe(2.5);
      expect(flashcard.intervalDays).toBe(0);
      expect(flashcard.reviewCount).toBe(0);
      expect(flashcard.difficulty).toBe('medium');
    });
  });

  describe('SM-2 Algorithm', () => {
    let flashcard;

    beforeEach(async () => {
      flashcard = await Flashcard.create({
        userId: user.id,
        videoId: video.id,
        front: 'Question?',
        back: 'Answer',
      });
    });

    test('should calculate next review for quality < 3 (Again)', async () => {
      const result = flashcard.calculateNextReview(0);

      expect(result.reviewCount).toBe(0);
      expect(result.intervalDays).toBe(1);
      expect(result.nextReview).toBeInstanceOf(Date);
    });

    test('should calculate next review for first review (Good)', async () => {
      const result = flashcard.calculateNextReview(4);

      expect(result.reviewCount).toBe(1);
      expect(result.intervalDays).toBe(1);
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    test('should calculate next review for second review (Good)', async () => {
      flashcard.reviewCount = 1;
      const result = flashcard.calculateNextReview(4);

      expect(result.reviewCount).toBe(2);
      expect(result.intervalDays).toBe(6);
    });

    test('should calculate increasing intervals for subsequent reviews', async () => {
      flashcard.reviewCount = 2;
      flashcard.intervalDays = 6;
      flashcard.easeFactor = 2.5;

      const result = flashcard.calculateNextReview(4);

      expect(result.reviewCount).toBe(3);
      expect(result.intervalDays).toBeGreaterThan(6);
    });

    test('should adjust ease factor based on quality', async () => {
      // Easy (quality 5) should increase ease factor
      const easyResult = flashcard.calculateNextReview(5);
      expect(easyResult.easeFactor).toBeGreaterThan(2.5);

      // Hard (quality 2) should decrease ease factor
      flashcard.easeFactor = 2.5;
      const hardResult = flashcard.calculateNextReview(2);
      expect(hardResult.easeFactor).toBeLessThan(2.5);
    });

    test('should maintain minimum ease factor of 1.3', async () => {
      flashcard.easeFactor = 1.4;
      const result = flashcard.calculateNextReview(0);

      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('Update Status', () => {
    let flashcard;

    beforeEach(async () => {
      flashcard = await Flashcard.create({
        userId: user.id,
        videoId: video.id,
        front: 'Question?',
        back: 'Answer',
      });
    });

    test('should update status from new to learning', () => {
      const newStatus = flashcard.updateStatus(3);
      expect(newStatus).toBe('learning');
    });

    test('should update status to reviewing after 3+ reviews', async () => {
      flashcard.reviewCount = 2;
      const newStatus = flashcard.updateStatus(3);
      expect(newStatus).toBe('reviewing');
    });

    test('should update status to mastered after 8+ reviews', async () => {
      flashcard.reviewCount = 7;
      const newStatus = flashcard.updateStatus(4);
      expect(newStatus).toBe('mastered');
    });
  });

  describe('IsDue Method', () => {
    let flashcard;

    beforeEach(async () => {
      flashcard = await Flashcard.create({
        userId: user.id,
        videoId: video.id,
        front: 'Question?',
        back: 'Answer',
      });
    });

    test('should return true for new flashcards', () => {
      expect(flashcard.isDue()).toBe(true);
    });

    test('should return true for overdue flashcards', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      flashcard.nextReview = yesterday;

      expect(flashcard.isDue()).toBe(true);
    });

    test('should return false for future reviews', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      flashcard.nextReview = tomorrow;

      expect(flashcard.isDue()).toBe(false);
    });
  });

  describe('Relationships', () => {
    test('should belong to user', async () => {
      const flashcard = await Flashcard.create({
        userId: user.id,
        videoId: video.id,
        front: 'Question?',
        back: 'Answer',
      });

      const foundFlashcard = await Flashcard.findByPk(flashcard.id, {
        include: User,
      });

      expect(foundFlashcard.User).toBeDefined();
      expect(foundFlashcard.User.id).toBe(user.id);
    });

    test('should belong to video', async () => {
      const flashcard = await Flashcard.create({
        userId: user.id,
        videoId: video.id,
        front: 'Question?',
        back: 'Answer',
      });

      const foundFlashcard = await Flashcard.findByPk(flashcard.id, {
        include: Video,
      });

      expect(foundFlashcard.Video).toBeDefined();
      expect(foundFlashcard.Video.id).toBe(video.id);
    });
  });
});
